import { useQuery, gql } from '@apollo/client';
import {QueryPage, Professor} from '../GraphQLModels';
import './CourseList.css'
import { useState } from 'react';
import Loading from '../components/Loading';

const GET_PROFESSORS = gql`
    query {
        professors(first: 5000, order: {fullName: ASC}) {
            nodes {
                department
                difficulty
                email
                fullName
                numRatings
                rating
                wouldTakeAgainPercent
            }
        }
    }
`;

class ProfessorDisplayState {
    professors: Professor[] = [];
}

function DisplayProfessors(state: ProfessorDisplayState, setCurrentState: (value: (((prevState: ProfessorDisplayState) => ProfessorDisplayState) | ProfessorDisplayState)) => void): JSX.Element[] {
    const { loading, error, data } = useQuery(GET_PROFESSORS, {
        variables: { cursor: null }
    });

    if (loading) {
        return [<tr key="load"><td colSpan={100}><Loading /></td></tr>];
    }

    if (error){
        return [<tr key="error"><td colSpan={100}>Error~ {error.message}</td></tr>];
    }

    if (state.professors.length === 0) {
        state.professors = data.professors;
        setCurrentState(state);
    }

    let professors: QueryPage<Professor> = data.professors;

    return professors.nodes.map((professor: Professor) => {
            function fakeMap(professor: Professor) : JSX.Element[] {
                return [
                    <td>{professor.numRatings === 0 ? "N/A" : professor.rating.toFixed(2)}</td>,
                    <td>{professor.numRatings === 0 ? "N/A" : professor.difficulty.toFixed(2)}</td>,
                    <td>{professor.numRatings === 0 ? "N/A" : professor.wouldTakeAgainPercent.toFixed(2) + "%"}</td>
                ];
            }

            return (
                <tr key={professor.email}>
                    <td>{professor.fullName}</td>
                    <td>{professor.department}</td>
                    <td>{professor.email}</td>
                    <td>{professor.numRatings}</td>
                    {fakeMap(professor)}
                </tr>
            );
        }
    );
}

const Professors: Function = (): JSX.Element => {
    const [state, setState] = useState(new ProfessorDisplayState());

    const professors = DisplayProfessors(state, setState);

    return (
        <div className="class-group">
            <h1>Faculty at UCM</h1>
            <p>Data fetched from Ellucian Banner and RateMyProfessor. Rating data may be inaccurate.</p>
            <div className="class-table">
                <table>
                    <thead>
                    <tr>
                        <th>Professor</th>
                        <th>Department</th>
                        <th>Email</th>
                        <th>Number of Ratings</th>
                        <th>Rating (/5)</th>
                        <th>Difficulty (/5)</th>
                        <th>Would Take Again (%)</th>
                    </tr>
                    </thead>
                    <tbody>
                        {professors}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Professors;