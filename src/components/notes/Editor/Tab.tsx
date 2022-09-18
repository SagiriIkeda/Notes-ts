import React from "react";
import Note, { Themes } from "../../../interfaces/notes";
import OpenEditor from "./OpenEditor";

import iconReact from "../../../assets/icon-react.jpg";


interface TabProps {
    invoker: OpenEditor,
}
interface TabState {
    title: string,
    theme: Themes,
    closed: Boolean
}

export default class Tab extends React.Component<TabProps, TabState> {

    invoker: OpenEditor;

    constructor(props: TabProps) {
        super(props);

        const { data } = props.invoker;

        this.invoker = props.invoker;

        this.state = {
            title: data.title,
            theme: data.theme,
            closed: false
        }
        this.props.invoker.TabInstance = this;
    }
    closeTab() {
        this.setState({ closed: true })
    }
    render() {
        const { theme, closed } = this.state;
        if (closed == false) {
            return (
                <div className="Editor-tab" data-theme={theme} onClick={this.invoker.setTopZIndex} >
                    <div className="icon">
                        <img src={iconReact} alt="app-icon" />
                    </div>
                    <span>{this.state.title}</span>
                    <i className="material-icons" onClick={this.invoker.Close} >close</i>
                </div>
            )
        }
    }
}