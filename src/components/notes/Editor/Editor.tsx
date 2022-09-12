import React, { createRef, FormEventHandler, KeyboardEvent, ReactNode, SyntheticEvent } from "react";
import Note, { Themes } from "../../../interfaces/notes";
import { Mat } from "../../prefabs";
import { months } from "../../timeAgo";
import OpenEditor from "./OpenEditor";

import iconReact from "../../../assets/icon-react.jpg";
import UINOTES from "../../UI";
import EditorMovement from "./Movement";
import EditorSelection from "./Selection";
import DB from "../../../db/database";

interface EditorProps {
    invoker: OpenEditor,
}

interface EditorState {
    title: Note["title"],
    theme: Note["theme"],

    charact: number,
    texturize: boolean,
    force: boolean,
    closed: boolean,
    bold: boolean,
    underline: boolean,
    italic: boolean,
    themeMenu: boolean,
    autoOpen: boolean,

    updateReceived: boolean,
}

export default class Editor extends React.Component<EditorProps, EditorState> {

    note_name_container = createRef<HTMLDivElement>();
    InputName = createRef<HTMLInputElement>();
    InputCamp = createRef<HTMLDivElement>();
    windowElm = createRef<HTMLDivElement>();
    data: Note;

    invoker: OpenEditor;

    windowEditor = createRef<HTMLDivElement>();

    usereditor = createRef<HTMLDivElement>();
    note__info = createRef<HTMLDivElement>();
    note__header = createRef<HTMLDivElement>();

    Movement = new EditorMovement({ Editor: this });
    Selection = new EditorSelection({ Editor: this });

    constructor(props: EditorProps) {
        super(props);

        let autoup = true;

        if (localStorage.getItem('AutoUp') != undefined) {
            autoup = JSON.parse(localStorage.getItem('AutoUp') ?? "false");
        }
        this.invoker = props.invoker;

        this.data = this.invoker.data;

        const { data } = this;

        this.state = {
            title: data.title,
            theme: data.theme,
            charact: 0,
            texturize: false,
            force: false,
            closed: false,
            bold: false,
            underline: false,
            italic: false,
            themeMenu: false,
            autoOpen: autoup,
            updateReceived: false,
        }

        this.props.invoker.EditorInstance = this;

        // functions
        this.UpdateCharact = this.UpdateCharact.bind(this);
        this.UpdateName = this.UpdateName.bind(this);
        this.SaveKey = this.SaveKey.bind(this);
        this.SaveAnimation = this.SaveAnimation.bind(this);
        this.Save = this.Save.bind(this);

        this.toggleMenuTheme = this.toggleMenuTheme.bind(this);
        this.toggleTexturizeCamp = this.toggleTexturizeCamp.bind(this);
        this.MaxCampHeight = this.MaxCampHeight.bind(this);
        this.SavePosition = this.SavePosition.bind(this);


        // EditInstance = this;
        //functions
        //References 


        // this.chachedUpdate = null;
    }


    // ClickUpdateReceived() {

    //     data = { ...this.chachedUpdate }

    //     this.state.theme = data.theme;

    //     this.chachedUpdate = null;
    //     this.state.updateReceived = false;

    //     this.state.title = data.title;
    //     TabInstance.setState({ title: data.title })

    //     this.componentDidMount();
    //     SetTheme(data.theme);
    // }

    UpdateName(event: SyntheticEvent<HTMLInputElement, InputEvent>) {
        const { invoker } = this.props;
        const { data } = this.props.invoker;
        const target = event.target as HTMLInputElement;
        if (target) {
            const { TabInstance } = invoker;
            let value = target.value;
            data.title = target.value;
            this.setState({ title: value })
            if (TabInstance) {
                TabInstance.setState({ title: value })
            }
        }
    }
    UpdateCharact() {
        const InputCamp = this.InputCamp.current;
        if (InputCamp) {
            this.props.invoker.data.content = InputCamp.innerHTML;
            let value = InputCamp.innerText;
            this.setState({ charact: value.length })
        }
    }

    SavePosition() {
        const { invoker } = this;
        const { data, id } = invoker;

        if (id) {
            DB.Notes.Update(id, { position: data.position });
        }
    }

