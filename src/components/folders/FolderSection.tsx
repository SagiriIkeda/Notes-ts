import React, { createRef, RefObject } from "react";
import DB from "../../db/database";
import { Mat } from "../prefabs";

import Folder from "../../interfaces/folder";
import FolderItem from "../../components/folders/FolderItem";

import UI from "../UI";
import createFolder from "./util/createFolder";
import { AuxList } from "../AuxMenu/item";
import VerticalGrid from "./Grid";

interface FolderSectionProps {
    UI: UI
}

export default function FolderSection({ UI }: FolderSectionProps) {

    const { Folders } = UI.state;
    const grid = createRef<VerticalGrid>();

    function createFolderAux() {
        createFolder(UI)
    }
    function AuxForFolderSection(event: React.MouseEvent) {
        if ((event.target as HTMLDivElement).classList.contains("container")) {
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

    function afterUpdate(vgrid: RefObject<HTMLDivElement>) {
        const container = vgrid.current?.parentElement;
        if (container) {
            const { scrollHeight, offsetHeight } = container;
            if (scrollHeight != offsetHeight) {
                container.classList.add("have-scroll");
                return;
            }
            container.classList.remove("have-scroll");
        }

    }

    return (
        <div className="folders-section">
            <h2 className="text"><Mat>folder</Mat> Carpetas</h2>
            <div className="container" onAuxClick={AuxForFolderSection}>
                <FolderItem createFolder={createFolderAux} UI={UI} key={0} data={DB.Folders.get("0") as Folder} />
                <VerticalGrid ref={grid} afterUpdate={afterUpdate} >
                    {Folders.map((fold) => {
                        if (fold.id != "0") {
                            return (<FolderItem grid={grid} createFolder={createFolderAux} UI={UI} key={fold.id} data={fold} />)
                        }
                    })}
                </VerticalGrid>
            </div>
            <div className="CreateBtn" onClick={createFolderAux}>Nueva Carpeta</div>
        </div>
    )
}