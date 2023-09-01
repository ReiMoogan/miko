import { useQuery, gql } from '@apollo/client';
import {QueryPage, Class, MeetingType, Meeting, LinkedSection} from '../GraphQLModels';
import './CourseList.css'
import { useState } from 'react';
import {formatDays, formatTime} from '../Utilities';
import Loading from '../components/Loading';
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

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
        if (state.courses.size !== 0)
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
        const mainMeeting = meetings[0] || {
            beginDate: null, beginTime: null, building: null,
            endDate: null, endTime: null, inSession: null, meetingType: null, room: null
        };

        let secondaryMeeting: Meeting | null = meetings[meetings.length - 1];
        if (secondaryMeeting && mainMeeting.meetingType === secondaryMeeting.meetingType) {
            secondaryMeeting = null;
        }

        const row = (
            <TableRow key={item.id.toString()}>
                <TableCell>{item.courseReferenceNumber}</TableCell>
                <TableCell>{item.courseTitle}</TableCell>
                <TableCell>{item.courseNumber}</TableCell>
                <TableCell>{item.creditHours}</TableCell>
                <TableCell>{state.meetingTypes.get(mainMeeting.meetingType)?.name}</TableCell>
                <TableCell>{mainMeeting.beginDate} - {mainMeeting.endDate}</TableCell>
                <TableCell>{formatDays(mainMeeting.inSession)}</TableCell>
                <TableCell>{mainMeeting.building} {mainMeeting.room}</TableCell>
                <TableCell>{formatTime(mainMeeting.beginTime)} - {formatTime(mainMeeting.endTime)}</TableCell>
                <TableCell>{item.faculty.map(o => o.professor?.fullName).filter(o => o != null).join(" / ")}</TableCell>
                <TableCell>{item.maximumEnrollment}</TableCell>
                <TableCell>{item.maximumEnrollment - item.seatsAvailable}</TableCell>
                <TableCell>{item.seatsAvailable}</TableCell>
                <TableCell>{item.waitCapacity ?? "N/A"}</TableCell>
                <TableCell>{item.waitCapacity == null || item.waitAvailable == null ? "N/A" : (item.waitCapacity - item.waitAvailable)}</TableCell>
                <TableCell>{item.waitAvailable ?? "N/A"}</TableCell>
                <TableCell>{secondaryMeeting == null ? "N/A" : state.meetingTypes.get(secondaryMeeting.meetingType)?.name}</TableCell>
                <TableCell>{secondaryMeeting == null ? "N/A" : secondaryMeeting.beginDate + " " + secondaryMeeting.endDate}</TableCell>
                <TableCell>{secondaryMeeting == null ? "N/A" : formatDays(secondaryMeeting.inSession)}</TableCell>
                <TableCell>{secondaryMeeting == null ? "N/A" : secondaryMeeting.building + " " + secondaryMeeting.room}</TableCell>
                <TableCell>{secondaryMeeting == null ? "N/A" : formatTime(secondaryMeeting.beginTime) + " " + formatTime(secondaryMeeting.endTime)}</TableCell>
                <TableCell><GenerateLinkedSections sections={item.linkedSections}/></TableCell>
            </TableRow>
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
            <Paper key={key} className="class-group" elevation={4}>
                <h1>{state.subjects.get(key)}</h1>
                <TableContainer className="class-table">
                    <Table stickyHeader>
                        <TableHead>
                        <TableRow>
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
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {value}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        );

        output.push(group);
    }

    return output;
}

export default Classes;