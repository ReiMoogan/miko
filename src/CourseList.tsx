import { useQuery, gql } from '@apollo/client';
import { QueryPage, Class } from './GraphQLModels';
import './CourseList.css'
import { useState } from 'react';

const GET_CLASSES = gql`
    query($cursor: String) {
        terms
        stats {
            totalProfessors
            totalMeetings
            totalClasses
        }
        lastUpdate {
            tableName
            lastUpdate
        }
        subjects {
            name
            subject1
        }
        classes(term: 202230, first: 5000, after: $cursor, order: [{courseNumber: ASC}]) {
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
            }
        }
    }
`;

class CourseDisplayState {
    terms: number[] = [];
    subjects: Map<string, string> = new Map<string, string>([["loading", "Loading..."], ["error", "Error!"]]);
}

function DisplayCourses(state: CourseDisplayState, setCurrentState: (value: (((prevState: CourseDisplayState) => CourseDisplayState) | CourseDisplayState)) => void): Map<string, JSX.Element[]> {
    const { loading, error, data } = useQuery(GET_CLASSES, {
        variables: { cursor: null }
    });

    const map = new Map<string, JSX.Element[]>();

    if (loading) {
        map.set("loading", [<tr key="load"><td colSpan={100}>Now loading, please wait warmly...</td></tr>]);
        return map;
    }

    if (error){
        map.set("error", [<tr key="error"><td colSpan={100}>Error~ {error.message}</td></tr>]);
        return map;
    }

    if (state.terms.length === 0) {
        state.terms = data.terms;
        setCurrentState(state);
    }

    if (state.subjects.size === 2) {
        for (const item of data.subjects) {
            state.subjects.set(item.subject1, item.name);
        }
        setCurrentState(state);
    }

    let classes: QueryPage<Class> = data.classes;

    for (const item of classes.nodes) {
        const row = (
            <tr key={item.id.toString()}>
                <td>{item.courseReferenceNumber}</td>
                <td>{item.courseTitle}</td>
                <td>{item.courseNumber}</td>
                <td>{item.creditHours}</td>
                <td>{item.courseReferenceNumber}</td>
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

const DisplayGroups: Function = (): JSX.Element[] => {
    const [state, setState] = useState(new CourseDisplayState());

    const courses = DisplayCourses(state, setState);

    const output: JSX.Element[] = [];

    for (const [key, value] of Array.from(courses.entries())) {
        const group = (
            <div key={key}>
                <h1>{state.subjects.get(key)}</h1>
                <table>
                    <thead>
                    <tr>
                        <th>CRN</th>
                        <th>Course Title</th>
                        <th>Course Number</th>
                        <th>Course Name</th>
                        <th>Units</th>
                    </tr>
                    </thead>
                    <tbody>
                    {value}
                    </tbody>
                </table>
            </div>
        );

        output.push(group);
    }

    return output;
}

export { DisplayGroups };