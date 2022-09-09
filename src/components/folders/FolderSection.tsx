import React from "react";
import DB from "../../db/database";
import { Mat } from "../prefabs";

import Folder from "../../interfaces/folder";
import FolderItem from "../../components/folders/FolderItem";

import UI from "../UI";


interface FolderSectionProps {
    UI: UI
}

export default function FolderSection({UI} : FolderSectionProps) {

    let Folders = DB.Folders.Content as Folder[];

    Folders.sort((a,b) => a.order-b.order);

    return (
        <React.Fragment>
            <div className="container">
                <h2 className="text"><Mat>folder</Mat> Carpetas</h2>
                <FolderItem  UI={UI} key={0} data={DB.Folders.Obtain("0") as Folder}/>
                {/* <div className="DragableFolders" ref={drgSection}> */}
                <div className="DragableFolders">
                    {Folders.map((fold) => {
                        if(fold.id != "0"){
                            return (<FolderItem  UI={UI} key={fold.id} data={fold} />)
                        }
                    })}
                </div>
            </div>
            {/* <div className="CreateBtn" onClick={CreateFolder}>Nueva Carpeta</div> */}
            <div className="CreateBtn"> Nueva Carpeta</div>
        </React.Fragment>
    )
}