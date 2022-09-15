import React, { createRef, useEffect } from "react";
import Folder from "../../interfaces/folder";
import { Mat } from "../prefabs"
import DB from "../../db/database";

import UI from "../UI";
import { AuxList } from "../AuxMenu/item";
import deleteFolder from "./util/deleteFolder";
import renameFolder from "./util/renameFolder";

interface FolderProp {
    data: Folder,
    UI: UI,
    createFolder: () => void
}

interface HTMLFolderElement extends HTMLDivElement {
    identifier?: string
}

export default function FolderItem({ UI, data, createFolder }: FolderProp) {

    let itemfolder = createRef<HTMLFolderElement>();

    // useEffect(() => {
    //     if(itemfolder.current) {
    //         itemfolder.current.identifier = data.id;
    //     }
    // })

    let classes = "folder";

    if (UI.state.activeFolder == data.id) {
        classes += " active";
    }

    function SelectThis(event: React.MouseEvent) {
        if(event.buttons == 1) {
            UI.changeSelectedFolder(data.id);
        }
    }

    function AuxEvent(event: React.MouseEvent) {
        const AuxActions: AuxList = [
            {
                icon: "folder_open",
                name: "Abrir Carpeta",
                action: () => {
                    UI.changeSelectedFolder(data.id);
                },
            },
            {
                icon: "create_new_folder",
                name: "Crear Carpeta",
                action: () => {
                    createFolder();
                },
            },
            {
                icon: "edit",
                name: "Renombar Carpeta",
                action: () => {
                    renameFolder(UI, data);
                },
            },
            {
                icon: "folder_delete",
                name: "Eliminar Carpeta",
                action: () => {
                    deleteFolder(UI, data);
                },
                danger: true,
            },
        ]
        if (data.id == "0") {
            AuxActions.splice(2, 2);
        }
        UI.AUX?.set(AuxActions, event, "FolderAux");
    }

    return (
        <div
            className={classes}
            onMouseDown={SelectThis}
            onAuxClick={AuxEvent}
            ref={itemfolder}>
            <span className="folder__name">
                <Mat>arrow_forward_ios</Mat>{data.name}
            </span>
            {DB.Notes.search("folder", data.id).length}
        </div>
    )
}