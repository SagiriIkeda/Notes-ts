import React, { createRef, FormEventHandler, KeyboardEvent, ReactNode, SyntheticEvent } from "react";
import Note, { Themes } from "../../../interfaces/notes";
import { Mat } from "../../prefabs";
import { months } from "../../../../libraries/timeAgo/timeAgo";
import OpenEditor from "./OpenEditor";

import iconReact from "../../../assets/icon-react.jpg";
import UINOTES from "../../UI";
import EditorMovement from "./Movement";
import EditorSelection from "./Selection";
import DB, { AutoUP } from "../../../db/database";
import { AuxList } from "../../AuxMenu/item";
import EditorsBar from "./Bar";
import Tooltip, { Theme } from "../../../../libraries/Tooltips/Tooltips2";
import { EDITORCONFIG } from "../../../interfaces/config";


interface EditorProps {
    invoker: OpenEditor,
}

interface EditorState {
    title: Note["title"],
    theme: Note["theme"],

    force: boolean,
    themeMenu: boolean,

    updateReceived: boolean,
    folderDeleted: boolean,
    autoUP: boolean,

    saved: boolean,

    charact: number,
    texturize: boolean,
    closed: boolean,
    bold: boolean,
    underline: boolean,
    italic: boolean,
}

export default class Editor extends React.Component<EditorProps, EditorState> {

    editor_note_name_container = createRef<HTMLDivElement>();
    editor_ui_container = createRef<HTMLDivElement>();
    editor_date = createRef<HTMLDivElement>();
    editor_ui_header = createRef<HTMLDivElement>();
    editor_input_name = createRef<HTMLInputElement>();
    editor_window = createRef<HTMLDivElement>();
    content_editable_input = createRef<HTMLDivElement>();
    // windowElm = createRef<HTMLDivElement>();

    data: Note;
    invoker: OpenEditor;

    Movement = new EditorMovement({ Editor: this });
    Selection = new EditorSelection({ Editor: this });

    chached_update_received?: Note;

    public state;

    constructor(props: EditorProps) {
        super(props);

        this.invoker = props.invoker;

        this.data = this.invoker.data;

        const { data } = this;

        this.state = {
            title: data.title,
            theme: data.theme,
            charact: 0,
            autoUP: AutoUP.get(),
            updateReceived: false,
            folderDeleted: false,
            saved: true,

            texturize: false,
            closed: false,
            bold: false,
            underline: false,
            italic: false,

            force: false,
            themeMenu: false,
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
        this.AuxInput = this.AuxInput.bind(this);
        this.AuxCamp = this.AuxCamp.bind(this);
        this.onClickUpdateReceived = this.onClickUpdateReceived.bind(this);
        this.ctrlKeyEvents = this.ctrlKeyEvents.bind(this);
    }

    onClickUpdateReceived() {
        const { invoker } = this;
        const { TabInstance } = invoker;
        const prevData = this.data;

        invoker.data = { ...this.chached_update_received } as Note;
        this.data = invoker.data;
        this.data.position = prevData.position;

        this.state.theme = invoker.data.theme;
        this.state.updateReceived = false;
        this.chached_update_received = undefined;
        this.state.title = invoker.data.title;
        invoker.lastest_save = invoker.data.content;

        TabInstance?.setState({ title: invoker.data.title, theme: invoker.data.theme })

        this.componentDidMount();
    }

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
        const content_editable_input = this.content_editable_input.current;
        const { invoker } = this.props;
        if (content_editable_input) {

            invoker.data.content = content_editable_input.innerHTML;

            this.state.saved = invoker.data.content == invoker.lastest_save;

            const value = content_editable_input.innerText;
            this.setState({ charact: value.length })
        }
    }

    SavePosition() {
        const { invoker } = this;
        const { data, id } = invoker;

        if (id) {
            DB.Notes.update(id, { position: data.position });
        }
    }

    Save() {
        this.SaveAnimation();
        this.invoker.Save();
    }

    SaveAnimation() {
        const note_name_container = this.editor_note_name_container.current;
        if (note_name_container) {
            note_name_container.classList.add('saving');
            setTimeout(() => {
                note_name_container.classList.remove('saving');
            }, 3000);
        }
    }

    SaveKey(e: React.KeyboardEvent) {
        const keyCode = e.keyCode;

        if (keyCode === 116) {//key "F5"
            e?.preventDefault();
            this.Save();
        }
    }

    ctrlKeyEvents(e: React.KeyboardEvent) {
        const KeyCode = e.keyCode;

        if (e.ctrlKey) {

            if (KeyCode === 83) {//key "S"
                e.preventDefault();
                e.stopPropagation();
                this.Save();
            };
        }
    }