    Save() {
        this.SaveAnimation();
        this.invoker.Save();
    }

    SaveAnimation() {
        const note_name_container = this.note_name_container.current;
        if (note_name_container) {
            note_name_container.classList.add('saving');
            setTimeout(() => {
                note_name_container.classList.remove('saving');
            }, 3000);
        }
    }

    SaveKey(e: KeyboardEvent) {
        const keyCode = e.keyCode;

        if (keyCode === 116) {
            // e.returnValue = false;
            e?.preventDefault();
            this.Save();
        }
    }

    componentDidMount() {
        const { InputName, InputCamp, data, Selection } = this;
        const windowEditor = this.windowEditor.current;
        if (InputName.current) {
            InputName.current.value = data.title;
        }
        if (InputCamp.current) {
            InputCamp.current.innerHTML = data.content;
        }
        document.addEventListener('selectionchange', Selection.SelectionChange);
        this.MaxCampHeight();

        if (windowEditor) {
            windowEditor.style.height = `${data.position.height}px`;
            windowEditor.style.width = `${data.position.width}px`;
            windowEditor.style.left = `${data.position.left}px`;
            windowEditor.style.top = `${data.position.top}px`;
        }


        // LastestSave = this.InputCamp.current.innerHTML;
        this.UpdateCharact();
    }
    toggleMenuTheme() {
        this.setState({
            themeMenu: !this.state.themeMenu,
            force: false,
            texturize: false
        })
    }
    toggleTexturizeCamp() {
        this.setState({
            force: !this.state.force,
            themeMenu: false
        })
    }

    MaxCampHeight(s?: boolean) {
        const usereditor = this.usereditor.current;
        const note__info = this.note__info.current as HTMLDivElement;
        const note__header = this.note__info.current as HTMLDivElement;
        const InputCamp = this.note__info.current as HTMLInputElement;
        if (usereditor) {
            let usereditorheight = usereditor.getBoundingClientRect().height;

            let characterheight = note__info.getBoundingClientRect().height;
            let editorheaderHeight = note__header.getBoundingClientRect().height;
            let avaibleHeight = usereditorheight - characterheight - editorheaderHeight;

            avaibleHeight -= 1;
            if (s === true) {
                avaibleHeight = avaibleHeight * 1.2;
            }
            InputCamp.style.maxHeight = `${avaibleHeight}px`;

        }
    }

    closeWindow() {
        return new Promise((resolve, reject) => {
            const { Selection, invoker } = this;

            const windowEditor = this.windowEditor.current;

            const ANIMATION_TIME = 300;

            document.removeEventListener('selectionchange', Selection.SelectionChange);

            windowEditor?.classList.add("closing");
            windowEditor?.animate([
                { transform: `scale(1)`, opacity: "1" },
                { transform: `scale(0.8)`, opacity: "0" },
            ], {
                duration: ANIMATION_TIME,
                easing: "ease",
                fill: "forwards",
            })

            setTimeout(() => {
                this.setState({
                    closed: true
                })
                resolve(true)

            }, ANIMATION_TIME);

        })
    }

    saveAutoUp(type: boolean) {
        localStorage.setItem('AutoUp', JSON.stringify(type));
    }

    setAutoOpen(e = true) {
        this.setState({
            autoOpen: e
        })
        this.saveAutoUp(e);
    }

