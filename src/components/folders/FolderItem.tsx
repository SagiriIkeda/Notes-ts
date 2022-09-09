import React, {createRef, useEffect} from "react";
import Folder from "../../interfaces/folder";
import {Mat} from "../prefabs"
import DB from "../../db/database";

import UI from "../UI";

interface FolderProp {
    data: Folder,
    UI: UI
}

interface HTMLFolderElement extends HTMLDivElement {
    identifier?: string
}

export default function FolderItem({UI,data} : FolderProp) {

    let itemfolder = createRef<HTMLFolderElement>();

    // useEffect(() => {
    //     if(itemfolder.current) {
    //         itemfolder.current.identifier = data.id;
    //     }
    // })

    let classes = "folder";

    if(UI.state.activeFolder == data.id) {
        classes += " active";
    }

    function SelectThis() {
        UI.changeSelectedFolder(data.id)
    }

    return (
    <div 
        className={classes}
        // className={`folder${(Application.state.activeFolder == prop.data.id)?" active":""}`}
        // className={`folder`}
        onMouseDown={SelectThis}
        // onAuxClick={AuxEvent}
        ref={itemfolder}>
        <span className="folder__name">
            <Mat>arrow_forward_io</Mat>{data.name}
        </span>
        {DB.Notes.Search("folder",data.id).length}
    </div>
    )
}