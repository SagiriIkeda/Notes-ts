import React, { createRef } from "react";
import Note from "../../interfaces/notes";
import timeAgo from "../timeAgo";
import UINOTES from "../UI"
import OpenEditor, { OpenLimitedEditor } from "./Editor/OpenEditor";
// import Note from "../../interfaces/notes";

interface NoteItemProps {
    data: Note,
    UI: UINOTES
}

let globalInterval = 0;

export default class NoteItem extends React.Component<NoteItemProps>  {
    note = createRef<HTMLDivElement>();
    isAnimating = false;
    UI: UINOTES;
    id: string

    constructor(props: NoteItemProps) {
        super(props)

        this.Click = this.Click.bind(this);
        this.OpenNote = this.OpenNote.bind(this);
        this.UI = props.UI;
        this.SelectThis = this.SelectThis.bind(this);
        this.id = props.data.id;
        // this.AuxEvent = this.AuxEvent.bind(this);
    }
    UpdateContentPrev() {
        const { current } = this.note;
        if (current && this.isAnimating === false) {
            let height = Math.round(current.getBoundingClientRect().height / 10);
            if (height == 7) height = 8;
            if (height == 9) height = 10;
            if (height == 11) height = 12;
            current.style.gridRowEnd = `span ${height}`;
        }
    }
    componentDidUpdate() {
        this.UpdateContentPrev();
    }
    componentDidMount() {
        this.UpdateContentPrev();
    }

    SelectThis() {
        const { UI, id } = this;
        UI.SelectMode.add(id);
    }
    DeselectThis() {
        const { UI, id } = this;
        UI.SelectMode.delete(id);
    }

    /*
    AuxEvent(event) {
        event.preventDefault();
        let ProcesedContent = this.props.data.content
        .replace(/<br>/gim,'\n')
        .replace(/<(.*?)>/gim,(e,i) => {
            if(i == "div") return "\n";
            return "";
        })
        .replace(/&lt;/gim,'<')
        .replace(/&gt;/gim,'>')
        .replace(/&nbsp;/gim,' ');

        const self = this;

        let obj = [
            {
                icon:"file_open",
                Action: self.OpenNote,
                name:"Abrir"
            },
            {
                icon:"content_copy",
                Action:e => {
                    let content = ProcesedContent;
                    CopyToClipboard(content);
                },
                name:"Copiar Contenido"
            },
            {
                icon:"check_circle",
                Action:e => {
                    self.SelectThis();
                    Application.setSelectMode(true);
                },
                name:"Seleccionar"
            },
            {
                icon:"download",
                Action:e => {
                    downloadFile(`${self.props.data.title}.txt`,ProcesedContent);
                },
                name:"Descargar como TXT"
            },
            {
                icon:"file_copy",
                Action:e => {
                    CopyToClipboard(JSON.stringify(self.props.data))
                },
                name:"Copiar como JSON"
            },
            {
                icon:"insert_drive_file",
                Action:e => {
                    ViewJSONNote(self.props.data);
                },
                name:"ver JSON"
            },
            {
                icon:"drive_file_move_rtl",
                Action:e => {
                    if(Application.state.selectes.includes(self.props.data.id) == false){
                        Application.state.selectes.push(self.props.data.id);
                    }
                    OpenMoveFolder();
                },
                name:"Mover a..."
            },
            {
                icon:"delete",
                Action:e => {
                    DeleteNote(this.props.data.id);
                },
                danger:true,
                name:"Eliminar"
            }]
        if((Application.state.selectes.includes(this.props.data.id))) {
            obj[2] = {
                icon:"radio_button_unchecked",
                Action:e => {
                    this.DeselectThis();
                    Application.setState({})
                },
                name:"Deseleccionar"
            }
        }
        SetOpenAuxClick(obj,event,"NotesAux")
    }**/

    Click(event: React.MouseEvent) {
        const { UI } = this;

        if (event.buttons == 1) {
            const bezier = 'cubic-bezier(0.230, 1.000, 0.320, 1.000)';

            this.isAnimating = true;

            this.note.current?.animate([{ scale: 0.9 }, { scale: 1 }], {
                duration: 1000,
                easing: bezier,
            })
                .addEventListener("finish", () => {
                    this.isAnimating = false;
                })

            clearTimeout(globalInterval)
            //timer
            let ms = 0;
            let menutime = 150;
            let clicks = setInterval(() => {
                ms += 1;
                if (ms >= menutime) {
                    clearInterval(clicks);
                    this.SelectThis();
                    UI.SelectMode.setMode(true);
                }
            }, 3);

            const mouseup = (e: MouseEvent) => {
                this.note.current?.removeEventListener('mouseleave', mouseup)
                this.note.current?.removeEventListener('mouseup', mouseup)
                clearInterval(clicks);
                ms = 0;
                if (ms < menutime && e.type != "mouseleave") {
                    if (UI.state.SelectMode == false) {
                        this.OpenNote();
                    } else {
                        if (!UI.state.selectes.has(this.props.data.id)) {
                            this.SelectThis();
                        } else {
                            if (UI.SelectMode.first == true) {
                                UI.SelectMode.first = false;
                            } else {
                                this.DeselectThis();
                            }
                        }
                        UI.reloadData();
                    }
                }

            }
            this.note.current?.addEventListener('mouseleave', mouseup)
            this.note.current?.addEventListener('mouseup', mouseup)
        }
    }

    OpenNote() {
        const { UI, data } = this.props;

        if (!UI.state.Editors.has(data.id)) {
            OpenLimitedEditor(UI, data.id);
        }
    }

    render() {
        const { selectes } = this.UI.state;

        const { data } = this.props

        let content = data.content
            .replace(/<.+?>/gim, "")
            .substr(0, 61)

        let more = false;
        if (content.length >= 61) {
            more = true;
        }
        return (
            <div
                // className={`note-preview${(selectes.has(this.props.data.id)? " selected":"")}${(firstLoad == true)? " first":""}`} 
                className={`note-preview${(selectes.has(this.props.data.id) ? " selected" : "")}`}
                // className={`note-preview`}
                onMouseDown={this.Click}
                // onAuxClick={this.AuxEvent}
                ref={this.note}
                data-theme={data.theme}
            >
                <div className="note__content" dangerouslySetInnerHTML={{ __html: content }}></div>
                {(more == true) && (<div className="more">...</div>)}
                <div className="note__date">{timeAgo(data.time)}</div>
                <div className="select"><div className="line"></div></div>
            </div>
        )
    }
}