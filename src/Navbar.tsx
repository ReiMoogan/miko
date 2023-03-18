import './Navbar.css';

const Navbar: Function = (): JSX.Element => {
    return (
        <nav>
            <button className="nav-title" name=""><img src={"fumo.svg"} placeholder={"site logo"}/>UCM Scraper Core</button>
            <button className="nav-link" name="#classes">Classes</button>
            <button className="nav-link" name="#professors">Professors</button>
            <button className="nav-link" name="#scheduler">Scheduler</button>
            <button className="nav-link" name="#scheduler">History</button>
            <button className="nav-link" name="#about">About</button>
        </nav>
    );
}

export default Navbar;