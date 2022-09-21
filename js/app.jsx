let firstLoad = true;
let drgSection = React.createRef();
let firstSelected = false;

const bc = new BroadcastChannel("Notas");


class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            Notes: DB.Notes.Content,
            Folders: DB.Folders.Content,
            activeFolder: 0,
            Editors: [],
            SelectMode: false,
            selectes: [],
            findText: ""
        }
        Application = this;
        this.SearchInput = React.createRef();
        this.version = "v4.2";
        this.AuxForFolderSection = this.AuxForFolderSection.bind(this);
        if(localStorage.getItem('ActiveFolder') != undefined){
            this.state.activeFolder = localStorage.getItem('ActiveFolder');
            if(DB.Folders.Obtain(this.state.activeFolder) == false){
                this.state.activeFolder = 0;
            }
        }
        const self = this;

        function UpdateInfoBC({data} = e) {
            if(data == "UpdateApplication") {
                DB.Notes.Load();
                DB.Folders.Load();
                self.reloadData(false);
            }
        }

        // this.built = crypto.randomUUID()
        this.built = "0d21cae2-701b-43da-affc-2e017cc118af"

        bc.addEventListener("message",UpdateInfoBC)

    }
    changeFindText(e) {
        let value = e.target.value;
        Application.setState({
            findText: value
        })
    }
    cancelFind() {
        Application.SearchInput.current.value = "";
        Application.setState({
            findText: ""
        })
    }
    setSelectMode(mode) {
        if(Application.state.SelectMode != mode) {
            firstSelected = mode;
            Application.setState({SelectMode: mode})
        }
    }
    CloseSelectMode() {
        Application.state.selectes = [];
        Application.setSelectMode(false);
    }
    DeleteSelectes() {
        Swal.fire({
            // title: 'Estas Seguro?',
            showCancelButton:true,
            cancelButtonText:"Cancelar",
            reverseButtons:true,
            html: "<h2>¿Estás seguro?</h2>Una vez borradas no hay forma de recuperarlas!",
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Borrar',
            icon: 'warning'
          }).then((result) => {
            if (result.isConfirmed) {
                Application.state.selectes.forEach(id => {
                    if(document.querySelector(`.Editor[identifier="${id}"]`)){
                        document.querySelector(`.Editor[identifier="${id}"]`).CloseEditor(true);
                    }
                    DB.Notes.Remove(id);
                })
                Application.state.selectes = [];
                Application.state.SelectMode = false;
                Application.reloadData();
            }
        })
    }
    ShowSelectes() {
        let filter = DB.Notes.Search("folder",Application.state.activeFolder).map(e => e.id);
        if(Application.state.selectes.length == filter.length) {
            Application.setState({
                selectes: []
            })
        }else {
            Application.setState({
                selectes: filter
            })
        }
    }
    componentDidMount() {
        drgSection.current.style.maxHeight = `${document.body.offsetHeight - 235}px`
        document.body.classList.add("loadded");
        // console.log(`Render in ${Date.now() - timeI}ms`);
    }
    reloadData(sendUpdateToBc = true) {
        sendUpdateToBc == true && bc.postMessage("UpdateApplication");
        this.setState({
            Notes: DB.Notes.Content,
            Folders: DB.Folders.Content
        })
    }
    setFolder(id) {
        if(id != this.state.activeFolder){
            firstLoad = true;
            localStorage.setItem('ActiveFolder',id)
            this.setState({
                activeFolder: id,
                SelectMode:false,
                selectes: []
            })
        }
    }
    AuxForFolderSection(event) {
        if(event.target.classList.contains("DragableFolders")){
            let obj =[
                {
                    icon:"create_new_folder",
                    Action:e => {
                        CreateFolder();
                    },
                    name:"Crear Carpeta"
                },
            ]
            SetOpenAuxClick(obj,event,"NewFolder");
        }
    }
    render() {
        return (
            <Data.Provider value={this.state}>
                <div className="header">
                    <div className="foldername">{DB.Folders.Obtain(this.state.activeFolder).name}</div>
                </div>
                <div className="sections">
                    <div className="folders-section"
                        onAuxClick={this.AuxForFolderSection}
                        >
                        <FolderSection/>
                    </div>
                    <div className="notes-sections">
                        <NotesSection/>
                    </div>
                </div>
                <div className={`FloatBtn ${(Application.state.SelectMode == true)? "ocult":""}`}
                    onClick={NewNote}
                    >
                    <Mat>add</Mat>
                </div>
                <div className="Editors" id="Editors">
                </div>
                <div className={`SelectBox ${(this.state.SelectMode == true)? "visible":""}`}>
                <span className="titles" >¿Que Desea hacer?</span>
                    <div className="div">
                        <div className="item" onClick={Application.DeleteSelectes} ><Mat>delete</Mat> Borrar</div>
                        <div className="item" onClick={OpenMoveFolder}><Mat>drive_file_move_rtl</Mat> Mover a...</div>
                        <div className="item" onClick={Application.CloseSelectMode}><Mat>close</Mat> Cancelar</div>
                    </div>
                </div>
            </Data.Provider>
        )
    }
}
function FolderSection() {
    let context = React.useContext(Data);
    let Folders = context.Folders;
    Folders.sort((a,b) => a.order-b.order);
    return (
        <React.Fragment>
            <div className="container">
                <h2 className="text"><Mat>folder</Mat> Carpetas</h2>
                <Folder key={0} data={DB.Folders.Obtain(0)}/>
                <div className="DragableFolders" ref={drgSection}>
                    {Folders.map(fold => {
                        if(fold.id != 0){
                            return (<Folder key={fold.id} data={fold} />)
                        }
                    })}
                </div>
            </div>
            <div className="CreateBtn" onClick={CreateFolder}>Nueva Carpeta</div>
        </React.Fragment>
    )
}
function Folder(prop) {
    let itemfolder = React.createRef();
    React.useEffect(() => {
        itemfolder.current.identifier = prop.data.id;
    })
    function Click(e) {
        if(e.buttons == 1) {
            let mss = 0;
            let timers = 15;
            let intervals = setInterval(() => {
                if(mss >= timers && prop.data.id != 0) {
                    clearInterval(intervals);
                    document.removeEventListener('mousemove',mousemoved)
                    if(prop.data.id != "0"){
                        let ams = 0;
                        let atimer = 10;
                        let ainterval = setInterval(() => {
                            if(ams >= atimer){
                                clearInterval(ainterval);
                                up();
                                DeleteFolder(prop.data.id);
                            }
                            ams += 1;
                        }, 100);
                        //sortable
                        let item = e.target;
                        let father = item.parentNode;
                        let height = item.getBoundingClientRect().height;
                        item.classList.add("dragin");
                        document.addEventListener('mousemove',AlignPosition);
                        document.addEventListener('mouseup',up);
                        father.classList.add("dragger");
                        let AnimationElm = document.createElement('div');
                            AnimationElm.className = "AnimationIndicator";
                            AnimationElm.style.height = `${height}px`;
                        let ItemReact = item.getBoundingClientRect().top + height;
                        let InitialHeight = e.nativeEvent.offsetY;
                        item.style.top = `${e.clientY - InitialHeight - 5}px`;
                        father.insertBefore(AnimationElm,item);
                        function AlignPosition(e) {
                            clearInterval(ainterval);
                            item.style.top = `${e.clientY - InitialHeight}px`;
                        }
                        father.querySelectorAll('.folder').forEach(sitem => {
                            sitem.addEventListener('mouseover',Sortable)
                        })
                        function Sortable(e) {
                            let targetRect = e.target.getBoundingClientRect().top + height;
                            let sibling = e.target;
                            if(targetRect > ItemReact){
                                sibling = e.target.nextElementSibling;
                            }
                            let ContracAnimation = document.createElement('div');
                                ContracAnimation.className = "ContractAnimation";
                                father.insertBefore(ContracAnimation,AnimationElm);
                            let animation = {
                                easing:"ease",
                                fill:"forwards",
                                duration: 250
                            }
                            ContracAnimation.animate([{height:`${AnimationElm.getBoundingClientRect().height}px`},{height:"0px"}],animation)
                            AnimationElm.animate([{height:"0px"},{height:`${height}px`}],animation);
                            setTimeout(i => { father.removeChild(ContracAnimation); },250);
                            father.insertBefore(AnimationElm,sibling);
                            ItemReact = targetRect;
                        }
                        function up(e) {
                            clearInterval(ainterval);
                            father.classList.add("OUTDRAGER");
                            father.classList.remove("dragger");
                            item.classList.add("ofDragin");
                            let y = AnimationElm.getBoundingClientRect().top;
                            setTimeout(() => {
                                item.style.top = `${y - 2}px`;
                            }, 1);
                            father.insertBefore(item,AnimationElm);
                            setTimeout(() => {
                                father.classList.remove("OUTDRAGER");
                                item.classList.remove("dragin");
                                item.classList.remove("ofDragin");
                                item.style.top = null;
                                father.removeChild(AnimationElm);
                            }, 250);
                            father.querySelectorAll('.folder').forEach((sitem,order) => {
                                let id = sitem.identifier;
                                DB.Folders.Update(id,{order:order+1});
                                sitem.removeEventListener('mouseover',Sortable);
                            })
                            Application.state.Folders = DB.Folders.Content;
                            document.removeEventListener('mousemove',AlignPosition);
                            document.removeEventListener('mouseup',up);
                        }
                    }
                }
                mss += 1;
            }, 15);
            itemfolder.current.addEventListener('mouseup',upped)
            document.addEventListener('mousemove',mousemoved)
            function mousemoved(e) {
                if(mss < timers) {
                    clearInterval(intervals);
                }
                document.removeEventListener('mousemove',mousemoved)
            }
            function upped(e) {
                clearInterval(intervals);
                if(itemfolder.current != null){
                    itemfolder.current.removeEventListener('mouseup',upped);
                }
                if(mss < timers) {
                    Application.setFolder(prop.data.id);
                }
            }
        }
    }
    function AuxEvent(event) {
        let obj = [
            {
                icon:"folder_open",
                Action:e => {
                    Application.setFolder(prop.data.id);
                },
                name:"Abrir Carpeta"
            },
            {
                icon:"create_new_folder",
                Action:e => {
                    CreateFolder();
                },
                name:"Crear Carpeta"
            },
            {
                icon:"edit",
                Action:e => {
                    RenameFolder(prop.data.id);
                },
                name:"Renombar Carpeta"
            },
            {
                icon:"folder_delete",
                Action:e => {
                    DeleteFolder(prop.data.id);
                },
                danger:true,
                name:"Eliminar Carpeta"
            },
        ]
        if(prop.data.id == 0) {
            obj.splice(2,2);
        }
        SetOpenAuxClick(obj,event,"FolderAux");
    }
    return (
    <div 
        className={`folder${(Application.state.activeFolder == prop.data.id)?" active":""}`}
        onMouseDown={Click}
        onAuxClick={AuxEvent}
        ref={itemfolder}>
        <span className="folder__name">
            <Mat>arrow_forward_ios</Mat>{prop.data.name}
        </span>
        {DB.Notes.Search("folder",prop.data.id).length}
    </div>
    )
}

