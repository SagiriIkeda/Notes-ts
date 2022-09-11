import React, { createRef,FormEventHandler,KeyboardEvent,ReactNode, SyntheticEvent } from "react";
import Note, { Themes } from "../../../interfaces/notes";
import { Mat } from "../../prefabs";
import { months } from "../../timeAgo";
import OpenEditor from "./OpenEditor";

import iconReact from "../../../assets/icon-react.jpg";
import UINOTES from "../../UI";

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
    InputCamp = createRef<HTMLInputElement>();
    windowElm = createRef<HTMLDivElement>();
    data: Note;

    windowEditor = createRef<HTMLDivElement>();

    usereditor = createRef<HTMLDivElement>();
    note__info = createRef<HTMLDivElement>();
    note__header = createRef<HTMLDivElement>();


    pos1 = 0;
    pos2 = 0;
    pos3 = 0;
    pos4 = 0;
    timetorange = 0;

    constructor(props: EditorProps) {
        super(props);

        let autoup = true;

        if (localStorage.getItem('AutoUp') != undefined) {
            autoup = JSON.parse(localStorage.getItem('AutoUp') ?? "false");
        }
        this.data = props.invoker.data;
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

        this.DragWindow = this.DragWindow.bind(this);
        this.UpdateCharact = this.UpdateCharact.bind(this);
        this.UpdateName = this.UpdateName.bind(this);
        
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

    UpdateName(event : SyntheticEvent<HTMLInputElement, InputEvent> ) {
        const {invoker} = this.props;
        const {data} = this.props.invoker;
        const target = event.target as HTMLInputElement;
        if(target) {
            const {TabInstance} = invoker;
            let value = target.value;
            data.title = target.value;
            this.setState({ title: value })
            if(TabInstance) {
                TabInstance.setState({ title: value })
            }
        }
    }
    UpdateCharact() {
        const InputCamp = this.InputCamp.current;
        if(InputCamp) {
            this.props.invoker.data.content = InputCamp.innerHTML;
            let value = InputCamp.innerText;
            this.setState({ charact: value.length })
        }
    }
    // SaveAnimation() {
    //     this.note_name_container.current.classList.add('saving')
    //     setTimeout(() => {
    //         if (this.note_name_container.current != undefined) {
    //             this.note_name_container.current.classList.remove('saving');
    //         }
    //     }, 3000);
    // }
    // SaveKey(e) {
    //     const keyCode = e.keyCode || e.which;

    //     if (keyCode === 116) {
    //         e.returnValue = false;
    //         if (e.preventDefault) e.preventDefault();
    //         Save();
    //     }
    // }
    componentDidMount() {
        const {InputName,InputCamp,data} = this;
        if(InputName.current) {
            InputName.current.value = data.title;
        }
        if(InputCamp.current) {
            InputCamp.current.innerHTML = data.content;
        }
        // LastestSave = this.InputCamp.current.innerHTML;
        this.UpdateCharact();
    }
    // saveAutoUp(type) {
    //     localStorage.setItem('AutoUp', JSON.stringify(type));
    // }
    // toggleMenuTheme(e) {
    //     this.setState({
    //         themeMenu: !this.state.themeMenu,
    //         force: false,
    //         texturize: false
    //     })
    // }
    // toggleTexturizeCamp() {
    //     this.setState({
    //         force: !this.state.force,
    //         themeMenu: false
    //     })
    // }
    DragWindow(e : any) {
        const windowEditor = this.windowEditor.current;

        if(!windowEditor) return;

        if ((e.target?.classList[0] == "wbtn") == false) {

            e.preventDefault();
            // setIndex();
            this.pos3 = e.clientX;
            this.pos4 = e.clientY;
            const elementDrag = (e : any ) => {
                e.preventDefault();
                this.pos1 = this.pos3 - e.clientX;
                this.pos2 = this.pos4 - e.clientY;
                this.pos3 = e.clientX;
                this.pos4 = e.clientY;
                let dy = windowEditor.offsetTop - this.pos2;
                let dx = windowEditor.offsetLeft - this.pos1;
                let pagewidth = document.documentElement.scrollWidth;
                let pageheight = document.documentElement.scrollHeight - 123;
                let width = windowEditor.getBoundingClientRect().width;
                let height = windowEditor.getBoundingClientRect().height;
                if (dy + height > pageheight) dy = pageheight - height;
                if (dy < 0) dy = 0;
                if (dx + width > pagewidth) dx = pagewidth - width;
                if (dx < 0) dx = 0;
                windowEditor.style.top = `${dy}px`;
                windowEditor.style.left = `${dx}px`;
                // SavePosition();
            }

            function closeDragElement(e : any ) {
                document.removeEventListener('mouseup', closeDragElement)
                document.removeEventListener('mousemove', elementDrag)
            }
            document.addEventListener('mouseup', closeDragElement)
            document.addEventListener('mousemove', elementDrag)
        }
    }
    // ResizeWindow(e) {
    //     e.preventDefault();
    //     let maxscreenw = document.documentElement.scrollWidth;
    //     let maxscreenh = document.documentElement.scrollHeight;
    //     const changet = (e) => {
    //         let ny = e.clientY;
    //         let nx = e.clientX;
    //         let rect = windowEditor.getBoundingClientRect();
    //         let wetop = rect.top;
    //         let weleft = rect.left;
    //         let width = nx - weleft;
    //         let height = ny - wetop;
    //         let top = rect.top;
    //         let left = rect.left;
    //         let minheight = 272;
    //         let minwidth = 360;
    //         if (height < minheight) height = minheight;
    //         if (width < minwidth) width = minwidth;
    //         windowEditor.style.maxHeight = `${maxscreenh - top}px`;
    //         windowEditor.style.maxWidth = `${maxscreenw - left}px`;
    //         windowEditor.style.height = `${height}px`;
    //         windowEditor.style.width = `${width}px`;
    //         SavePosition();
    //         this.MaxCampHeight();

    //     }
    //     document.addEventListener('mouseup', up)
    //     document.addEventListener('mousemove', changet)
    //     function up() {
    //         // MaxCampHeight();
    //         document.removeEventListener('mousemove', up)
    //         document.removeEventListener('mousemove', changet)
    //     }
    // }
    // MaxCampHeight(s) {
    //     let usereditorheight = this.usereditor.current.getBoundingClientRect().height;

    //     let characterheight = this.note__info.current.getBoundingClientRect().height;
    //     let editorheaderHeight = this.note__header.current.getBoundingClientRect().height;
    //     let avaibleHeight = usereditorheight - characterheight - editorheaderHeight;

    //     avaibleHeight -= 1;
    //     if (s == true) {
    //         avaibleHeight = avaibleHeight * 1.2;
    //     }
    //     this.InputCamp.current.style.maxHeight = `${avaibleHeight}px`;
    // }
    // SelectionChange(e) {
    //     // console.log(this.getSelectionHtml());
    //     let that = this;
    //     if (e.path[0].activeElement == this.InputCamp.current) {
    //         clearInterval(this.timetorange);
    //         let range = document.getSelection().toString();
    //         //estilizar los botones
    //         function IdentifierPropertis() {
    //             let html = that.getSelectionHtml();
    //             let parenttag = document.getSelection().anchorNode.parentNode.tagName;

    //             if (html.search(/<i>.*?<\/i>/gim) != -1 || parenttag == "I") {
    //                 that.state.italic = true;
    //             } else {
    //                 that.state.italic = false;
    //             }

    //             if (html.search(/<u>.*?<\/u>/gim) != -1 || parenttag == "U") {
    //                 that.state.underline = true;

    //             } else {
    //                 that.state.underline = false;
    //             }

    //             if (html.search(/<b>.*?<\/b>/gim) != -1 || parenttag == "B") {
    //                 that.state.bold = true;

    //             } else {
    //                 that.state.bold = false;
    //             }

    //             if (parenttag == "B" || parenttag == "I" || parenttag == "U") {
    //                 let actualparent = document.getSelection().anchorNode.parentNode;
    //                 let array = [];
    //                 let tag = actualparent.tagName;
    //                 array.push(tag)
    //                 if (actualparent.parentNode.tagName != "DIV") {
    //                     array.push(actualparent.parentNode.tagName)
    //                     if (actualparent.parentNode.parentNode.tagName != "DIV") {
    //                         array.push(actualparent.parentNode.parentNode.tagName)
    //                     }
    //                 }
    //                 if (array.includes("I")) {
    //                     that.state.italic = true;
    //                 }
    //                 if (array.includes("U")) {
    //                     that.state.underline = true;
    //                 }
    //                 if (array.includes("B")) {
    //                     that.state.bold = true;
    //                 }
    //                 that.setState({})
    //             }

    //         }
    //         //abrir y cerrar el menu de textura
    //         if (range.length != 0) {
    //             let ms = 0;
    //             this.timetorange = setInterval(() => {
    //                 ms++;
    //                 if (ms >= 100) {
    //                     clearInterval(this.timetorange);
    //                     this.setState({
    //                         texturize: true
    //                     })
    //                     ms = 0;
    //                 }
    //             }, 1);

    //         } else {
    //             this.setState({
    //                 texturize: false
    //             })
    //         }
    //         IdentifierPropertis();
    //     }

    // }
    // getSelectionHtml() {
    //     var html = "";
    //     if (typeof window.getSelection != "undefined") {
    //         var sel = window.getSelection();
    //         if (sel.rangeCount) {
    //             var container = document.createElement("div");
    //             for (var i = 0, len = sel.rangeCount; i < len; ++i) {
    //                 container.appendChild(sel.getRangeAt(i).cloneContents());
    //             }
    //             html = container.innerHTML;
    //         }
    //     } else if (typeof document.selection != "undefined") {
    //         if (document.selection.type == "Text") {
    //             html = document.selection.createRange().htmlText;
    //         }
    //     }
    //     return html;
    // }
    // preventPasteHTML(e) {
    //     e.preventDefault();
    //     let text = e.clipboardData.getData("text/plain");
    //     document.execCommand('insertText', false, text);
    // }
    // componentWillMount() {
    //     setTimeout(() => {
    //         this.MaxCampHeight(true);
    //     }, 1);
    //     document.addEventListener('selectionchange', this.SelectionChange);
    // }
    // closeWindow() {
    //     document.removeEventListener('selectionchange', this.SelectionChange);

    //     windowEditor.classList.add("closing");
    //     windowEditor.animate([
    //         { transform: `scale(1)`, opacity: "1" },
    //         { transform: `scale(0.8)`, opacity: "0" },
    //     ], {
    //         duration: 300,
    //         easing: "ease",
    //         fill: "forwards",
    //     })
    //     setTimeout(() => {
    //         this.setState({
    //             closed: true
    //         })
    //         Application.state.Editors.splice(Application.state.Editors.findIndex(e => e == id), 1)
    //     }, 300);
    // }
    // setAutoOpen(e : boolean) {
    //     this.setState({
    //         autoOpen: true
    //     })
    //     this.saveAutoUp(true);
    // }
    // setAutoOpenClose() {
    //     this.setState({
    //         autoOpen: false
    //     })
    //     this.saveAutoUp(false);
    // }
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
        const { state } = this;
        const { data } = this.props.invoker;

        let time = new Date(data.time);
        if (state.closed == false) {
            return (
                <div className="Editor" ref={this.windowEditor} >

                    <div className="window" ref={this.windowElm} onMouseDown={this.DragWindow} >
                    {/* <div className="window" ref={this.windowElm} > */}
                        <div className="title">
                            <img src={iconReact} alt="editor" />
                            <span>{state.title}</span>
                        </div>
                        <div className="btns">
                            {/* <div className="wbtn" onClick={CloseTotal.bind(false)} ><Mat>close</Mat></div> */}
                            <div className="wbtn" ><Mat>close</Mat></div>
                        </div>
                    </div>
                    <div className="usereditor" ref={this.usereditor}>
                        <div className="note-editor-capm">
                            <div className="editor-header" ref={this.note__header}>
                                {/* <div className="atras" onClick={CloseTotal}>  <Mat>keyboard_arrow_left</Mat></div> */}
                                <div className="atras">  <Mat>keyboard_arrow_left</Mat></div>
                                <div className="note_name">
                                    <div className="container" ref={this.note_name_container}>
                                        <div className="saved">Guardando...</div>
                                        <input className="name" type="text"
                                            maxLength={23}
                                            onInput={this.UpdateName}
                                            ref={this.InputName}
                                        // onKeyDown={this.SaveKey}
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

                                    {/* <div className="OpenSubMenu" onClick={this.toggleTexturizeCamp} data-actived={String(state.force)}> <Mat>title</Mat></div> */}
                                    <div className="OpenSubMenu" data-actived={String(state.force)}> <Mat>title</Mat></div>
                                    {/* <div className="OpenSubMenu" onClick={this.toggleMenuTheme} data-actived={String(state.themeMenu)}> <Mat>format_paint</Mat></div> */}
                                    <div className="OpenSubMenu" data-actived={String(state.themeMenu)}> <Mat>format_paint</Mat></div>
                                    {/* <div className="save" onClick={Save}> <Mat>done</Mat></div> */}
                                    <div className="save"> <Mat>done</Mat></div>

                                </div>
                            </div>
                            <div className="note-editor">
                                <div className="note-data" ref={this.note__info} >{time.getFullYear()} {months[time.getMonth()]} {time.getDate()} {time.getHours()}:{time.getMinutes()}{(time.getHours() >= 12) ? "PM" : "AM"} | {state.charact} characters</div>
                                <div
                                    className="note-capm"
                                    contentEditable="true"
                                    ref={this.InputCamp}
                                onKeyUp={this.UpdateCharact}
                                // onKeyDown={this.SaveKey}
                                // onPaste={this.preventPasteHTML}
                                // onAuxClick={this.AuxForCamp}
                                ></div>
                                <div className="selected_capm" data-active={(state.force == true) ? true : (state.themeMenu == true) ? false : (state.autoOpen == true) ? state.texturize : false}>
                                    <span className="titles">Seleccione estilo...</span>
                                    <div className="div">
                                        <CampBtn bold ad={state.bold}>format_bold</CampBtn>
                                        <CampBtn underline ad={state.underline}>format_underline</CampBtn>
                                        <CampBtn italic ad={state.italic}>format_italic</CampBtn>
                                    </div>
                                    {(state.autoOpen == true) ? (
                                        // <div className="material-icons AutoOpenBtn" onClick={this.setAutoOpenClose}>expand_more</div>
                                        <div className="material-icons AutoOpenBtn">expand_more</div>
                                    ) : (
                                        // <div className="material-icons AutoOpenBtn" onClick={this.setAutoOpen}>expand_less</div>
                                        <div className="material-icons AutoOpenBtn">expand_less</div>
                                    )}
                                </div>
                                <div className="selected_theme" data-active={String(state.themeMenu)}>
                                    <span className="titles">Selecciona Temas</span>
                                    <div className="div">
                                        <ThemeBtn theme="dark">Oscuro</ThemeBtn>
                                        <ThemeBtn theme="yellow">Amarillo</ThemeBtn>
                                        <ThemeBtn theme="blue">Azul</ThemeBtn>
                                        <ThemeBtn theme="green">Verde</ThemeBtn>
                                        <ThemeBtn theme="red">Rojo</ThemeBtn>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* <div className="expandiblewindow" onMouseDown={this.ResizeWindow} ></div> */}
                    <div className="expandiblewindow"></div>

                </div>
            )
        } else {
            return (<div></div>);
        }
    }
}

function SetTheme(theme: Themes) {
    // data.theme = theme;
    // windowEditor.setAttribute('theme', theme);
    // TabEditor.setAttribute('theme', theme)
    // EditInstance.setState({ theme: theme })
}
function ThemeBtn(props: { theme: Themes, children: ReactNode }) {
    const data: Note = {
        id: "",
        content: "",
        folder: "",
        theme: "dark",
        time: 0,
        title: "",
        position: {
            width: 0,
            height: 0,
            left: 0,
            top: 0
        },
        v: ""
    }
    function changeTheme() {
        SetTheme(props.theme)
    }
    return (
        <div className="themeBtn" data-theme={props.theme} onClick={changeTheme} data-selected={data.theme == props.theme}>
            <div className="icon-theme">
                T
            </div>
            <div className="name-theme">{props.children}</div>
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
            return <Editor invoker={item} key={id} />
        })}
    </>)
}