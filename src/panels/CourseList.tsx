import { useQuery, gql } from '@apollo/client';
import {QueryPage, Class, MeetingType, Meeting, LinkedSection} from '../GraphQLModels';
import './CourseList.css'
import { useState } from 'react';
import {formatDays, formatTime} from '../Utilities';
import Loading from '../components/Loading';

const GET_CLASSES = gql`
    query($cursor: String) {
        terms
        subjects {
            name
            subject1
        }
        meetingTypes {
            id
            name
            type
        }
        classes(term: 202330, first: 5000, after: $cursor, order: [{courseNumber: ASC}]) {
            totalCount
            pageInfo {
                hasNextPage
                endCursor
            }
            nodes {
                id
                courseReferenceNumber
                courseTitle
                courseNumber
                creditHours
                faculty {
                    professor {
                        fullName
                    }
                }
                meetings {
                    beginTime
                    endTime
                    beginDate
                    endDate
                    meetingType
                    building
                    room
                    inSession
                }
                linkedSections {
                    parent
                    child
                }
                seatsAvailable
                maximumEnrollment
            }
        }
    }
`;

class CourseDisplayState {
    courses: Map<number, Class> = new Map<number, Class>();
    terms: number[] = [];
    meetingTypes: Map<number, MeetingType> = new Map<number, MeetingType>();
    subjects: Map<string, string> = new Map<string, string>([["loading", "Loading..."], ["error", "Error!"]]);
}

const GenerateLinkedSections: Function = (sections: LinkedSection[] | null | undefined): JSX.Element[] => {
    const result: JSX.Element[] = [];

    /*
    for (const item of sections) {
        result.push(<a key={item.childNavigation?.id} href={"#link-to-" + item.childNavigation?.id}>{item.childNavigation?.courseReferenceNumber}</a>);
    }*/
    return result;
}

function DisplayCourses(state: CourseDisplayState, setCurrentState: (value: (((prevState: CourseDisplayState) => CourseDisplayState) | CourseDisplayState)) => void): Map<string, JSX.Element[]> {
    const { loading, error, data } = useQuery(GET_CLASSES, {
        variables: { cursor: null }
    });

    const map = new Map<string, JSX.Element[]>();

    if (loading) {
        map.set("loading", [<tr key="load"><td colSpan={100}><Loading /></td></tr>]);
        return map;
    }

    if (error){
        map.set("error", [<tr key="error"><td colSpan={100}>Error~ {error.message}</td></tr>]);
        return map;
    }

    let update = false;
    if (state.courses.size === 0) {
        for (const item of data.classes.nodes) {
            state.courses.set(item.id, item);
        }
        update = true;
    }

    if (state.terms.length === 0) {
        state.terms = data.terms;
        update = true;
    }

    if (state.subjects.size === 2) { // loading and error only
        for (const item of data.subjects) {
            state.subjects.set(item.subject1, item.name);
        }
        update = true;
    }

    if (state.meetingTypes.size === 0) {
        for (const item of data.meetingTypes) {
            state.meetingTypes.set(item.id, item);
        }
        update = true;
    }

    if (update) {
        setCurrentState(state);
    }

    let classes: QueryPage<Class> = data.classes;

    for (const item of classes.nodes) {
        const meetings = [...item.meetings];
        meetings.sort((a, b) => a.meetingType - b.meetingType);
        const mainMeeting = meetings[0];
        let secondaryMeeting: Meeting | null = meetings[meetings.length - 1];
        if (mainMeeting.meetingType === secondaryMeeting.meetingType) {
            secondaryMeeting = null;
        }

        const row = (
            <tr key={item.id.toString()}>
                <td>{item.courseReferenceNumber}</td>
                <td>{item.courseTitle}</td>
                <td>{item.courseNumber}</td>
                <td>{item.creditHours}</td>
                <td>{state.meetingTypes.get(mainMeeting.meetingType)?.name}</td>
                <td>{mainMeeting.beginDate} - {mainMeeting.endDate}</td>
                <td>{formatDays(mainMeeting.inSession)}</td>
                <td>{mainMeeting.building} {mainMeeting.room}</td>
                <td>{formatTime(mainMeeting.beginTime)} - {formatTime(mainMeeting.endTime)}</td>
                <td>{item.faculty.map(o => o.professor?.fullName).filter(o => o != null).join(" / ")}</td>
                <td>{item.maximumEnrollment}</td>
                <td>{item.maximumEnrollment - item.seatsAvailable}</td>
                <td>{item.seatsAvailable}</td>
                <td>{item.waitCapacity ?? "N/A"}</td>
                <td>{item.waitCapacity == null || item.waitAvailable == null ? "N/A" : (item.waitCapacity - item.waitAvailable)}</td>
                <td>{item.waitAvailable ?? "N/A"}</td>
                <td>{secondaryMeeting == null ? "N/A" : state.meetingTypes.get(secondaryMeeting.meetingType)?.name}</td>
                <td>{secondaryMeeting == null ? "N/A" : secondaryMeeting.beginDate + " " + secondaryMeeting.endDate}</td>
                <td>{secondaryMeeting == null ? "N/A" : formatDays(secondaryMeeting.inSession)}</td>
                <td>{secondaryMeeting == null ? "N/A" : secondaryMeeting.building + " " + secondaryMeeting.room}</td>
                <td>{secondaryMeeting == null ? "N/A" : formatTime(secondaryMeeting.beginTime) + " " + formatTime(secondaryMeeting.endTime)}</td>
                <td><GenerateLinkedSections sections={item.linkedSections}/></td>
            </tr>
        );

        const subject = item.courseNumber.split('-')[0];

        if (map.has(subject)) {
            map.get(subject)?.push(row);
        } else {
            map.set(subject, [row]);
        }
    }

    return map;
}

const Classes: Function = (): JSX.Element[] => {
    const [state, setState] = useState(new CourseDisplayState());

    const courses = DisplayCourses(state, setState);

    const output: JSX.Element[] = [];

    for (const [key, value] of Array.from(courses.entries())) {
        const group = (
            <div key={key} className="class-group">
                <h1>{state.subjects.get(key)}</h1>
                <div className="class-table">
                    <table>
                        <thead>
                        <tr>
                            <th>CRN</th>
                            <th>Course Title</th>
                            <th>Course Number</th>
                            <th>Units</th>
                            <th>Type</th>
                            <th>Days</th>
                            <th>Hours</th>
                            <th>Room</th>
                            <th>Dates</th>
                            <th>Instructor(s)</th>
                            <th>Capacity</th>
                            <th>Enrolled</th>
                            <th>Available</th>
                            <th>Waitlist Capacity</th>
                            <th>Waitlist Enrolled</th>
                            <th>Waitlist Available</th>
                            <th>Final Type</th>
                            <th>Final Day</th>
                            <th>Final Hours</th>
                            <th>Final Room</th>
                            <th>Final Dates</th>
                            <th>Linked Courses</th>
                        </tr>
                        </thead>
                        <tbody>
                        {value}
                        </tbody>
                    </table>
                </div>
            </div>
        );

        output.push(group);
    }

    return output;
}

export default Classes;