import './About.css'
import {gql, useQuery} from "@apollo/client";
import Loading from "../components/Loading";

const GET_STATS = gql`
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
        lines = [<li><Loading /></li>];
    } else if (error){
        lines = [<li>Error~ {error.message}</li>]
    } else {
        lines = [
            <li>Total Terms: {data.terms.length}</li>,
            <li>Total Professors: {data.stats.totalProfessors}</li>,
            <li>Total Meetings: {data.stats.totalMeetings}</li>,
            <li>Total Classes: {data.stats.totalClasses}</li>,
            <li>Total Subjects: {data.subjects.length}</li>,
            <li>Total Meeting Types: {data.meetingTypes.length}</li>
        ];

        for (const item of data.lastUpdate) {
            lines.push(<li>Last table update: {item.tableName} - {new Date(item.lastUpdate).toLocaleString()}</li>);
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