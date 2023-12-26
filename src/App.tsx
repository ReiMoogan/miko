import React from 'react';
import './App.css';
import Classes from './panels/CourseList';
import Professors from './panels/Professors';
import Navbar from './components/Navbar';
import About from "./panels/About";
import { useState } from "react";
import Scheduler from './panels/Scheduler';

const PAGES = new Map<string, JSX.Element>();
PAGES.set("classes", <Classes />);
PAGES.set("professors", <Professors />);
PAGES.set("scheduler", <Scheduler />);
PAGES.set("about", <About />);

let render: (value: (((prevState: string) => string) | string)) => void = () => {};

function clickCallback(page: string) {
    render(page);
}

function searchCallback(search: string) {
    console.log(search);
}

function App() {
    const [ page, forceRender ] = useState("classes");
    render = forceRender;

    return (
        <div className="App">
            <Navbar clickCallback={clickCallback} searchCallback={searchCallback}/>
            <main>
                {PAGES.get(page)}
            </main>
        </div>
    );
}

export default App;
