let ViewJson;
class ViewJsonElm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {},
            actived: false,
            closing:false
        }
        ViewJson = this;
    }
    render() {
        if(this.state.actived == false) {
            return "";
        }else {
            let data = this.state.data;
            return (
                <div class="container" data-closing={this.state.closing}>
                    <div class="headerj">
                        <div class="titlejson"><Mat>description</Mat> Note</div>
                        <i class="material-icons"  onClick={CloseJSONNote}>close</i>
                    </div>

                    <div class="content">
                        {'{'}<br/>
                            <div class="s t">"content"</div>:<div class="v">"{data.content}"</div>,<br/>
                            <div class="s t">"title"</div>:<div class="v">"{data.title}"</div>,<br/>
                            <div class="s t">"folder"</div>:<div class="v">"{data.folder}"</div>,<br/>
                            <div class="s t">"theme"</div>:<div class="v">"{data.theme}"</div>,<br/>
                            <div class="s t">"time"</div>:<div class="n">{data.time}</div>,<br/>
                            <div class="s t">"id"</div>:<div class="v">"{data.id}"</div>,<br/>
                            <div class="s t">"position"</div>: <div class="nsbp"></div> {'{'}<br/>
                                <div class="s t2">"width"</div>:<div class="n">{data.position.width}</div>,<br/>
                                <div class="s t2">"height"</div>:<div class="n">{data.position.height}</div>,<br/>
                                <div class="s t2">"top"</div>:<div class="n">{data.position.top}</div>,<br/>
                                <div class="s t2">"left"</div>:<div class="n">{data.position.left}</div><br/>
                            <div class="r t">{'}'}</div><br/>
                        {'}'}<br/>
                    </div>
                </div>

            )
        }
    }
}
let JsonContainer = document.querySelector('#ViewJson');
ReactDOM.render(<ViewJsonElm/>,JsonContainer);
let jsontimeout;
function ViewJSONNote(object) {
    JsonContainer.classList.add("view");
    JsonContainer.addEventListener('click',CheckJson);
    ViewJson.setState({
        actived:true,
        closing:false,
        data: object
    })
}
function CheckJson(e) {
    if(e.target == JsonContainer) {
        CloseJSONNote();
        JsonContainer.addEventListener('click',CheckJson);
    }
}
function CloseJSONNote() {
    ViewJson.setState({
        closing:true
    })
    clearTimeout(jsontimeout);
    jsontimeout = setTimeout(e => {
        JsonContainer.removeEventListener('click',CheckJson);
        JsonContainer.classList.remove("view");
    },500) 
}