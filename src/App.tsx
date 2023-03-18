import React from 'react';
import './App.css';
import { DisplayGroups } from './panels/CourseList';
import Navbar from './Navbar';

function App() {
    return (
        <div className="App">
            <Navbar />
            <DisplayGroups />
        </div>
    );
}

export default App;
