import React, {createRef, useEffect} from "react";
import Folder from "../../interfaces/folder";
import {Mat} from "../prefabs"
import DB from "../../db/database";

interface FolderProp {
    data: Folder
}

interface HTMLFolderElement extends HTMLDivElement {
    identifier?: string
}

export default function FolderItem(prop : FolderProp) {

    let itemfolder = createRef<HTMLFolderElement>();
    // let itemfolder = createRef();

    useEffect(() => {
        if(itemfolder.current) {
            itemfolder.current.identifier = prop.data.id;
        }
    })

    return (
    <div 
        // className={`folder${(Application.state.activeFolder == prop.data.id)?" active":""}`}
        className={`folder`}
        // onMouseDown={Click}
        // onAuxClick={AuxEvent}
        ref={itemfolder}>
        <span className="folder__name">
            <Mat>arrow_forward_ios</Mat>{prop.data.name}
        </span>
        {DB.Notes.Search("folder",prop.data.id).length}
    </div>
    )
}