import React from "react"

type PrefapProp = {
    children: string,
    // onClick?: (event?: React.MouseEvent) => void,
    onClick?: (event: React.MouseEvent) => void,
    className?: string,
}

export function Btn(props: PrefapProp) {

    return (
        <div className="btn" onClick={props.onClick}>{props.children}</div>
    )
}

export function Mat({ onClick, children, className }: PrefapProp) {
    return (
        <i className={"material-icons" + (className ? " " + className : "")} onClick={onClick}>{children}</i>
    )
}