    // AuxForInput(event) {
    //     let input = this.InputName.current;
    //     // let obj = [
    //     //     {
    //     //         icon: "content_copy",
    //     //         Action: e => {
    //     //             document.execCommand("copy", false, null);
    //     //         },
    //     //         name: "Copiar <min>(Ctrl + C)</min>"
    //     //     },
    //     //     {
    //     //         icon: "content_cut",
    //     //         Action: e => {
    //     //             document.execCommand("cut", false, null);
    //     //         },
    //     //         name: "Cortar <min>(Ctrl + X)</min>"
    //     //     },
    //     //     {
    //     //         icon: "content_paste",
    //     //         Action: e => {
    //     //             navigator.clipboard.readText().then(text => {
    //     //                 document.execCommand("insertHTML", false, text);
    //     //             })
    //     //         },
    //     //         // disabled:true,
    //     //         name: "Pegar <min>(Ctrl + V)</min>"
    //     //     },
    //     // ]
    //     // if (input.selectionEnd - input.selectionStart == 0) {
    //     //     obj[0].disabled = true;
    //     //     obj[1].disabled = true;
    //     // }
    //     // SetOpenAuxClick(obj, event, "AuxInput");
    // }
    // AuxForCamp(event) {
    //     let selection = this.getSelectionHtml().replace(/<.*?>/gim, '');
    //     // let obj = [
    //     //     {
    //     //         icon: "content_copy",
    //     //         Action: e => {
    //     //             document.execCommand("copy", false, null);
    //     //         },
    //     //         name: "Copiar <min>(Ctrl + C)</min>"
    //     //     },
    //     //     {
    //     //         icon: "content_cut",
    //     //         Action: e => {
    //     //             document.execCommand("cut", false, null);
    //     //         },
    //     //         name: "Cortar <min>(Ctrl + X)</min>"
    //     //     },
    //     //     {
    //     //         icon: "content_paste",
    //     //         Action: e => {
    //     //             navigator.clipboard.readText().then(text => {
    //     //                 document.execCommand("insertHTML", false, text);
    //     //             })
    //     //         },
    //     //         hr: true,
    //     //         // disabled:true,
    //     //         name: "Pegar <min>(Ctrl + V)</min>"
    //     //     },
    //     //     {
    //     //         icon: "format_bold",
    //     //         Action: e => {
    //     //             obj[3].actived = !this.state.bold;
    //     //             document.execCommand("bold", false, null);
    //     //             SetOpenAuxClick(obj, event, "AuxCamp");
    //     //         },
    //     //         actived: this.state.bold,
    //     //         name: "Bold <min>(Ctrl + B)</min>"
    //     //     },
    //     //     {
    //     //         icon: "format_italic",
    //     //         Action: e => {
    //     //             obj[4].actived = !this.state.italic;
    //     //             document.execCommand("italic", false, null);
    //     //             SetOpenAuxClick(obj, event, "AuxCamp");
    //     //         },
    //     //         actived: this.state.italic,
    //     //         name: "Italic <min>(Ctrl + I)</min>"
    //     //     },
    //     //     {
    //     //         icon: "format_underlined",
    //     //         Action: e => {
    //     //             obj[5].actived = !this.state.underline;
    //     //             document.execCommand("underline", false, null);
    //     //             SetOpenAuxClick(obj, event, "AuxCamp");
    //     //         },
    //     //         actived: this.state.underline,
    //     //         name: "Underline <min>(Ctrl + U)</min>"
    //     //     },
    //     // ]
    //     // if (selection.length == 0) {
    //     //     obj[0].disabled = true;
    //     //     obj[1].disabled = true;
    //     // }
    //     // SetOpenAuxClick(obj, event, "AuxCamp");
    // }

