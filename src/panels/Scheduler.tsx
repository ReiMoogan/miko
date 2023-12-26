import { useEffect, useState } from "react";
import init, { solve } from "moogan_course_scheduler";
import { Class, Faculty, Professor, QueryPage } from "../GraphQLModels";

const daySeconds = 3600*24;
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

class TrieNode<T> {
    values: T[] = [];
    next: TrieNode<T>[] = [...Array(256)];
}

class Trie<T> {
    root = new TrieNode<T>();
    insert(key: string, value: T) {
        let curr = this.root;

        for (const ch of key.split("")) {
            const chCode = ch.charCodeAt(0);
            if (curr.next[chCode] === undefined) {
                curr.next[chCode] = new TrieNode<T>();
            }

            curr = curr.next[chCode];
        }

        curr.values.push(value);
    }

    get_all(prefix: string) {
        let curr = this.root;
        const result: T[] = [...this.root.values];

        for (const ch of prefix.split("")) {
            const chCode = ch.charCodeAt(0);
            if (curr.next[chCode] === undefined) {
                return result;
            }

            curr = curr.next[chCode];
        }

        const stack: TrieNode<T>[] = [curr];
        while (stack.length > 0) {
            const u = stack.pop() as TrieNode<T>;
            u.values.forEach(val => result.push(val));
            for (const v of u.next) {
                if (v === undefined) continue;
                stack.push(v);
            }
        }

        return result;
    }
}

interface SectionMeeting {
    u_start: number,
    u_end: number,
    section_id: number,
    lecture_id: number,
    section_name: string,
    meeting_type: string
}

const to12hr = (seconds: number) => {
    seconds = (seconds % (24*3600));
    const suffix = seconds / 3600 >= 12 ? "PM" : "AM";
    const int12hr = Math.floor(seconds / 3600) % 12 || 12;
    const minutes = Math.floor((seconds % 3600) / 60);
    const min0pad = minutes < 10 ? "0": "";
    const hour0pad = int12hr < 10 ? "0" : "";

    return `${hour0pad}${int12hr}:${min0pad}${minutes}${suffix}`;
}

// https://stackoverflow.com/a/7616484
const hash = (s: string) => {
    let hash = 0,
      i, chr;
    if (s.length === 0) return hash;
    for (i = 0; i < s.length; i++) {
      chr = s.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }

    return hash;
  }

const str2squeezedRGB = (s: string, lo: number, hi: number) => {
    const [loR, loG, loB] = [(lo & 0x00FF0000)>>16, (lo & 0x0000FF00)>>8, (lo & 0x000000FF)];
    const [hiR, hiG, hiB] = [(hi & 0x00FF0000)>>16, (hi & 0x0000FF00)>>8, (hi & 0x000000FF)];
    const h = Math.floor((hash(s) / 0xFFFFFFFF)*0x00FFFFFF);
    const [hR, hG, hB] = [(h & 0x00FF0000)>>16, (h & 0x0000FF00)>>8, (h & 0x000000FF)];
    const r = Math.floor(hR / 0xFF * (hiR-loR) + loR);
    const g = Math.floor(hG / 0xFF * (hiG-loG) + loG);
    const b = Math.floor(hB / 0xFF * (hiB-loB) + loB);

    return (r << 16) + (g << 8) + b;
}

const CRNElement: Function = (props: { crn: number, prof: string, courseShort: string, courseName: string }): JSX.Element => {
    const { crn, prof, courseShort, courseName } = props;
    return (
        <p> { crn } - { courseShort } - { courseName } - { prof } </p>
    )
}

const CourseSuggestionList: Function = (props: { suggestions: Class[], addCourseToList: Function}): JSX.Element => {
    const addCourseToList = props.addCourseToList;
    const suggestedCoursesJSX = props.suggestions.map(cl => 
        <div style={{display: "flex", marginTop: "-3vh"}}>
            <CRNElement key={cl.id} crn={cl.courseReferenceNumber} 
                        prof={cl.faculty.map(f => f.professor?.fullName).join(',')} courseShort={cl.courseNumber} courseName={cl.courseTitle} />
            <button style={{ alignSelf: "center", marginLeft: "1vh"}} onClick={ () => addCourseToList(cl) }>+</button> 
        </div>
    )   

    return (
        <div style={{marginTop: "3vh"}}> { suggestedCoursesJSX } </div>
    )
}

