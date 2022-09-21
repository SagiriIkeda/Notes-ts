let MoveFolderAPI;
let MoveFolderConteinerAPI = React.createRef();
class MoveFolder extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            selected: "",
            search: "",
            noSelectioned:false,
            open:false
        }
        this.SearchInput = React.createRef();
        this.MoveNotes = this.MoveNotes.bind(this);
        MoveFolderAPI = this;
    }
    SetFolder(id) {
        if(this.state.selected != id){
            this.setState({
                selected:id,
                noSelectioned:false
            })
        }else {
            this.setState({
                selected:""
            })
        }
    }
    MoveNotes() {
        if(this.state.selected != ""){
            Application.state.selectes.forEach(note => {
                DB.Notes.Update(note,{
                    folder: this.state.selected
                })
            })
            Application.state.selectes = [];
            Application.state.SelectMode = false;
            Application.reloadData();
            CloseMoveFolder();
        }else {
            this.setState({
                noSelectioned:true
            })
        }
    }
    render() {
        let self = this;
        let Folders = DB.Folders.Content.sort((a,b) => a.order-b.order);
        
        if(this.state.search != ""){
            let Reg = new RegExp(this.state.search.replace(/\W/gim,"\\$&"),'gim');
            Folders = Folders.filter(folder => Reg.test(folder.name))
        }
        function MoveFolder(props) {
            let data = props.data;
            return (
                <div className={`folder ${(self.state.selected == data.id)?"Selected":""}`} onClick={() => self.SetFolder(data.id)}>
                    <Mat>folder</Mat>
                    <span>{data.name}</span>
                    {(self.state.selected == data.id)? (
                        <Mat>check_circle</Mat>
                    ):(
                        <Mat>radio_button_unchecked</Mat>
                    )}
                </div>
            )
        }
        function CancelSearch() {
            self.SearchInput.current.value = "";
            self.setState({
                search: ""
            })
        }
        function Search(e) {
            let value = e.target.value;
            self.setState({
                search: value
            })
        }
        if(this.state.open == true) {
            let l = Application.state.selectes.length;
            return (
                <div className="MoveFolder" ref={MoveFolderConteinerAPI}>
                    <div className="Nav">
                        <div className="MoveTitle">
                            <h2>Mover a la carpeta</h2>
                            <Mat onClick={CloseMoveFolder}>close</Mat>
                        </div>
                        <label className="searchFolderBar">
                            <Mat>search</Mat>
                            <input type="text" maxLength={50} placeholder="Buscar Carpetas..." onInput={Search} ref={this.SearchInput} />
                            {(this.state.search != "")? (
                                <Mat onClick={CancelSearch}>close</Mat>
                            ):""}
                        </label>
                       
                    </div>
                    <div className="FoldersSection">
                        {(this.state.search != "" && Folders.length == 0) && (
                            <div className="centerFolders">
                                <Mat>search_off</Mat>
                                <span>No hay Carpetas con "{this.state.search}"</span>
                            </div>
                        )}
                        {Folders.map(folder => 
                            <MoveFolder key={folder.id} data={folder}/>
                        )}
                    </div>
                    <div className="footer">
                        <span>
                            <div className={(this.state.noSelectioned == true)?"NoSelected":""}>{(this.state.selected != "")? DB.Folders.Obtain(this.state.selected).name:"Selecciona una carpeta..."} </div>
                            <br/>
                            <p>{l} {(l > 1)?"Notas Seleccionadas":"Nota Seleccionada"}</p> 
                        </span>
                        <div className="btn" onClick={CloseMoveFolder}>Cancelar</div>
                        <div className="btn act" onClick={this.MoveNotes}>Mover</div>
                    </div>
                </div>
            )
        }else {
            return "";
        }
    }
}
let MoveFolderAPITimer;
function OpenMoveFolder() {
    MoveFolderContainerRoot.classList.add("active");
    MoveFolderContainerRoot.addEventListener('click',ComprobateMoveAPI);
    clearTimeout(MoveFolderAPITimer);
    MoveFolderAPI.setState({
        open:true
    })
}
function ComprobateMoveAPI(e) {
    if(e.target == MoveFolderContainerRoot){
        CloseMoveFolder();
    }
}
function CloseMoveFolder() {
    MoveFolderContainerRoot.removeEventListener('click',ComprobateMoveAPI);
    if(Application.state.SelectMode == false && Application.state.selectes.length == 1){
        Application.state.selectes = [];
    }
    clearTimeout(MoveFolderAPITimer);
    MoveFolderContainerRoot.classList.remove("active");
    MoveFolderConteinerAPI.current.animate({
        opacity:0,
        transform:"scale(0.9)"
    }, {
        duration:250,
        fill:"forwards",
        ease:"cubic-bezier(0.190, 1.000, 0.220, 1.000)"
    })
    MoveFolderAPITimer = setTimeout(() => {
        MoveFolderAPI.setState({
            selected: "",
            search: "",
            noSelectioned:false,
            open:false
        })
    }, 250);
}

const MoveFolderContainerRoot = document.querySelector('#MoveFolderContainer');
ReactDOM.render(<MoveFolder/>, MoveFolderContainerRoot);
