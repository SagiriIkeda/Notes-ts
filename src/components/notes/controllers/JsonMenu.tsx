import React, { createRef } from "react";
import Note from "../../../interfaces/notes";
import { Mat } from "../../prefabs";
import UINOTES from "../../UI";

interface JsonMenuProps {
    UI: UINOTES,
}
interface JsonMenuState {
    data?: Note,
    opend: boolean
}


export default class JsonMenu extends React.Component<JsonMenuProps, JsonMenuState> {

    state: JsonMenuState = {
        opend: false,
    }
    container = createRef<HTMLDivElement>()
    shadow = createRef<HTMLDivElement>()
    UI: UINOTES;

    constructor(props: JsonMenuProps) {
        super(props);
        this.UI = props.UI;

        this.UI.JSONMENU = this;

        this.closeAnimation = this.closeAnimation.bind(this);
    }

    set(data: Note) {
        this.setState({
            data,
            opend: true
        })

    }
    closeAnimation() {
        return new Promise((resolve, reject) => {
            const container = this.container.current;
            const shadow = this.shadow.current;
            if(shadow) {
                shadow.classList.remove("__open");
            }
            if (container) {
                container.setAttribute("data-closing", "true");
                setTimeout(() => {
                    this.setState({
                        data: undefined,
                        opend: false,
                    })
                    resolve(true);
                }, 500)
            }
        })
    }

    render() {
        const { state } = this;
        const { data } = state;
        if (state.opend && data) {
            return (
                <>
                <div className="__JSONMENU-shadow __open" ref={this.shadow}  onClick={this.closeAnimation}></div>
                <div className="JSONMENU">
                    <div className="container" ref={this.container}>
                        <div className="__header">
                            <div className="__title"><Mat>description</Mat> Note</div>
                            <Mat onClick={this.closeAnimation} >close</Mat>
                        </div>

                        <div className="content">
                            {'{'}<br />
                            <div className="s t">"content"</div>:<div className="v">"{data.content}"</div>,<br />
                            <div className="s t">"title"</div>:<div className="v">"{data.title}"</div>,<br />
                            <div className="s t">"folder"</div>:<div className="v">"{data.folder}"</div>,<br />
                            <div className="s t">"theme"</div>:<div className="v">"{data.theme}"</div>,<br />
                            <div className="s t">"time"</div>:<div className="n">{data.time}</div>,<br />
                            <div className="s t">"id"</div>:<div className="v">"{data.id}"</div>,<br />
                            <div className="s t">"position"</div>: <div className="nsbp"></div> {'{'}<br />
                            <div className="s t2">"width"</div>:<div className="n">{data.position.width}</div>,<br />
                            <div className="s t2">"height"</div>:<div className="n">{data.position.height}</div>,<br />
                            <div className="s t2">"top"</div>:<div className="n">{data.position.top}</div>,<br />
                            <div className="s t2">"left"</div>:<div className="n">{data.position.left}</div><br />
                            <div className="r t">{'}'}</div><br />
                            {'}'}<br />
                        </div>
                    </div>
                </div>
                </>
            );
        }
        
        return (<div className="__JSONMENU-shadow"></div>)
    }
}