import React, { createRef } from "react";
import UINOTES from "../../UI";
import "../../../../css/dropzone.css"
import { NoteBuilder } from "../../../interfaces/notes";
import DB from "../../../db/database";

interface DropZoneProps {
    UI: UINOTES,
}

export default class DropZone extends React.Component<DropZoneProps> {
    UI: UINOTES;
    container = createRef<HTMLDivElement>();
    zone = createRef<HTMLDivElement>();
    isAnimated = false;
    Enabled = false;
    int = 0;

    constructor(props: DropZoneProps) {
        super(props)
        this.UI = props.UI;
        this.dropOutAnimation = this.dropOutAnimation.bind(this);
        this.leaveDrag = this.leaveDrag.bind(this);
        this.onDropFiles = this.onDropFiles.bind(this);
    }
    componentDidMount() {
        window.onfocus = () => {
            if(this.isAnimated) {
                this.dropOutAnimation();
            }
            this.Enabled = false;
        }
        window.onblur = () => {
            this.Enabled = true;
        };

        window.ondragover = (e: DragEvent) => {
            const { isAnimated, zone, container } = this;
            if (this.Enabled == true) {
                clearTimeout(this.int);
                e.preventDefault();
                if (isAnimated == false) {
                    this.isAnimated = true;
                    if (container.current) container.current.style.display = "flex";

                    zone.current?.animate({ opacity: 1, transform: "scale(1)" }, {
                        duration: 200,
                        fill: "forwards",
                        easing: "ease"
                    })
                    setTimeout(() => {
                        window.addEventListener('dragleave', this.leaveDrag);
                    }, 75);
                }
            }
        }

        window.ondrop = this.onDropFiles;

    }

    onDropFiles(ev: DragEvent) {
        ev.preventDefault();
        this.dropOutAnimation();
        if (ev.dataTransfer?.items) {
            for (let i = 0; i < ev.dataTransfer.items.length; i++) {
                if (ev.dataTransfer.items[i].kind === 'file') {
                    let file = ev.dataTransfer.items[i].getAsFile();
                    if (file?.type === "text/plain") {
                        const Reader = new FileReader();
                        Reader.readAsText(file);
                        Reader.onload = (fileLoaded) => {
                            const FileContent = fileLoaded.target?.result as string;
                            const FileName = file?.name.replace(/\.txt$/im, "").substring(0, 23);

                            //generate Note;
                            const fileToNote = new NoteBuilder(this.UI.state.activeFolder, {
                                content: FileContent?.replace(/\n/gim, "<br/>"),
                                title: FileName,
                            });

                            DB.Notes.add(fileToNote);
                            this.UI.reloadData();
                        };
                    }
                }
            }
        }
        this.removeDragData(ev);
    }

    removeDragData(ev: DragEvent) {
        if (ev.dataTransfer?.items) {
            ev.dataTransfer.items.clear();
        } else {
            ev.dataTransfer?.clearData();
        }
    }

    dropOutAnimation() {
        const container = this.container.current;
        const zone = this.zone.current;
        this.isAnimated = false;
        this.zone.current?.animate({ opacity: 0, transform: "scale(0.9)" }, {
            duration: 200,
            fill: "forwards",
            easing: "ease"
        })
            .addEventListener("finish", () => {
                if (container) container.style.display = "none";
            })
    }

    leaveDrag(e: DragEvent) {
        if (this.Enabled == true) {
            this.isAnimated = false;
            e.preventDefault();
            this.dropOutAnimation();
            window.removeEventListener('dragleave', this.leaveDrag);
        }
    }

    render() {
        return (
            <div className="dropzone__full" ref={this.container} >
                <div className="dropzone" ref={this.zone} >
                    <div className="container_">
                        <div className="item">TXT
                            <div className="shadow"></div>
                        </div>
                        <div className="item">TXT
                            <div className="shadow"></div>
                        </div>
                        <div className="item">TXT</div>
                    </div>
                    <div className="text">¡Suelta tus <strong>.TXT</strong> para convertirlos en Notas!</div>
                </div>
            </div>
        );
    }
}