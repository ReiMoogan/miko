import './About.css'
import {gql, useQuery} from "@apollo/client";
import Loading from "../components/Loading";

const GET_STATS = gql`
    query {
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
        }
        meetingTypes {
            id
        }
    }
`;

const About: Function = (): JSX.Element => {
    const { loading, error, data } = useQuery(GET_STATS, {
        variables: { cursor: null }
    });

    let lines: JSX.Element[];

    if (loading) {
        lines = [<li key={"loading"}><Loading /></li>];
    } else if (error){
        lines = [<li key={"error"}>Error~ {error.message}</li>]
    } else {
        lines = [
            <li key={"totalTerms"}>Total Terms: {data.terms.length}</li>,
            <li key={"totalProfessors"}>Total Professors: {data.stats.totalProfessors}</li>,
            <li key={"totalMeetings"}>Total Meetings: {data.stats.totalMeetings}</li>,
            <li key={"totalClasses"}>Total Classes: {data.stats.totalClasses}</li>,
            <li key={"totalSubjects"}>Total Subjects: {data.subjects.length}</li>,
            <li key={"totalMeetingTypes"}>Total Meeting Types: {data.meetingTypes.length}</li>
        ];

        for (const item of data.lastUpdate) {
            lines.push(<li key={"lastUpdate" + item.tableName}>Last table update: {item.tableName} - {new Date(item.lastUpdate).toLocaleString()}</li>);
        }
    }

    return (
        <div className="about">
            <h1>UCM Scraper Core</h1>
            <p>A project by Andrew and William.</p>
            <a href={"https://github.com/ReiMoogan/miko"}>See our GitHub repo!</a>
            <hr/>
            <p>Database Statistics</p>
            <ul>
                {lines}
            </ul>
        </div>
    );
}

export default About;