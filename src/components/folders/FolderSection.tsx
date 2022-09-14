import React from "react";
import DB from "../../db/database";
import { Mat } from "../prefabs";

import Folder from "../../interfaces/folder";
import FolderItem from "../../components/folders/FolderItem";

import UI from "../UI";
import createFolder from "./util/createFolder";
import { AuxList } from "../AuxMenu/item";


interface FolderSectionProps {
    UI: UI
}

export default function FolderSection({ UI }: FolderSectionProps) {

    const { Folders } = UI.state;

    function createFolderAux() {
        createFolder(UI)
    }
    function AuxForFolderSection(event: React.MouseEvent) {
        if ((event.target as HTMLDivElement).classList.contains("DragableFolders")) {
            const obj: AuxList = [
                {
                    icon: "create_new_folder",
                    name: "Crear Carpeta",
                    action: () => {
                        createFolderAux();
                    },
                },
            ]
            UI.AUX?.set(obj, event, "NewFolder");
        }
    }

    return (
        <div className="folders-section" onAuxClick={AuxForFolderSection} >
            <div className="container">
                <h2 className="text"><Mat>folder</Mat> Carpetas</h2>
                <FolderItem createFolder={createFolderAux} UI={UI} key={0} data={DB.Folders.get("0") as Folder} />
                <div className="DragableFolders">
                    {Folders.map((fold) => {
                        if (fold.id != "0") {
                            return (<FolderItem createFolder={createFolderAux} UI={UI} key={fold.id} data={fold} />)
                        }
                    })}
                </div>
            </div>
            <div className="CreateBtn" onClick={createFolderAux}>Nueva Carpeta</div>
        </div>
    )
}