const CourseAddedList: Function = (props: { courseList: Class[], removeCourseList: Function}): JSX.Element => {
    const removeCourseList = props.removeCourseList;
    const addedCoursesJSX = props.courseList.map(cl => 
        <div style={{display: "flex", marginTop: "-3vh"}}>
            <CRNElement key={cl.id} crn={cl.courseReferenceNumber} 
                        prof={cl.faculty.map(f => f.professor?.fullName).join(',')} courseShort={cl.courseNumber} courseName={cl.courseTitle} />
            <button style={{ alignSelf: "center", marginLeft: "1vh"}} onClick={ () => removeCourseList(cl) }>-</button> 
        </div>
    )   

    return (
        <div style={{marginTop: "3vh"}}> { addedCoursesJSX } </div>
    )
}

const CRNEntryElement: Function = (props: any): JSX.Element => {
    // const [CRNElements, setcacheDataJSON] = useState({});
    const [CRNEntryValue, setCRNEntryValue] = useState("SWAG001");
    const [courseSuggestions, setCourseSuggestions] = useState([] as Class[]);
    const { courseAddedList, setCourseAddedList, shortTrie } = props;
    
    const addQueryCourseMatches = (query: string) => {
        if (query.length === 0) return;
        setCourseSuggestions(shortTrie.get_all(query));
    }

    const addCourseToList = (course: Class) => {
        setCourseAddedList([...courseAddedList, course]);
    }

    const removeCourseList = (course: Class) => {
        setCourseAddedList(courseAddedList.filter((cl: Class) => cl.id !== course.id));
    }

    return (
        <div> 
            <CourseAddedList courseList={courseAddedList} removeCourseList={removeCourseList} />
            Enter short course name (CSE-031, yes include the 0 and hyphen)
            <div>
                <input type="text" style={{width: "40vh"}} placeholder="SWAG-001" onChange={ (evt) => addQueryCourseMatches(evt.target.value) } />
                <CourseSuggestionList suggestions={courseSuggestions} addCourseToList={addCourseToList} />
            </div>
        </div>
    )
}

