function Btn(props) {
    
    return (
        <div className="btn" onClick={props.onClick}>{props.children}</div>
    )
}

function Mat(props) {
    return (
        <i className="material-icons" onClick={props.onClick}>{props.children}</i>
    )
}
function DefaultNoteGenerate() {
    let wheight = document.documentElement.scrollHeight;
    let wwidth = document.documentElement.scrollWidth;
    return {
        content: "Write Here...",
        folder: Application.state.activeFolder,
        theme: "dark",
        time: Date.now(),
        title: "Note title",
        position: {
            width: 700,
            height: 600,
            left:(wwidth / 2) - (700 / 2), 
            top:(wheight / 2.3) - (600 / 2)
        },
        v:Application.version,
    }
}