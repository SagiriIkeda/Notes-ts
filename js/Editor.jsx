
// bc.addEventListener('message',e => {
//     console.log(e.data);
//     texts.innerHTML = e.data;
// })

class NoteUpdateData {
    constructor(editor) {

        this.content = editor.content;
        this.folder = editor.folder;
        this.id = editor.id;
        this.position = editor.position;
        this.theme = editor.theme;
        this.title = editor.title;
        this.time = editor.time;
        this.v = editor.v;

        this.$$type = "NoteUpdateData";

        // console.log(editor);
    }
}

class Editor extends React.Component {
    constructor(id) {
        if (id != true) {
            Application.state.Editors.push(id);
        }
        super(id);
        //information;

        let DefaultData = DefaultNoteGenerate();

        let data = { ...DefaultData, ...DB.Notes.Obtain(id) };

        if (id == true) {
            data = JSON.parse(JSON.stringify(DefaultData));
        }
        let LastestSave = data.content;
        //references
        const windowEditor = document.createElement('div');
        windowEditor.className = "Editor";
        const TabEditor = document.createElement('div');
        TabEditor.className = "editortab";

        let TabInstance;
        let EditInstance;
        class Edit extends React.Component {
            constructor(pro) {
                super(pro);
                let autoup = true;
                if (localStorage.getItem('AutoUp') != undefined) {
                    autoup = JSON.parse(localStorage.getItem('AutoUp'));
                }
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
                EditInstance = this;
                //functions
                this.toggleTexturizeCamp = this.toggleTexturizeCamp.bind(this);
                this.SaveKey = this.SaveKey.bind(this);
                this.UpdateName = this.UpdateName.bind(this);
                this.UpdateCharact = this.UpdateCharact.bind(this);
                this.DragWindow = this.DragWindow.bind(this);
                this.SaveAnimation = this.SaveAnimation.bind(this);
                this.ResizeWindow = this.ResizeWindow.bind(this);
                this.closeWindow = this.closeWindow.bind(this);
                this.SelectionChange = this.SelectionChange.bind(this);
                this.MaxCampHeight = this.MaxCampHeight.bind(this);
                this.preventPasteHTML = this.preventPasteHTML.bind(this);
                this.AuxForCamp = this.AuxForCamp.bind(this);
                this.toggleMenuTheme = this.toggleMenuTheme.bind(this);
                this.setAutoOpen = this.setAutoOpen.bind(this);
                this.setAutoOpenClose = this.setAutoOpenClose.bind(this);
                this.AuxForInput = this.AuxForInput.bind(this);

                this.ClickUpdateReceived = this.ClickUpdateReceived.bind(this);

                //References 
                this.note_name_container = React.createRef();
                this.InputName = React.createRef();
                this.InputCamp = React.createRef();
                this.windowElm = React.createRef();

                this.usereditor = React.createRef();
                this.note__info = React.createRef();
                this.note__header = React.createRef();
                //vars
                this.pos1 = 0;
                this.pos2 = 0;
                this.pos3 = 0;
                this.pos4 = 0;
                this.timetorange;


                this.chachedUpdate = null;
            }

            ClickUpdateReceived() {

                data = { ...this.chachedUpdate }

                this.state.theme = data.theme;

                this.chachedUpdate = null;
                this.state.updateReceived = false;

                this.state.title = data.title;
                TabInstance.setState({ title: data.title })

                this.componentDidMount();
                SetTheme(data.theme);
            }

            UpdateName(event) {
                let value = event.target.value;
                data.title = event.target.value;
                this.setState({ title: value })
                data.title = value;
                TabInstance.setState({ title: value })
            }
            UpdateCharact(e) {
                data.content = EditInstance.InputCamp.current.innerHTML;
                let value = EditInstance.InputCamp.current.innerText;
                EditInstance.setState({ charact: value.length })
            }
            SaveAnimation() {
                this.note_name_container.current.classList.add('saving')
                setTimeout(() => {
                    if (this.note_name_container.current != undefined) {
                        this.note_name_container.current.classList.remove('saving');
                    }
                }, 3000);
            }
            SaveKey(e) {
                const keyCode = e.keyCode || e.which;

                if (keyCode === 116) {
                    e.returnValue = false;
                    if (e.preventDefault) e.preventDefault();
                    Save();
                }
            }
            componentDidMount() {
                this.InputName.current.value = data.title;
                this.InputCamp.current.innerHTML = data.content;
                LastestSave = this.InputCamp.current.innerHTML;
                this.UpdateCharact();
            }
            saveAutoUp(type) {
                localStorage.setItem('AutoUp', JSON.stringify(type));
            }
            toggleMenuTheme(e) {
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
            DragWindow(e) {
                if ((e.target.classList[0] == "wbtn") == false) {
                    e.preventDefault();
                    setIndex();
                    this.pos3 = e.clientX;
                    this.pos4 = e.clientY;
                    const elementDrag = e => {
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
                        SavePosition();
                    }

                    function closeDragElement(e) {
                        document.removeEventListener('mouseup', closeDragElement)
                        document.removeEventListener('mousemove', elementDrag)
                    }
                    document.addEventListener('mouseup', closeDragElement)
                    document.addEventListener('mousemove', elementDrag)
                }
            }
            ResizeWindow(e) {
                e.preventDefault();
                let maxscreenw = document.documentElement.scrollWidth;
                let maxscreenh = document.documentElement.scrollHeight;
                const changet = (e) => {
                    let ny = e.clientY;
                    let nx = e.clientX;
                    let rect = windowEditor.getBoundingClientRect();
                    let wetop = rect.top;
                    let weleft = rect.left;
                    let width = nx - weleft;
                    let height = ny - wetop;
                    let top = rect.top;
                    let left = rect.left;
                    let minheight = 272;
                    let minwidth = 360;
                    if (height < minheight) height = minheight;
                    if (width < minwidth) width = minwidth;
                    windowEditor.style.maxHeight = `${maxscreenh - top}px`;
                    windowEditor.style.maxWidth = `${maxscreenw - left}px`;
                    windowEditor.style.height = `${height}px`;
                    windowEditor.style.width = `${width}px`;
                    SavePosition();
                    this.MaxCampHeight();

                }
                document.addEventListener('mouseup', up)
                document.addEventListener('mousemove', changet)
                function up() {
                    // MaxCampHeight();
                    document.removeEventListener('mousemove', up)
                    document.removeEventListener('mousemove', changet)
                }
            }
            MaxCampHeight(s) {
                let usereditorheight = this.usereditor.current.getBoundingClientRect().height;

                let characterheight = this.note__info.current.getBoundingClientRect().height;
                let editorheaderHeight = this.note__header.current.getBoundingClientRect().height;
                let avaibleHeight = usereditorheight - characterheight - editorheaderHeight;

                avaibleHeight -= 1;
                if (s == true) {
                    avaibleHeight = avaibleHeight * 1.2;
                }
                this.InputCamp.current.style.maxHeight = `${avaibleHeight}px`;
            }
            SelectionChange(e) {
                // console.log(this.getSelectionHtml());
                let that = this;
                if (e.path[0].activeElement == this.InputCamp.current) {
                    clearInterval(this.timetorange);
                    let range = document.getSelection().toString();
                    //estilizar los botones
                    function IdentifierPropertis() {
                        let html = that.getSelectionHtml();
                        let parenttag = document.getSelection().anchorNode.parentNode.tagName;

                        if (html.search(/<i>.*?<\/i>/gim) != -1 || parenttag == "I") {
                            that.state.italic = true;
                        } else {
                            that.state.italic = false;
                        }

                        if (html.search(/<u>.*?<\/u>/gim) != -1 || parenttag == "U") {
                            that.state.underline = true;

                        } else {
                            that.state.underline = false;
                        }

                        if (html.search(/<b>.*?<\/b>/gim) != -1 || parenttag == "B") {
                            that.state.bold = true;

                        } else {
                            that.state.bold = false;
                        }

                        if (parenttag == "B" || parenttag == "I" || parenttag == "U") {
                            let actualparent = document.getSelection().anchorNode.parentNode;
                            let array = [];
                            let tag = actualparent.tagName;
                            array.push(tag)
                            if (actualparent.parentNode.tagName != "DIV") {
                                array.push(actualparent.parentNode.tagName)
                                if (actualparent.parentNode.parentNode.tagName != "DIV") {
                                    array.push(actualparent.parentNode.parentNode.tagName)
                                }
                            }
                            if (array.includes("I")) {
                                that.state.italic = true;
                            }
                            if (array.includes("U")) {
                                that.state.underline = true;
                            }
                            if (array.includes("B")) {
                                that.state.bold = true;
                            }
                            that.setState({})
                        }

                    }
                    //abrir y cerrar el menu de textura
                    if (range.length != 0) {
                        let ms = 0;
                        this.timetorange = setInterval(() => {
                            ms++;
                            if (ms >= 100) {
                                clearInterval(this.timetorange);
                                this.setState({
                                    texturize: true
                                })
                                ms = 0;
                            }
                        }, 1);

                    } else {
                        this.setState({
                            texturize: false
                        })
                    }
                    IdentifierPropertis();
                }

            }
            getSelectionHtml() {
                var html = "";
                if (typeof window.getSelection != "undefined") {
                    var sel = window.getSelection();
                    if (sel.rangeCount) {
                        var container = document.createElement("div");
                        for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                            container.appendChild(sel.getRangeAt(i).cloneContents());
                        }
                        html = container.innerHTML;
                    }
                } else if (typeof document.selection != "undefined") {
                    if (document.selection.type == "Text") {
                        html = document.selection.createRange().htmlText;
                    }
                }
                return html;
            }
            preventPasteHTML(e) {
                e.preventDefault();
                let text = e.clipboardData.getData("text/plain");
                document.execCommand('insertText', false, text);
            }
            componentWillMount() {
                setTimeout(() => {
                    this.MaxCampHeight(true);
                }, 1);
                document.addEventListener('selectionchange', this.SelectionChange);
            }
            closeWindow() {
                document.removeEventListener('selectionchange', this.SelectionChange);

                windowEditor.classList.add("closing");
                windowEditor.animate([
                    { transform: `scale(1)`, opacity: "1" },
                    { transform: `scale(0.8)`, opacity: "0" },
                ], {
                    duration: 300,
                    easing: "ease",
                    fill: "forwards",
                })
                setTimeout(() => {
                    this.setState({
                        closed: true
                    })
                    Application.state.Editors.splice(Application.state.Editors.findIndex(e => e == id), 1)
                }, 300);
            }
            setAutoOpen(e) {
                this.setState({
                    autoOpen: true
                })
                this.saveAutoUp(true);
            }
            setAutoOpenClose() {
                this.setState({
                    autoOpen: false
                })
                this.saveAutoUp(false);
            }
            AuxForInput(event) {
                let input = this.InputName.current;
                let obj = [
                    {
                        icon: "content_copy",
                        Action: e => {
                            document.execCommand("copy", false, null);
                        },
                        name: "Copiar <min>(Ctrl + C)</min>"
                    },
                    {
                        icon: "content_cut",
                        Action: e => {
                            document.execCommand("cut", false, null);
                        },
                        name: "Cortar <min>(Ctrl + X)</min>"
                    },
                    {
                        icon: "content_paste",
                        Action: e => {
                            navigator.clipboard.readText().then(text => {
                                document.execCommand("insertHTML", false, text);
                            })
                        },
                        // disabled:true,
                        name: "Pegar <min>(Ctrl + V)</min>"
                    },
                ]
                if (input.selectionEnd - input.selectionStart == 0) {
                    obj[0].disabled = true;
                    obj[1].disabled = true;
                }
                SetOpenAuxClick(obj, event, "AuxInput");
            }
            AuxForCamp(event) {
                let selection = this.getSelectionHtml().replace(/<.*?>/gim, '');
                let obj = [
                    {
                        icon: "content_copy",
                        Action: e => {
                            document.execCommand("copy", false, null);
                        },
                        name: "Copiar <min>(Ctrl + C)</min>"
                    },
                    {
                        icon: "content_cut",
                        Action: e => {
                            document.execCommand("cut", false, null);
                        },
                        name: "Cortar <min>(Ctrl + X)</min>"
                    },
                    {
                        icon: "content_paste",
                        Action: e => {
                            navigator.clipboard.readText().then(text => {
                                document.execCommand("insertHTML", false, text);
                            })
                        },
                        hr: true,
                        // disabled:true,
                        name: "Pegar <min>(Ctrl + V)</min>"
                    },
                    {
                        icon: "format_bold",
                        Action: e => {
                            obj[3].actived = !this.state.bold;
                            document.execCommand("bold", false, null);
                            SetOpenAuxClick(obj, event, "AuxCamp");
                        },
                        actived: this.state.bold,
                        name: "Bold <min>(Ctrl + B)</min>"
                    },
                    {
                        icon: "format_italic",
                        Action: e => {
                            obj[4].actived = !this.state.italic;
                            document.execCommand("italic", false, null);
                            SetOpenAuxClick(obj, event, "AuxCamp");
                        },
                        actived: this.state.italic,
                        name: "Italic <min>(Ctrl + I)</min>"
                    },
                    {
                        icon: "format_underlined",
                        Action: e => {
                            obj[5].actived = !this.state.underline;
                            document.execCommand("underline", false, null);
                            SetOpenAuxClick(obj, event, "AuxCamp");
                        },
                        actived: this.state.underline,
                        name: "Underline <min>(Ctrl + U)</min>"
                    },
                ]
                if (selection.length == 0) {
                    obj[0].disabled = true;
                    obj[1].disabled = true;
                }
                SetOpenAuxClick(obj, event, "AuxCamp");
            }
            render() {
                let time = new Date(data.time);
                if (this.state.closed == false) {
                    return (
                        <React.Fragment>

                            <div className="window" ref={this.windowElm} onMouseDown={this.DragWindow} >
                                <div className="title">
                                    <img src="source/icon-react.jpg" alt="editor" />
                                    <span>{this.state.title}</span>
                                </div>
                                <div className="btns">
                                    <div className="wbtn" onClick={CloseTotal.bind(false)} ><Mat>close</Mat></div>
                                </div>
                            </div>
                            <div className="usereditor" ref={this.usereditor}>
                                <div className="note-editor-capm">
                                    <div className="editor-header" ref={this.note__header}>
                                        <div className="atras" onClick={CloseTotal}>  <Mat>keyboard_arrow_left</Mat></div>
                                        <div className="note_name">
                                            <div className="container" ref={this.note_name_container}>
                                                <div className="saved">Guardando...</div>
                                                <input className="name" type="text"
                                                    maxLength={23}
                                                    onInput={this.UpdateName}
                                                    ref={this.InputName}
                                                    onKeyDown={this.SaveKey}
                                                    onAuxClick={this.AuxForInput}
                                                />
                                            </div>
                                        </div>
                                        <div className="lefting-part">

                                            {(this.state.updateReceived == true) && (
                                                <div className="OpenSubMenu btnUpdateReceived " onClick={this.ClickUpdateReceived}>
                                                    <Mat>update</Mat>
                                                    <div className="__update__tooltip">
                                                        Se hicieron cambios en otra instancia de esta nota
                                                        <br />
                                                        Pulse para actualizar el contenido....
                                                    </div>
                                                </div>
                                            )}

                                            <div className="OpenSubMenu" onClick={this.toggleTexturizeCamp} data-actived={String(this.state.force)}> <Mat>title</Mat></div>
                                            <div className="OpenSubMenu" onClick={this.toggleMenuTheme} data-actived={String(this.state.themeMenu)}> <Mat>format_paint</Mat></div>
                                            <div className="save" onClick={Save}> <Mat>done</Mat></div>

                                        </div>
                                    </div>
                                    <div className="note-editor">
                                        <div className="note-data" ref={this.note__info} >{time.getFullYear()} {months[time.getMonth()]} {time.getDate()} {time.getHours()}:{time.getMinutes()}{(time.getHours() >= 12) ? "PM" : "AM"} | {this.state.charact} characters</div>
                                        <div
                                            className="note-capm"
                                            contentEditable="true"
                                            ref={this.InputCamp}
                                            onKeyUp={this.UpdateCharact}
                                            onKeyDown={this.SaveKey}
                                            onPaste={this.preventPasteHTML}
                                            onAuxClick={this.AuxForCamp}
                                        ></div>
                                        <div className="selected_capm" data-active={(this.state.force == true) ? true : (this.state.themeMenu == true) ? false : (this.state.autoOpen == true) ? this.state.texturize : false}>
                                            <span className="titles">Seleccione estilo...</span>
                                            <div className="div">
                                                <CampBtn bold ad={this.state.bold}>format_bold</CampBtn>
                                                <CampBtn underline ad={this.state.underline}>format_underline</CampBtn>
                                                <CampBtn italic ad={this.state.italic}>format_italic</CampBtn>
                                            </div>
                                            {(this.state.autoOpen == true) ? (
                                                <div className="material-icons AutoOpenBtn" onClick={this.setAutoOpenClose}>expand_more</div>
                                            ) : (
                                                <div className="material-icons AutoOpenBtn" onClick={this.setAutoOpen}>expand_less</div>
                                            )}
                                        </div>
                                        <div className="selected_theme" data-active={String(this.state.themeMenu)}>
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
                            <div className="expandiblewindow" onMouseDown={this.ResizeWindow} ></div>

                        </React.Fragment>
                    )
                } else {
                    return (<div></div>);
                }
            }
        }

        function SetTheme(theme) {
            data.theme = theme;
            windowEditor.setAttribute('theme', theme);
            TabEditor.setAttribute('theme', theme)
            EditInstance.setState({ theme: theme })
        }
        function ThemeBtn(prop) {
            function changeTheme() {
                SetTheme(prop.theme)
            }
            return (
                <div className="themeBtn" theme={prop.theme} onClick={changeTheme} data-selected={data.theme == prop.theme}>
                    <div className="icon-theme">
                        T
                    </div>
                    <div className="name-theme">{prop.children}</div>
                </div>
            )
        }
        //Butons para bold,Italic,underline etc
        function CampBtn(prop) {
            let type = Object.keys(prop)[0];
            function Texturize() {
                document.execCommand(type, false, null)
            }
            return (
                <button className="item" onClick={Texturize} data-active={String(prop.ad)}>
                    <Mat>{prop.children}</Mat>
                </button>
            )
        }
        class Tab extends React.Component {
            constructor(props) {
                super(props);
                TabInstance = this;
                this.state = {
                    title: data.title,
                    closed: false
                }
            }
            closeTab() {
                this.setState({ closed: true })
            }
            render() {
                if (this.state.closed == false) {
                    return (
                        <React.Fragment>
                            <div class="icon">
                                <img src="source/icon-react.jpg" alt="editor" />
                            </div>
                            <span>{this.state.title}</span>
                            <i className="material-icons" onClick={CloseTotal}>close</i>
                        </React.Fragment>
                    )
                } else {
                    return (<div></div>)
                }
            }
        }


        function BcReceivedUpdate(e) {
            /**
             * @type {NoteUpdateData} 
             */
            const rdata = e.data;

            if (typeof rdata == "object" && rdata.$$type == "NoteUpdateData") {
                if (data.id == rdata.id) {
                    delete rdata.$$type;
                    // data = {...rdata};
                    EditInstance.chachedUpdate = rdata;
                    EditInstance.setState({
                        updateReceived: true,
                    })

                }
            }

        }

        bc.addEventListener('message', BcReceivedUpdate)

        document.querySelector('.Editors').appendChild(windowEditor);
        ReactDOM.render(<Edit />, windowEditor);
        document.querySelector('.activeEditors').appendChild(TabEditor)
        ReactDOM.render(<Tab />, TabEditor);

        //LOAD POSITION
        windowEditor.style.height = `${data.position.height}px`;
        windowEditor.style.width = `${data.position.width}px`;
        windowEditor.style.left = `${data.position.left}px`;
        windowEditor.style.top = `${data.position.top}px`;
        windowEditor.CloseEditor = CloseTotal;
        TabEditor.setAttribute('theme', data.theme)
        windowEditor.setAttribute('theme', data.theme);


        const self = this;

        //FINderid
        if (id != true) {
            windowEditor.setAttribute('identifier', id)
        }
        //SAVE FUNCTIONS
        function SavePosition() {
            if (id != true) {
                let construct = JSON.parse(JSON.stringify(data));

                let rect = windowEditor.getBoundingClientRect();
                let wswidth = rect.width
                let wsheight = rect.height;
                let wsleft = rect.left;
                let wstop = rect.top
                DB.Notes.Update(construct.id, {
                    position: {
                        width: wswidth,
                        height: wsheight,
                        top: wstop,
                        left: wsleft
                    }
                });
            }
        }
        TabEditor.addEventListener('click', setIndex)

        function Save() {
            LastestSave = data.content;
            EditInstance.SaveAnimation();
            let construct = JSON.parse(JSON.stringify(data));
            construct.time = Date.now();
            try {
                if (id == true) {//la nota no existe
                    let uuid = DB.Notes.Add(construct);
                    id = uuid;
                    data.id = uuid;
                    windowEditor.setAttribute('identifier', id);
                    Application.state.Editors.push(id);
                } else {//la nota si existe
                    construct.folder = DB.Notes.Obtain(data.id).folder;
                    DB.Notes.Update(construct.id, construct)

                }
            } catch (error) {
                QuotaLimit(error)
            }

            function QuotaLimit(error) {
                // c
                let message = "";

                if(error.name == "QuotaExceededError") {
                    message = "Se alcanzó el limite de localStorage (5MB) por lo que la Nota no fue posible guardarla..."
                }else {
                    message = "Error desconocido..."
                }

                console.error(error)
                Swal.fire({
                    title: "A ocurrido un error",
                    icon: "error",
                    text: message
                })
            }

            bc.postMessage(new NoteUpdateData(construct));

            EditInstance.chachedUpdate = null;
            EditInstance.setState({ updateReceived: false })

            SavePosition();

            Application.reloadData();
        }
        function setIndex() {
            windowEditor.classList.add("noanimation");
            document.querySelector('.Editors').appendChild(windowEditor);
        }
        //Close
        function CloseTotal(forceClose = false) {
            let construct = JSON.parse(JSON.stringify(data));
            if (forceClose == true) {
                closeanim();
            } else {
                if (construct.content != LastestSave) {
                    swal.fire({
                        icon: 'warning',
                        showCancelButton: true,
                        cancelButtonText: "Cancelar",
                        reverseButtons: true,
                        html: 'Aún no haz guardado<br> <b>¿estas seguro que deseas cerrar?</b>',
                        confirmButtonText: 'cerrar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            closeanim();
                        }
                    })
                } else {
                    closeanim();
                }
            }
            function closeanim() {
                bc.removeEventListener('message', BcReceivedUpdate)

                TabEditor.removeEventListener('click', setIndex)
                EditInstance.closeWindow();
                TabInstance.closeTab();
                TabEditor.parentNode.removeChild(TabEditor);
                setTimeout(e => {
                    windowEditor.parentNode.removeChild(windowEditor);
                }, 310)
            }
        }
    }
}



/**
 * 04/08/2022 15:59
 * Si ves esto RECUERDA VOLVER A SACAR .min de built/js/Aplication.js 
 */