const GeneratedSchedulesList: Function = (props: { generatedSchedules: SectionMeeting[][], IDToClass: Map<number, Class> }): JSX.Element => {
    let { generatedSchedules, IDToClass } = props;
    const [selectedPage, setSelectedPage] = useState(0);
    const [hoveredRow, setHoveredRow] = useState(-1);
    const [selectedRow, setselectedRow] = useState(-1);

    const sectionMeetingToString = (section: SectionMeeting) => {
        return `${section.section_name.substring(1, section.section_name.length-4)}${section.meeting_type[0]}`
    }

    const pageSize = 5; // 5 schedules per page    
    const pages: SectionMeeting[][][] = [...Array(Math.ceil(generatedSchedules.length/pageSize))].map(_ => []);
    generatedSchedules.forEach((schedule, idx) => {
        pages[Math.floor(idx / pageSize)].push(schedule);
    });

    const pageButtons = [...Array(pages.length)].map((_, idx) => {
        return <button onClick={ () => { 
            setSelectedPage(idx);
            setHoveredRow(-1); // reset hovered row 
            setselectedRow(-1); // reset selcted row 
        } }> { idx } </button> 
    })

    if (pages.length === 0 || selectedPage === -1) {
        return <></>
    } 

    return (
        <>
            <div style={{marginTop: "3vh"}}> 
                <table>
                    <thead>
                        <tr>
                            <th> CRNs </th>
                            <th style={{paddingLeft: "1em", paddingRight: "1em"}} colSpan={7}> 
                                Daily Workload (hours)
                                <th>Sunday - Saturday</th>
                            </th>
                            <th style={{paddingLeft: "1em", paddingRight: "1em"}}> Earliest </th>
                            <th style={{paddingLeft: "1em", paddingRight: "1em"}}> Latest </th>
                        </tr>
                    </thead>
                    <tbody>
                    { pages[selectedPage].map((schedule, row) => {
                        let bgcolor;
                        if (row === selectedRow) {
                            bgcolor = "#AAAAAA";
                        } else if (row === hoveredRow) {
                            bgcolor = "#EEEEEE";
                        } else { 
                            bgcolor = "#FFFFFF";
                        }

                        const uniqueIDs = [... new Set(schedule.map(section => section.section_id)) as any];
                        const CRNs = uniqueIDs.map(id => (IDToClass.get(id) as Class).courseReferenceNumber);
                        let earliest = daySeconds*24-1;
                        let latest = 0;
                        
                        let dayHours = [...Array(days.length)].map(_ => 0);
                        for (const meeting of schedule) {
                            if (meeting.u_end >= daySeconds*7) continue; // exam

                            const day = Math.floor(meeting.u_start/daySeconds);
                            const durationSeconds = meeting.u_end - meeting.u_start;

                            const start = meeting.u_start % daySeconds;
                            const end = meeting.u_end % daySeconds;

                            dayHours[day] += durationSeconds / 3600;

                            earliest = Math.min(earliest, start);
                            latest = Math.max(latest, end);
                        }

                        dayHours = dayHours.map(hrs => Math.round(hrs*10)/10);
 
                        return (<tr style={{ backgroundColor: bgcolor, cursor: "pointer"}}  onClick={ () => { setselectedRow(row) } } onMouseEnter={() => setHoveredRow(row) }>
                            <td>{ CRNs.join(", ") }</td>
                            { dayHours.map(hrs => <td style={{textAlign: "center"}}>{hrs}</td>) }
                            <td style={{textAlign: "center"}}>{to12hr(earliest)}</td>
                            <td style={{textAlign: "center"}}>{to12hr(latest)}</td>
                        </tr>);
                    }) } 
                    </tbody>
                </table>
            
            </div>
            <div style={{display: "flex", marginTop: "1vh"}}>
                Page: <div style={{marginLeft: "1vh"}}>{ pageButtons }</div>
            </div>
            { pages.length > 0 && selectedPage !== -1 && selectedRow !== -1 ? <CalendarView selectedSchedule={pages[selectedPage][selectedRow]} /> : <> </> }
        </>
    )
}

