let AuxMenu;
class AuxClick extends React.Component{
    constructor(prop) {
        super(prop)
        this.state = {
            options: []
        }
        AuxMenu = this;
    }
    render() {
        let time = this.state.type;
        return (
            <React.Fragment>
            {(this.state.options.length != 0)? (
                <div className="TextAction">Accion...</div>
            ): (
                <div className="TextAction Noaction">No hay Acciones</div>
            )}
            {
                this.state.options.map((option,ind) => (
                    <AuxBtn data={option} key={`${time}-${ind}`}/>
                ))
            }
            </React.Fragment>
        )
    }
}
class AuxBtn extends React.Component {
    constructor(props) {
        super(props);
        this.content = React.createRef();
    }
    componentDidMount() {
        this.content.current.innerHTML = this.props.data.name;
    }
    render() {
        let props = this.props.data;
        return (
            <React.Fragment>
            <div 
                className={`option${(props.danger === true)?" danger":""}${(props.actived === true)?" actived":""}${(props.disabled === true)?" disabled":""}`}
                onClick={props.Action}
                >
                 <Mat>{props.icon}</Mat> <span ref={this.content}></span>
            </div>
            {(props.hr === true)? (<hr/>):""}
            </React.Fragment>
        )
    }
}
const AuxContainer = document.querySelector('.AuxContainer');
ReactDOM.render(<AuxClick/>, AuxContainer);
let Auxtime;
function SetOpenAuxClick(options,event,type) {
    clearTimeout(Auxtime);
    window.removeEventListener('mouseup',comprobarAux);
    let position = { x: event.clientX, y: event.clientY }
    let width = 210;
    let height = (options.length * 39 - 5) + 27 + 20;
    let maxw = document.body.getBoundingClientRect().width;
    let maxh = document.body.getBoundingClientRect().height;
    if((position.x + width) - maxw >= 0){
        position.x = position.x - width;
    }
    if((position.y + height) - maxh >= 0){
        position.y = position.y - height;
    }
    AuxContainer.style.top = `${position.y}px`;
    AuxContainer.style.left = `${position.x}px`;
    AuxContainer.style.display = null;
    AuxMenu.setState({
        options: options,
        type:type
    });
    Auxtime = setTimeout(() => {
        window.addEventListener('mouseup',comprobarAux);
    }, 1);

}
function closeAux() {
    AuxContainer.style.display = "none";
    AuxMenu.setState({
        options: []
    });
}
function comprobarAux(e) {
    clearTimeout(Auxtime);
    Auxtime =  setTimeout(() => {      
        window.removeEventListener('mouseup',comprobarAux);
        closeAux();
    }, 1);
}
function CopyToClipboard(text = "") {
    let elmtxt = document.createElement("textarea");
        elmtxt.innerHTML = text;
        document.body.appendChild(elmtxt);
        elmtxt.select();
        document.execCommand("copy");
        document.body.removeChild(elmtxt);
}
function downloadFile(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
  