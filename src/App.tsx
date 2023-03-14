import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useQuery, gql } from '@apollo/client';
import { QueryPage, Class } from './GraphQLModels';

const GET_CLASSES = gql`
    query {
        classes(term: 202230) {
            totalCount
            pageInfo {
                hasNextPage
                endCursor
            }
            nodes {
                id
                courseReferenceNumber
                courseNumber
                courseTitle
            }
        }
    }
`;

function DisplayLocations() {
    const { loading, error, data } = useQuery(GET_CLASSES);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;
    let typedData: QueryPage<Class> = data.classes;

    return typedData.nodes.map((item: Class) => (
        <div key={item.id}>
            <h3>{item.courseNumber}</h3>
            <br />
            <p>{item.courseTitle}</p>
            <br />
        </div>
    ));
}

function App() {
    return (
        <div className="App">
            <header className="App-header">

            </header>
        </div>
    );
}

export default App;
