import React, { createRef, RefObject } from "react";
import DB from "../../db/database";
import { Mat } from "../prefabs";

import Folder from "../../interfaces/folder";
import FolderItem, { EnableFolderSectionDrag } from "../../components/folders/FolderItem";

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
        e.preventDefault();
        if (!EnableFolderSectionDrag) return;


        const target = e.target as HTMLDivElement;

        if (target.className == "material-icons closeBtn") return;


        const section = sectionRef.current as HTMLDivElement;
        const shadow = shadowRef.current as HTMLDivElement;
        const ELEMENT_WIDTH = 250;

        const isDragger = target.className == "__folder-section-dragable-indicator";

        const { clientX: firstTouchX, clientY: firstTouchY } = e.changedTouches[0];

        const Xdiff = (section.offsetLeft + section.offsetWidth) - firstTouchX;

        if (!isDragger && (firstTouchX < 130 || firstTouchY < 100)) return;

        document.addEventListener("touchmove", DragMove);
        document.addEventListener("touchend", EndDrag);

        let isMoved = false;

        function DragMove(e: TouchEvent) {
            e.preventDefault();
            // const { clientX } = e.changedTouches[0];
            let clientX = e.changedTouches[0].clientX;

            if (!isDragger) {
                clientX += clientX - Xdiff;
            }

            if (clientX > 5) {
                isMoved = true;
                clearTimeout(timeToOpen);
            }

            if (section && clientX < (ELEMENT_WIDTH + 1)) {
                const percent = clientX / ELEMENT_WIDTH;
                // const sh
                shadow.style.transition = "none";
                shadow.style.opacity = (percent < 0) ? "0" : percent.toString();

                section.style.transition = `none`;
                section.style.left = `${clientX - ELEMENT_WIDTH}px`;
            }
        }

        const timeToOpen = setTimeout(() => {
            if (isMoved == false && isDragger) {
                if (section) {
                    const left = `-${ELEMENT_WIDTH - 10}px`;
                    const anim = section.animate({ left: left }, {
                        easing: "ease",
                        duration: 100,
                    })
                    anim.addEventListener("finish", () => {
                        section.style.left = left;
                    })
                }
            }
        }, 200)


        function EndDrag(e: TouchEvent) {
            clearTimeout(timeToOpen);
            document.removeEventListener("touchmove", DragMove);
            document.removeEventListener("touchend", EndDrag);
            const { clientX } = e.changedTouches[0];

            //LIMITE PARA ABIR
            if (section) {
                // section.style.translate = "left ease 100ms";
                section.style.transition = "left ease 100ms";
                section.style.left = "";

                setTimeout(() => {
                    section.style.transition = "";
                }, 100);

                shadow.style.transition = "";
                shadow.style.opacity = "";

                if (isMoved) {
                    HEADER?.toggleFoldersSection(clientX >= 130);

                }

            }
        }
    }

    function closeMenu() {
        HEADER?.toggleFoldersSection(false);
    }


    return (
        <>
            <div className="folders-section"
                ref={sectionRef}
                // onTouchStart={InitializeDrag}  

            >
                <div className="__header">
                    <h2 className="__name">
                        <Mat>folder</Mat> Carpetas
                    </h2>
                    <Mat className="closeBtn" onClick={closeMenu} >close</Mat>
                </div>
                <div className="container" onAuxClick={AuxForFolderSection}>
                    <FolderItem createFolder={createFolderAux} UI={UI} key={FOLDERSCONFIG.DEFAULT_ID} data={DB.Folders.get(FOLDERSCONFIG.DEFAULT_ID) as Folder} />
                    <VerticalGrid ref={grid} afterUpdate={afterUpdate}>
                        {Folders.map((fold) => {
                            if (fold.id != FOLDERSCONFIG.DEFAULT_ID) {
                                return (<FolderItem grid={grid} createFolder={createFolderAux} UI={UI} key={fold.id} data={fold} />)
                            }
                        })}
                    </VerticalGrid>
                </div>
                <div className="CreateBtn" onClick={createFolderAux}>Nueva Carpeta</div>
            </div>

            {/* <div className="__folder-section-dragable-indicator"
                onTouchStart={preventResize}
            ></div> */}

            <div className="__folder-section-shadow" onClick={closeMenu} ref={shadowRef} ></div>
        </>
    )
}