class NotePreview extends React.Component {
    constructor(props) {
        super(props)
        this.Click = this.Click.bind(this);
        this.OpenNote = this.OpenNote.bind(this);
        this.SelectThis = this.SelectThis.bind(this);
        this.AuxEvent = this.AuxEvent.bind(this);
        // refs
        this.note = React.createRef();
    }
    UpdateContentPrev() {
        let height = Math.round(this.note.current.getBoundingClientRect().height / 10);
        if(height == 7) { height = 8; }
        if(height == 9) { height = 10; }
        if(height == 11) { height = 12; }
        this.note.current.style.gridRowEnd = `span ${height}`;
    }
    componentDidUpdate() {
        this.UpdateContentPrev();
    }
    componentDidMount() {
        firstLoad = false;
        this.UpdateContentPrev();
    }
    SelectThis() {
        if(!Application.state.selectes.includes(this.props.data.id)){
            Application.state.selectes.push(this.props.data.id);
            this.note.current.classList.add("selected");
        }
    }
    DeselectThis() {
        if(Application.state.selectes.includes(this.props.data.id)){
            let s = Application.state.selectes;
            s.splice(s.findIndex(e => e == this.props.data.id),1);
            this.note.current.classList.remove("selected");
        }
    }
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
    }
    Click(event) {
        if(event.buttons == 1) {
            clearTimeout(globalInterval)
            let bezier = 'cubic-bezier(0.230, 1.000, 0.320, 1.000)'
            this.note.current.animate([{transform: `scale(0.9)`},{transform: `scale(0.98)`},{transform: `scale(1)`}],{
                duration: 1000,
                easing: bezier,
                fill: "forwards",
            })
            //timer
            let ms = 0;
            let menutime = 150;
            let clicks = setInterval(() => {
                ms += 1;
                if (ms >= menutime){
                    clearInterval(clicks);
                    this.SelectThis();
                    Application.setSelectMode(true);
                }
            }, 3);
            const mouseup = (e) => {
                this.note.current.removeEventListener('mouseleave',mouseup)
                this.note.current.removeEventListener('mouseup',mouseup)
                clearInterval(clicks);
                ms = 0;
                if(ms < menutime && e.type != "mouseleave") {
                    if(Application.state.SelectMode == false){
                        this.OpenNote();
                    }else {
                        if(!Application.state.selectes.includes(this.props.data.id)){
                            this.SelectThis();
                        }else {
                            if(firstSelected == true){
                                firstSelected = false;
                            }else {
                                this.DeselectThis();
                            }
                        }
                        Application.reloadData();   
                    }
                }
        
            }
            this.note.current.addEventListener('mouseleave',mouseup)
            this.note.current.addEventListener('mouseup',mouseup)
        }
    }
    OpenNote() {
        if(!Application.state.Editors.includes(this.props.data.id)) {
            new Editor(this.props.data.id);
        }
    }
    render() {
        let content = this.props.data.content.replace(/<div>(.*?)<\/div>/gim,' $1').replace(/<.+?>/gim,"").substr(0,61);
        let more = false;
        if(content.length >= 61){
            more = true;
        }
        return (
            <div 
                className={`note-preview${(Application.state.selectes.includes(this.props.data.id)? " selected":"")}${(firstLoad == true)? " first":""}`} 
                onMouseDown={this.Click} 
                onAuxClick={this.AuxEvent}
                ref={this.note}
                theme={this.props.data.theme}
            >
                <div className="note__content">{content}</div>
                {(more == true)? (<div class="more">...</div>): ""}
                <div className="note__date">{timeAgo(this.props.data.time)}</div>
                <div className="select"><div className="line"></div></div>
            </div>
        )
    }
}

