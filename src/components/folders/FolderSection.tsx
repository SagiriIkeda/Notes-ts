import React, { createRef, RefObject } from "react";
import DB from "../../db/database";
import { Mat } from "../prefabs";

import Folder from "../../interfaces/folder";
import FolderItem from "../../components/folders/FolderItem";

import UI from "../UI";
import createFolder from "./util/createFolder";
import { AuxList } from "../AuxMenu/item";
import VerticalGrid from "./Grid";
import { FOLDERSCONFIG } from "../../interfaces/config";

interface FolderSectionProps {
    UI: UI
}

export default function FolderSection({ UI }: FolderSectionProps) {

    const { Folders } = UI.state;
    const { HEADER } = UI;

    const grid = createRef<VerticalGrid>();
    const sectionRef = createRef<HTMLDivElement>();
    const shadowRef = createRef<HTMLDivElement>();

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

    function InitializeDrag(e: React.TouchEvent<HTMLDivElement>) {

        document.addEventListener("touchmove", DragMove);
        document.addEventListener("touchend", EndDrag);
        const section = sectionRef.current;
        const shadow = shadowRef.current as HTMLDivElement;
        const target = e.target as HTMLDivElement;
        
        const isDragger = target.className == "__folder-section-dragable-indicator";

        console.log(isDragger);
        

        let isMoved = false;

        function DragMove(e: TouchEvent) {
            const { clientX } = e.changedTouches[0];
            if(clientX > 5) {
                isMoved = true;
                clearTimeout(timeToOpen);
            }

            if (section && clientX < 251) {
                const percent = clientX / 250;
                // const sh
                shadow.style.transition = "none";
                shadow.style.opacity = (percent < 0) ? "" : percent.toString();
                section.style.translate = `${clientX}px 0px`;
            }
        }

        const timeToOpen = setTimeout(() => {
            if(isMoved == false) {
                if(section) {
                    const anim = section.animate({ translate: "10px" }, {
                        easing: "ease",
                        duration: 100,
                    })
                    anim.addEventListener("finish", () => {
                        section.style.translate = `10px 0px`;
                    })
                }
            }
        },200)


        function EndDrag(e: TouchEvent) {
            clearTimeout(timeToOpen);
            document.removeEventListener("touchmove", DragMove);
            document.removeEventListener("touchend", EndDrag);
            const { clientX } = e.changedTouches[0];

            //LIMITE PARA ABIR
            if (section) {
                section.style.transition = "left ease 100ms";

                const anim = section.animate({ translate: "0px" }, {
                    easing: "ease",
                    duration: 100,
                })
                anim.addEventListener("finish", () => {
                    section.style.transition = "";
                    section.style.translate = "";
                })
                shadow.style.transition = "";

                shadow.style.opacity = "";
            
                HEADER?.toggleFoldersSection(clientX >= 130);

            }

        }
    }




    function closeMenu() {
        HEADER?.toggleFoldersSection(false);
    }


    return (
        <>
            <div className="folders-section" ref={sectionRef} >
                <div className="__header">
                    <h2 className="__name">
                        <Mat>folder</Mat> Carpetas
                    </h2>
                    <Mat className="closeBtn" onClick={closeMenu} >close</Mat>
                </div>
                <div className="container" onAuxClick={AuxForFolderSection}>
                    <FolderItem createFolder={createFolderAux} UI={UI} key={FOLDERSCONFIG.DEFAULT_ID} data={DB.Folders.get(FOLDERSCONFIG.DEFAULT_ID) as Folder} />
                    <VerticalGrid ref={grid} afterUpdate={afterUpdate} >
                        {Folders.map((fold) => {
                            if (fold.id != FOLDERSCONFIG.DEFAULT_ID) {
                                return (<FolderItem grid={grid} createFolder={createFolderAux} UI={UI} key={fold.id} data={fold} />)
                            }
                        })}
                    </VerticalGrid>
                </div>
                <div className="CreateBtn" onClick={createFolderAux}>Nueva Carpeta</div>
            </div>
            <div className="__folder-section-dragable-indicator" onTouchStart={InitializeDrag} ></div>
            <div className="__folder-section-shadow" onClick={closeMenu} ref={shadowRef} ></div>
        </>
    )
}