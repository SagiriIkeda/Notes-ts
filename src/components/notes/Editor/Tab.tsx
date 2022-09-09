import React from "react";
import Note from "../../../interfaces/notes";
import OpenEditor from "./OpenEditor";

import iconReact from "../../../assets/icon-react.jpg";


interface TabProps {
    invoker: OpenEditor,
}
interface TabState {
    title: string,
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
            closed: false
        }
        this.props.invoker.TabInstance = this;

        // props.invoker = this;
    }
    closeTab() {
        this.setState({ closed: true })
    }
    render() {
        if (this.state.closed == false) {
            return (
                <div className="editortab" >
                    <div className="icon">
                        <img src={iconReact} alt="editor" />
                    </div>
                    <span>{this.state.title}</span>
                    <i className="material-icons">close</i>
                </div>
            )
        }
        return (<div></div>)

    }
}