    render() {
        const { state, Movement, Selection, invoker } = this;
        const { data } = this.props.invoker;

        let time = new Date(data.time);

        if (state.closed == false) {
            return (
                <div className="Editor" ref={this.windowEditor} data-theme={state.theme} >

                    <div className="window" ref={this.windowElm} onMouseDown={Movement.DragWindow} >
                        <div className="title">
                            <img src={iconReact} alt="editor" />
                            <span>{state.title}</span>
                        </div>
                        <div className="btns">
                            <div className="wbtn" onClick={invoker.Close}><Mat>close</Mat></div>
                            {/* <div className="wbtn" ><Mat>close</Mat></div> */}
                        </div>
                    </div>
                    <div className="usereditor" ref={this.usereditor}>
                        <div className="note-editor-capm">
                            <div className="editor-header" ref={this.note__header}>
                                <div className="atras" onClick={invoker.Close}><Mat>keyboard_arrow_left</Mat></div>
                                <div className="note_name">
                                    <div className="container" ref={this.note_name_container}>
                                        <div className="saved">Guardando...</div>
                                        <input className="name" type="text"
                                            maxLength={23}
                                            onInput={this.UpdateName}
                                            ref={this.InputName}
                                            onKeyDown={this.SaveKey}
                                        // onAuxClick={this.AuxForInput}
                                        />
                                    </div>
                                </div>
                                <div className="lefting-part">

                                    {(state.updateReceived == true) && (
                                        // <div className="OpenSubMenu btnUpdateReceived " onClick={this.ClickUpdateReceived}>
                                        <div className="OpenSubMenu btnUpdateReceived ">
                                            <Mat>update</Mat>
                                            <div className="__update__tooltip">
                                                Se hicieron cambios en otra instancia de esta nota
                                                <br />
                                                Pulse para actualizar el contenido....
                                            </div>
                                        </div>
                                    )}

                                    <div className="OpenSubMenu" onClick={this.toggleTexturizeCamp} data-actived={String(state.force)}> <Mat>title</Mat></div>
                                    <div className="OpenSubMenu" onClick={this.toggleMenuTheme} data-actived={String(state.themeMenu)}> <Mat>format_paint</Mat></div>
                                    <div className="save" onClick={this.Save}><Mat>done</Mat></div>
                                </div>
                            </div>
                            <div className="note-editor">
                                <div className="note-data" ref={this.note__info} >{time.getFullYear()} {months[time.getMonth()]} {time.getDate()} {time.getHours()}:{time.getMinutes()}{(time.getHours() >= 12) ? "PM" : "AM"} | {state.charact} characters</div>
                                <div
                                    className="note-capm"
                                    contentEditable="true"
                                    ref={this.InputCamp}
                                    onKeyUp={this.UpdateCharact}
                                    onKeyDown={this.SaveKey}
                                    onPaste={Selection.preventPasteHTML}
                                // onAuxClick={this.AuxForCamp}
                                ></div>
                                <div className="selected_capm" data-active={(state.force == true) ? true : (state.themeMenu == true) ? false : (state.autoOpen == true) ? state.texturize : false}>
                                    <span className="titles">Seleccione estilo...</span>
                                    <div className="div">
                                        <CampBtn bold ad={state.bold}>format_bold</CampBtn>
                                        <CampBtn underline ad={state.underline}>format_underline</CampBtn>
                                        <CampBtn italic ad={state.italic}>format_italic</CampBtn>
                                    </div>

                                    <div className="material-icons AutoOpenBtn" onClick={() => this.setAutoOpen(!state.autoOpen)}>{(state.autoOpen) ? "expand_less" : "expand_more"}</div>
                                </div>
                                <div className="selected_theme" data-active={String(state.themeMenu)}>
                                    <span className="titles">Selecciona Temas</span>
                                    <div className="div">
                                        <ThemeBtn Editor={this} theme="dark">Oscuro</ThemeBtn>
                                        <ThemeBtn Editor={this} theme="yellow">Amarillo</ThemeBtn>
                                        <ThemeBtn Editor={this} theme="blue">Azul</ThemeBtn>
                                        <ThemeBtn Editor={this} theme="green">Verde</ThemeBtn>
                                        <ThemeBtn Editor={this} theme="red">Rojo</ThemeBtn>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="expandiblewindow" onMouseDown={Movement.ResizeWindow} ></div>

                </div>
            )
        }
    }
}

function ThemeBtn({ Editor, theme, children }: { theme: Themes, children: ReactNode, Editor: Editor }) {

    const { data } = Editor;

    function changeTheme() {
        Editor.invoker.setTheme(theme)
    }

    return (
        <div className="themeBtn" data-theme={theme} onClick={changeTheme} data-selected={data.theme == theme}>
            <div className="icon-theme">
                T
            </div>
            <div className="name-theme">{children}</div>
        </div>
    )
}
//Butons para bold,Italic,underline etc

function CampBtn(props: { ad: boolean, children: string, bold?: boolean, italic?: boolean, underline?: boolean }) {
    let type = Object.keys(props)[0];
    function Texturize() {
        document.execCommand(type, false)
    }
    return (
        <button className="item" onClick={Texturize} data-active={String(props.ad)}>
            <Mat>{props.children}</Mat>
        </button>
    )
}

export function Editors({ UI }: { UI: UINOTES }) {
    return (<>
        {[...UI.state.Editors.entries()].map(([id, item]: [string, OpenEditor]) => {
            return <Editor invoker={item} key={item.temporalId ?? item.data.id} />
        })}
    </>)
}