    componentDidMount() {
        const { editor_input_name, content_editable_input, data, Selection } = this;
        const windowEditor = this.editor_window.current;
        if (editor_input_name.current) {
            editor_input_name.current.value = data.title;
        }
        if (content_editable_input.current) {
            content_editable_input.current.innerHTML = data.content;
        }
        
        document.addEventListener('selectionchange', Selection.SelectionChange);
        this.MaxCampHeight(true);

        if (windowEditor) {

            windowEditor.style.minWidth = `${EDITORCONFIG.MIN_WIDTH}px`;
            windowEditor.style.height = `${data.position.height}px`;
            windowEditor.style.width = `${data.position.width}px`;
            windowEditor.style.left = `${data.position.left}px`;
            windowEditor.style.top = `${data.position.top}px`;
        }

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

    MaxCampHeight(isWindowAnimating?: boolean) {
        const editor_ui_container = this.editor_ui_container.current;
        const editor_date = this.editor_date.current as HTMLDivElement;
        const editor_ui_header = this.editor_ui_header.current as HTMLDivElement;
        const content_editable_input = this.content_editable_input.current as HTMLInputElement;

        if (editor_ui_container) {
            const ui_container_height = editor_ui_container.getBoundingClientRect().height;
            const date_height = editor_date.getBoundingClientRect().height;
            const header_height = editor_ui_header.getBoundingClientRect().height;

            let avaibleHeight = ui_container_height - date_height - header_height;

            avaibleHeight -= 1;
            if (isWindowAnimating === true) {
                avaibleHeight = avaibleHeight * 1.25;
            }
            content_editable_input.style.maxHeight = `${avaibleHeight - 5}px`;
        }
    }

    closeWindow() {
        return new Promise((resolve, reject) => {
            const { Selection, invoker } = this;

            const windowEditor = this.editor_window.current;
            this.invoker.Socket.delete();

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
    setAutoOpen(type = true) {
        if (type != this.state.autoUP) {
            this.setState({
                autoUP: type
            })
            AutoUP.set(type)
        }
    }

    AuxInput(event: React.MouseEvent) {
        const input = this.editor_input_name.current;
        if (input) {
            const obj: AuxList = [
                {
                    icon: "content_copy",
                    name: "Copiar",
                    desc: "(Ctrl + C)",
                    action: () => {
                        document.execCommand("copy", false);
                    },
                },
                {
                    icon: "content_cut",
                    name: "Cortar",
                    desc: "(Ctrl + X)",
                    action: () => {
                        document.execCommand("cut", false);
                    },
                },
                {
                    icon: "content_paste",
                    name: "Pegar",
                    desc: "(Ctrl + V)",
                    action: () => {
                        navigator.clipboard.readText().then(text => {
                            document.execCommand("insertHTML", false, text);
                        })
                    },
                    // disabled:true,
                },
            ]
            if (input.selectionEnd == null || input.selectionStart == null || input.selectionEnd - input.selectionStart == 0) {
                obj[0].disabled = true;
                obj[1].disabled = true;
            }
            this.invoker.UI.AUX?.set(obj, event, "AuxInput");
        }

    }
    AuxCamp(event: React.MouseEvent) {
        const { UI } = this.invoker;
        const selection = this.Selection.getSelectionHtml().replace(/<.*?>/gim, '');
        const obj: AuxList = [
            {
                icon: "content_copy",
                name: "Copiar",
                desc: "(Ctrl + C)",
                action: () => {
                    document.execCommand("copy", false);
                },
            },
            {
                icon: "content_cut",
                name: "Cortar",
                desc: "(Ctrl + X)",
                action: () => {
                    document.execCommand("cut", false);
                },
            },
            {
                icon: "content_paste",
                hr: true,
                // disabled:true,
                name: "Pegar",
                desc: "(Ctrl + V)",
                action: () => {
                    navigator.clipboard.readText().then(text => {
                        document.execCommand("insertHTML", false, text);
                    })
                },
            },
            {
                icon: "format_bold",
                actived: this.state.bold,
                name: "Bold",
                desc: "(Ctrl + B)",
                action: () => {
                    obj[3].actived = !this.state.bold;
                    document.execCommand("bold", false);
                    UI.AUX?.set(obj, event, "AuxCamp");
                    return false;

                },
            },
            {
                icon: "format_italic",
                actived: this.state.italic,
                name: "Italic",
                desc: "(Ctrl + I)",
                action: () => {
                    obj[4].actived = !this.state.italic;
                    document.execCommand("italic", false);
                    UI.AUX?.set(obj, event, "AuxCamp");
                    return false;

                },
            },
            {
                icon: "format_underlined",
                actived: this.state.underline,
                name: "Underline",
                desc: "(Ctrl + U)",
                action: () => {
                    obj[5].actived = !this.state.underline;
                    document.execCommand("underline", false);
                    UI.AUX?.set(obj, event, "AuxCamp");
                    return false;
                },
            },
        ]
        if (selection.length == 0) {
            obj[0].disabled = true;
            obj[1].disabled = true;
        }
        UI.AUX?.set(obj, event, "AuxCamp");
    }

    render() {
        const { state, Movement, Selection, invoker } = this;
        const { data } = this.props.invoker;

        const TooltipTheme: Theme = (state.theme == "dark") ? "light" : "dark";

        const time = new Date(data.time);

        if (state.closed == false) {
            return (
                <div className="Editor-window" ref={this.editor_window} data-theme={state.theme} >

                    <div className="window-header" onMouseDown={Movement.DragWindow} >
                        <div className="window-title">
                            <img src={iconReact} alt="editor" />
                            <span>{state.title}</span>

                            {(state.saved == false) && (<Tooltip
                                text="Hay cambios sin guardar"
                                maxWidth="200px"
                                className={["EditorTooltip dontSavedTooltip "]}
                                theme={TooltipTheme}
                            >
                                <div className="dontSavedIndicator" ></div>
                            </Tooltip>)}
                        </div>
                        <div className="window-buttons">
                            <div className="wbtn" onClick={invoker.Close}><Mat>close</Mat></div>
                        </div>
                    </div>
                    <div className="editor-ui-container" ref={this.editor_ui_container}>
                        <div className="editor-ui">
                            <div className="editor-ui-header" ref={this.editor_ui_header}>
                                <div className="left-part">
                                    {(state.folderDeleted == true) && (
                                        <Tooltip
                                            text="La carpeta en la que se iba a crear esta nota fue borrada"
                                            description="Se cambió la carpeta a la principal"
                                            maxWidth="200px"
                                            className={["EditorTooltip"]}
                                            theme={TooltipTheme}
                                        >
                                            <div className="menu-btn warn-btn"><Mat>folder_delete</Mat></div>
                                        </Tooltip>
                                    )}
                                    <div className="back-btn" onClick={invoker.Close}><Mat>keyboard_arrow_left</Mat></div>
                                </div>

                                <div className="editor-ui-note-name">
                                    <div className="editor-ui-note-name-container" ref={this.editor_note_name_container}>
                                        <div className="save-placeholder">Guardando...</div>
                                        <input className="name-input" type="text"
                                            maxLength={23}
                                            onInput={this.UpdateName}
                                            ref={this.editor_input_name}
                                            onKeyDown={this.SaveKey}
                                            onAuxClick={this.AuxInput}
                                        />
                                    </div>
                                </div>
                                <div className="right-part">

                                    {(state.updateReceived == true) && (
                                        <Tooltip
                                            text="Se hicieron cambios en otra instancia de esta nota"
                                            description="Pulse para actualizar el contenido...."
                                            maxWidth="200px"
                                            className={["EditorTooltip"]}
                                            theme={TooltipTheme}
                                        >
                                            <div className="menu-btn" onClick={this.onClickUpdateReceived} ><Mat>update</Mat></div>
                                        </Tooltip>
                                    )}

                                    <div className="menu-btn" onClick={this.toggleTexturizeCamp} data-actived={String(state.force)}> <Mat>title</Mat></div>
                                    <div className="menu-btn" onClick={this.toggleMenuTheme} data-actived={String(state.themeMenu)}> <Mat>format_paint</Mat></div>
                                    <div className="save-btn" onClick={this.Save}><Mat>done</Mat></div>
                                </div>
                            </div>
                            <div className="editor-ui-content-container">
                                <div className="editor-date" ref={this.editor_date} >
                                    {time.getFullYear()} {months[time.getMonth()]} {time.getDate()} {time.getHours()}:{time.getMinutes()}{(time.getHours() >= 12) ? "PM" : "AM"} | {state.charact} carácteres
                                </div>
                                <div className="content-editable-input"
                                    contentEditable="true"
                                    ref={this.content_editable_input}
                                    onKeyUp={this.UpdateCharact}
                                    onKeyDownCapture={this.ctrlKeyEvents}
                                    onKeyDown={this.SaveKey}
                                    onPaste={Selection.preventPasteHTML}
                                    onAuxClick={this.AuxCamp}
                                ></div>
                                <div className="texture-menu-container" data-active={(state.force == true) ? true : (state.themeMenu == true) ? false : (state.autoUP == true) ? state.texturize : false}>
                                    <span className="menu-title">Seleccione un estilo...</span>
                                    <div className="menu-items-container">
                                        <CampBtn bold ad={state.bold}>format_bold</CampBtn>
                                        <CampBtn underline ad={state.underline}>format_underline</CampBtn>
                                        <CampBtn italic ad={state.italic}>format_italic</CampBtn>
                                    </div>
                                    <Mat className="AutoOpenBtn" onClick={() => this.setAutoOpen(!state.autoUP)}>{(state.autoUP) ? "expand_less" : "expand_more"}</Mat>
                                </div>
                                <div className="theme-menu-container" data-active={String(state.themeMenu)}>
                                    <span className="menu-title">Selecciona un Tema</span>
                                    <div className="menu-items-container">
                                        <ThemeBtn Editor={this} theme="dark">Oscuro</ThemeBtn>
                                        <ThemeBtn Editor={this} theme="yellow">Amarillo</ThemeBtn>
                                        <ThemeBtn Editor={this} theme="blue">Azul</ThemeBtn>
                                        <ThemeBtn Editor={this} theme="green">Verde</ThemeBtn>
                                        <ThemeBtn Editor={this} theme="red">Rojo</ThemeBtn>
                                        <ThemeBtn Editor={this} theme="purple">Morado</ThemeBtn>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="window-resize-btn" onMouseDown={Movement.ResizeWindow} ></div>

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


export function DevEditors({ UI }: { UI: UINOTES }) {
    return (<EditorsBar UI={UI} />)
}