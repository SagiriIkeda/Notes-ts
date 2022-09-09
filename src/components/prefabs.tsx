type PrefapProp = {
    children: string,
    onClick?: () => void,
}

export function Btn(props:  PrefapProp) {
    
    return (
        <div className="btn" onClick={props.onClick}>{props.children}</div>
    )
}

export function Mat(props: PrefapProp ) {
    return (
        <i className="material-icons" onClick={props.onClick}>{props.children}</i>
    )
}