const CalendarView: Function = (props: { selectedSchedule: SectionMeeting[] }): JSX.Element => {
    const [viewMode, setViewMode] = useState("classes");
    const { selectedSchedule } = props;

    const startTime = 3600*7;  // 7am
    const endTime = 3600*23; // 11pm
    const timeLabelDivisions = 16;
    const timeTd = (<td>
        {[...Array(timeLabelDivisions).keys() as any].map(idx => {
            const pct = 100-idx/timeLabelDivisions*100; 
            return <div style={{height: `${pct}%`, position: "absolute", bottom: 0}}>{ to12hr(startTime + (endTime - startTime)/timeLabelDivisions*idx) }</div>
        })}
    </td>)

    selectedSchedule.sort((a, b) => a.u_start - b.u_start);

    const daysDivsJSX: JSX.Element[][] = days.map(_ => []);

    for (let meetingIdx = 0; meetingIdx < selectedSchedule.length; meetingIdx++) {
        const meeting = selectedSchedule[meetingIdx];

        if (viewMode === "classes" && meeting.u_start >= 3600*24*7) continue; // ignore exams
        if (viewMode === "exams" && meeting.u_start < 3600*24*7) continue; // ignore classes/discussion/labs

        const day = Math.floor((meeting.u_start - (viewMode === "exams" ? 7*daySeconds: 0)) / daySeconds);
        const timeStartSeconds = meeting.u_start % daySeconds;
        const timeEndSeconds = meeting.u_end % daySeconds;
        const divStartPct = (timeStartSeconds - startTime) / (endTime - startTime)*100;
        const divEndPct = (timeEndSeconds - startTime) / (endTime - startTime)*100;

        const sectionName = meeting.section_name.replaceAll('"', "")
        const bgColor = `#${str2squeezedRGB(sectionName, 0x4E4E4E, 0xEEEEEE).toString(16).padStart(2, '0')}`;

        daysDivsJSX[day].push(<div style={{width: "15vh", height: `${100-divStartPct}%`, fontSize: "1em",
            position: "absolute", bottom: 0, backgroundColor: bgColor, textAlign: "center"}}> {sectionName} 
            <div style={{fontSize: "0.75em"}}>{to12hr(timeStartSeconds)}-{to12hr(timeEndSeconds)}</div></div>)
        daysDivsJSX[day].push(<div style={{width: "15vh", height: `${100-divEndPct}%`, 
            position: "absolute", bottom: 0, backgroundColor: "white"}}>  </div>)
    }

    const daysJSX: JSX.Element[] = days.map((_, idx) => <td>{ daysDivsJSX[idx] }</td>);

    return (
        <>
        <table>
            <thead>
                <tr>
                    <th style={{width: "15vh"}}></th>
                    { days.map(day => <th style={{width: "15vh"}}>{ day }</th>) }
                </tr>
            </thead>
            <tbody>
                <tr style={{height: "75vh", position: "relative"}}>
                    {timeTd}
                    {daysJSX}
                </tr>
            </tbody>
        </table>
        <div style={{display: "flex", marginTop: "1vh"}}>
            See: <div style={{marginLeft: "1vh", paddingBottom: "5vh"}}>
                <button onClick={() => setViewMode("classes")}> Classes </button>
                <button onClick={() => setViewMode("exams")}> Exams </button>
            </div>
        </div>
        </>
    )
}

const Scheduler: Function = (): JSX.Element => {
    const [courseAddedList, setCourseAddedList] = useState([] as Class[]);
    const [schedulesList, setschedulesList] = useState([] as SectionMeeting[][]);
    
    const gqlDataJSON = JSON.parse(localStorage.getItem("cacheData") as string);
    const IDToClass: Map<number, Class> = new Map();
    const shortTrie = new Trie<Class>();

    let lectureMeetingTypeID = 0;
    for (let i = 0; i < gqlDataJSON.meetingTypes.length; i++) {
        if (gqlDataJSON.meetingTypes[i].type !== "LECT") continue;
        lectureMeetingTypeID = gqlDataJSON.meetingTypes[i].id
        break;
    }

    (gqlDataJSON.classes as QueryPage<Class>).nodes.forEach((c: Class) => {
        IDToClass.set(c.id, c);
        c.meetings.forEach(meet => {
            if (meet.meetingType === lectureMeetingTypeID) shortTrie.insert(c.courseNumber, c);
        })
    });
    let gen_schedules: Function;

    useEffect(() => {
        init().then(() => { 
            gen_schedules = solve;
        });
    });

    const addGeneratedSchedules = () => {
        const selectedCoursesAsBigIntArray = BigUint64Array.from(courseAddedList.map(cl => BigInt(cl.id)));
        const res: SectionMeeting[][] = gen_schedules(gqlDataJSON, selectedCoursesAsBigIntArray);
        setschedulesList(res);
    }

    return (
        <div style={{display: "flex"}}>
            <div style={{marginLeft: "5vh", marginTop: "5vh"}}> CSE 155 is my PASSION ✨
                <CRNEntryElement shortTrie={shortTrie} courseAddedList={courseAddedList} setCourseAddedList={setCourseAddedList} />
            </div>

            <div style={{marginLeft: "5vh", marginTop: "5vh"}}>
                <button onClick={ () => addGeneratedSchedules() }> Generate Schedules </button> 
                <p> YOUR SCHEDULES (click one) </p>
                <GeneratedSchedulesList IDToClass={IDToClass} generatedSchedules={schedulesList} />
            </div>
        </div>

    );
}

export default Scheduler;