import React from 'react';
import './App.css';
import { useQuery, gql } from '@apollo/client';
import { QueryPage, Class } from './GraphQLModels';

const GET_CLASSES = gql`
    query($cursor: String) {
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

const SUBJECTS = new Map<string, string>([["loading", "Loading..."], ["error", "Error!"]]);

const DisplayCourses: Function = (): Map<string, JSX.Element[]> => {
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

    let typedData: QueryPage<Class> = data.classes;

    for (const item of typedData.nodes) {
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
    const courses = DisplayCourses();

    const output: JSX.Element[] = [];

    for (const [key, value] of courses) {
        const group = (
            <div key={key}>
                <h1>{key}</h1>
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

function App() {
    return (
        <div className="App">
            <DisplayGroups />
        </div>
    );
}

export default App;
