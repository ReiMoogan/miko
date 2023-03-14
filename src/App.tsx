import React from 'react';
import './App.css';
import { useQuery, gql } from '@apollo/client';
import { QueryPage, Class } from './GraphQLModels';

const GET_CLASSES = gql`
    query($cursor: String) {
        classes(term: 202230, first: 500, after: $cursor, order: [{courseNumber: ASC}]) {
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
const DisplayCourses: Function = (): JSX.Element[] => {
    const { loading, error, data } = useQuery(GET_CLASSES, {
        variables: { cursor: null }
    });

    if (loading) return [<p key="load">Now loading, please wait warmly...</p>];
    if (error) return [<p key="error">Error~ {error.message}</p>];
    let typedData: QueryPage<Class> = data.classes;

    return typedData.nodes.map((item: Class) => (
        <tr key={item.id.toString()}>
            <td>{item.courseReferenceNumber}</td>
            <td>{item.courseTitle}</td>
            <td>{item.courseNumber}</td>
            <td>{item.creditHours}</td>
            <td>{item.courseReferenceNumber}</td>
        </tr>
    ));
}

function App() {
    return (
        <div className="App">
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
                    <DisplayCourses />
                </tbody>
            </table>
        </div>
    );
}

export default App;
