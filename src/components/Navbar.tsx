import './Navbar.css';
import {useApolloClient} from "@apollo/client";

interface NavbarProps {
    clickCallback: Function;
    searchCallback: Function;
}

function updateNavbar(name: string) {
    document.querySelector(".nav-selected")?.classList.remove("nav-selected");
    document.querySelector(`.nav-link[name="${name}"]`)?.classList.add("nav-selected");
}

const Navbar: Function = (props: NavbarProps): JSX.Element => {
    const graphQlClient = useApolloClient();

    return (
        <nav>
            <button className="nav-title" onClick={() => graphQlClient.refetchQueries({ include: "all" })}><img src={"fumo.svg"} placeholder={"site logo"} alt=""/>UCM Scraper Core</button>
            <button className="nav-link nav-selected" name="classes" onClick={(e) => { updateNavbar(e.currentTarget.name); props.clickCallback(e.currentTarget.name) } }>Classes</button>
            <button className="nav-link" name="professors" onClick={(e) => { updateNavbar(e.currentTarget.name); props.clickCallback(e.currentTarget.name)} }>Professors</button>
            <button className="nav-link" name="scheduler" onClick={(e) => { updateNavbar(e.currentTarget.name); props.clickCallback(e.currentTarget.name)} }>Scheduler</button>
            <button className="nav-link" name="history" onClick={(e) => { updateNavbar(e.currentTarget.name); props.clickCallback(e.currentTarget.name)} }>History</button>
            <button className="nav-link" name="about" onClick={(e) => { updateNavbar(e.currentTarget.name); props.clickCallback(e.currentTarget.name)} }>About</button>
            <input type={"text"} placeholder={"Search..."} className={"nav-search"} onChange={(e) => props.searchCallback(e.target.value)} />
        </nav>
    );
}

export default Navbar;