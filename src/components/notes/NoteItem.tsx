import React, { createRef } from "react";
import Swal from "sweetalert2";
import { Notes } from "../../db/database";
import Note from "../../interfaces/notes";
import Socket from "../../socket";
import { AuxList } from "../AuxMenu/item";
import { CopyToClipboard } from "../AuxMenu/util/CopyToClipboard";
import { downloadFile } from "../AuxMenu/util/downloadFile";
import timeAgo from "../../../libraries/timeAgo/timeAgo";
import UINOTES from "../UI"
import OpenEditor, { OpenLimitedEditor } from "./Editor/OpenEditor";
import { Mat } from "../prefabs";

export const mode = {
    first: true,
}

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

        this.onClick = this.onClick.bind(this);
        this.delete = this.delete.bind(this);
        this.OpenNote = this.OpenNote.bind(this);
        this.UI = props.UI;
        this.select = this.select.bind(this);
        this.deselect = this.deselect.bind(this);
        this.id = props.data.id;
        this.AuxEvent = this.AuxEvent.bind(this);
        this.getPreprocesedContent = this.getPreprocesedContent.bind(this);
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
        mode.first = false;
        this.UpdateContentPrev();
    }
    //methods

    select(update = true) {
        const { UI, id } = this;
        UI.SelectMode.add(id);
        update && UI.SelectMode.setMode(true);
    }
    deselect(update = true) {
        const { UI, id } = this;
        UI.SelectMode.delete(id);
        update && UI.SelectMode.setMode(true);
    }
    delete() {
        const { data } = this.props;
        Swal.fire({
            confirmButtonText: 'Borrar',
            icon: "warning",
            html: `¿Quieres Borrar la nota <b>${data.title}</b>?`,
            showCancelButton: true,
            showCloseButton: true,
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                Notes.remove(data.id);

                Socket.send({
                    data:null,
                    event:"note-delete",
                    id: data.id,
                })

                this.UI.reloadData();
            }
        })
    }

    //events and utilities
    getPreprocesedContent() {
        return this.props.data.content
            .replace(/<br>/gim, '\n')
            .replace(/<(.*?)>/gim, (e, i) => {
                if (i == "div") return "\n";
                return "";
            })
            .replace(/&lt;/gim, '<')
            .replace(/&gt;/gim, '>')
            .replace(/&nbsp;/gim, ' ');
    }

    AuxEvent(event: React.MouseEvent) {
        const { data } = this.props;
        event.preventDefault();

        let AUXFORNOTE: AuxList = [
            {
                icon: "file_open",
                action: this.OpenNote,
                name: "Abrir"
            },
            {
                icon: "content_copy",
                name: "Copiar Contenido",
                action: () => {
                    let content = this.getPreprocesedContent();
                    CopyToClipboard(content);
                },
            },
            {
                icon: "check_circle",
                name: "Seleccionar",
                action: () => {
                    this.select(false);
                    this.UI.state.SelectMode = true;
                    this.UI.setState({});
                },
            },
            {
                icon: "download",
                name: "Descargar como TXT",
                action: () => {
                    downloadFile(`${data.title}.txt`, this.getPreprocesedContent());
                },
            },
            {
                icon: "file_copy",
                name: "Copiar como JSON",
                action: () => {
                    CopyToClipboard(JSON.stringify(data))
                },
            },
            {
                icon: "insert_drive_file",
                name: "Ver JSON",
                action: () => {
                    this.UI.JSONMENU?.set(data)
                },
            },
            {
                icon: "drive_file_move_rtl",
                name: "Mover a...",
                action: () => {
                    this.UI.SelectMode.add(data.id)
                    this.UI.MOVEFOLDER?.open();
                    // if(Application.state.selectes.includes(self.props.data.id) == false){
                    //     Application.state.selectes.push(self.props.data.id);
                    // }
                    // OpenMoveFolder();
                },
            },
            {
                icon: "delete",
                action: this.delete,
                danger: true,
                name: "Eliminar"
            }]
        if ((this.UI.state.selectes.has(this.props.data.id))) {
            AUXFORNOTE[2] = {
                icon: "radio_button_unchecked",
                name: "Deseleccionar",
                action: () => {
                    this.deselect(false);
                    this.UI.state.SelectMode = true;
                    this.UI.setState({});
                },
            }
        }
        this.UI.AUX?.set(AUXFORNOTE, event, "NotesAux")
    }

    onClick(event: React.MouseEvent) {
        const eventTarget = event.target as HTMLDivElement;
        if(eventTarget.classList.contains("__aux-icon")) return;
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
                    this.select();
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
                            this.select();
                        } else {
                            if (UI.SelectMode.first == true) {
                                UI.SelectMode.first = false;
                            } else {
                                this.deselect();
                            }
                        }
                        UI.setState({});
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

        const content = data.content
            .replace(/<.+?>/gim, "")
            .substr(0, 61)

        const more = content.length >= 61;

        let className = "note-item";

        if (selectes.has(this.props.data.id)) className += " selected";
        if (mode.first == true) className += " firstAnimation";

        return (
            <div
                className={className}
                onMouseDown={this.onClick}
                onAuxClick={this.AuxEvent}
                ref={this.note}
                data-theme={data.theme}
            >
                
                <Mat className={"__aux-icon"+(this.UI.state.SelectMode ? " __select-mode":"")} onClick={this.AuxEvent} >more_vert</Mat>
                <div className="note__content" dangerouslySetInnerHTML={{ __html: content }}></div>
                {(more) && (<div className="more">...</div>)}
                <div className="note__date">{timeAgo(data.time)}</div>
                <div className="select"><div className="line"></div></div>
            </div>
        )
    }
}