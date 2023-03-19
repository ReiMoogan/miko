// What if we made an entire file for a loading component?

import './Loading.css';

const Loading: Function = (): JSX.Element => {
    const flip = Math.random() > 0.5;
    const link = flip ? "fumo.svg" : "fumo_sanae.svg";

    return (
        <div className={"loading-group"}>
            <img src={link} alt={"loading icon"} />
            <span>Now loading, please wait warmly...</span>
        </div>
    );
}

export default Loading;