function NotesSection() {
    let context = React.useContext(Data);
    let Notas = context.Notes.filter(e => e.folder == context.activeFolder).sort((a,b) => a.time-b.time).reverse();
    let Reg = new RegExp(context.findText.replace(/\W/gim,"\\$&"),'gim');
    let NotasSearched = Notas.filter(nota => {
        if(Reg.test(nota.content) == true || Reg.test(nota.title) == true){
            return true;
        }else {
            return false;
        }
    })
    function AuxForNotesSection(event) {
        if(event.target.classList.contains("notes-preview-container")){
            let obj = [
                {
                    icon:"note_add",
                    Action:e => {
                        NewNote();
                    },
                    name:"Crear Nueva Nota"
                },
            ]
            SetOpenAuxClick(obj,event,"NewNoteAux");
        }
    }
    return (
        <React.Fragment>
            <div className={`selectedIndicate ${(context.SelectMode == true)? "visible":""}`}>
                <div className="item" onClick={Application.CloseSelectMode}><Mat>close</Mat></div>
                <span className="numsels"><div id="NumSelections">{context.selectes.length}</div>notas Seleccionadas</span>
                <div 
                    className={`item ${(context.selectes.length == Notas.length)?"active":""}`} 
                    onClick={Application.ShowSelectes}
                    id="ButtonSelectAll"
                ><Mat>grading</Mat></div>
            </div>
            <div className="search">
                <div className={`search__container ${(context.findText.length != 0)? "active":""}`}>
                    <label>
                        <Mat>search</Mat>
                        <input 
                            type="text" 
                            placeholder="buscar notas..."
                            onInput={Application.changeFindText} 
                            ref={Application.SearchInput}
                        />
                        <i className="material-icons" onClick={Application.cancelFind}>close</i>
                    </label>
                </div>
            </div>
            <div className={`notes-preview-container ${(Application.state.SelectMode == true)? "selectmode":""}`}
                onAuxClick={AuxForNotesSection}
            >
                {(Notas.length == 0 || NotasSearched.length == 0) ? 
                (
                    <div className="NoNotes">
                        <div>
                            {(NotasSearched.length == 0 && context.findText.length != 0)? (
                                <React.Fragment>
                                    <Mat>search_off</Mat>
                                    <span>No hay Resultados</span>
                                </React.Fragment>
                            ):
                            (   <React.Fragment>
                                    <Mat>note_add</Mat>
                                    <span>Aun no hay notas</span>
                                    <Btn onClick={NewNote}>Crea una</Btn>
                                </React.Fragment>
                            )}
                        </div>
                    </div>
                ) 
                :
                (context.findText.length != 0) ? 
                NotasSearched.map(note => 
                    <NotePreview data={note} key={note.id}></NotePreview>
                )
                :Notas.map(note => 
                    <NotePreview data={note} key={note.id}></NotePreview>
                )
                }
                {(Application.state.SelectMode == true)?(<div className="SimulateBox"></div>):""}
            </div>
            <div className="activeEditorsContainer">
                <div className="activeEditors">
                </div>
            </div>
        </React.Fragment>
    )
}


const root = document.querySelector('#root');
ReactDOM.render(<App/>, root);
