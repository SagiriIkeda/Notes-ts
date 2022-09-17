import React, { createRef, useEffect } from "react";
import Folder from "../../interfaces/folder";
import { Mat } from "../prefabs"
import DB from "../../db/database";

import UI from "../UI";
import { AuxList } from "../AuxMenu/item";
import deleteFolder from "./util/deleteFolder";
import renameFolder from "./util/renameFolder";
import Socket from "../../socket";

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

    useEffect(() => {
        if (itemfolder.current) {
            itemfolder.current.identifier = data.id;
        }
    })

    let classes = "folder";

    if (UI.state.activeFolder == data.id) {
        classes += " active";
    }

    function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
        if (e.buttons == 1) {
            let mss = 0;
            let timers = 15;
            let intervals = setInterval(() => {
                if (mss >= timers && data.id != "0") {
                    clearInterval(intervals);
                    document.removeEventListener('mousemove', mousemoved)
                    if (data.id != "0") {
                        // EXPERIMENT
                        // let TimeToDelete = 0;
                        // const TimeToExecuteDelete = 60;
                        // const ainterval = setInterval(() => {
                        //     if (TimeToDelete >= TimeToExecuteDelete) {
                        //         clearInterval(ainterval);
                        //         EndDrag();
                        //         deleteFolder(UI, data);
                        //     }
                        //     TimeToDelete += 1;
                        // }, 10);
                        //sortable
                        const item = e.target as HTMLDivElement;
                        const father = item.parentNode as HTMLDivElement;
                        const height = item.getBoundingClientRect().height;

                        item.classList.add("dragin");
                        document.addEventListener('mousemove', AlignPosition);
                        document.addEventListener('mouseup', EndDrag);
                        father.classList.add("dragger");

                        const AnimationElm = document.createElement('div');
                        AnimationElm.className = "AnimationIndicator";
                        AnimationElm.style.height = `${height}px`;

                        let ItemReact = item.getBoundingClientRect().top + height;

                        const InitialHeight = e.nativeEvent.offsetY;
                        item.style.top = `${e.clientY - InitialHeight - 5}px`;
                        father.insertBefore(AnimationElm, item);

                        function AlignPosition(e: MouseEvent) {
                            // clearInterval(ainterval);
                            item.style.top = `${e.clientY - InitialHeight}px`;
                        }
                        father.querySelectorAll('.folder').forEach(sitem => {
                            sitem.addEventListener('mouseover', Sortable)
                        })

                        function Sortable(e: Event) {
                            itemfolder.current?.removeEventListener('mouseup', cancelAction);
                            const target = e.target as HTMLDivElement;
                            let sibling = target;
                            const targetRect = target.getBoundingClientRect().top + height;
                            if (targetRect > ItemReact) {
                                sibling = target.nextElementSibling as HTMLDivElement;
                            }
                            const ContracAnimation = document.createElement('div');
                            ContracAnimation.className = "ContractAnimation";
                            father.insertBefore(ContracAnimation, AnimationElm);

                            const animation: KeyframeAnimationOptions = {
                                easing: "ease",
                                fill: "forwards",
                                duration: 250
                            }

                            ContracAnimation.animate([{ height: `${AnimationElm.getBoundingClientRect().height}px` }, { height: "0px" }], animation)
                            AnimationElm.animate([{ height: "0px" }, { height: `${height}px` }], animation);

                            setTimeout(() => { father.removeChild(ContracAnimation); }, 250);
                            father.insertBefore(AnimationElm, sibling);
                            ItemReact = targetRect;
                        }
                        function EndDrag() {
                            itemfolder.current?.removeEventListener('mouseup', cancelAction);
                            // clearInterval(ainterval);
                            father.classList.add("OUTDRAGER");
                            father.classList.remove("dragger");
                            item.classList.add("ofDragin");
                            const y = AnimationElm.getBoundingClientRect().top;
                            setTimeout(() => {
                                item.style.top = `${y - 2}px`;
                            }, 1);
                            father.insertBefore(item, AnimationElm);
                            setTimeout(() => {
                                father.classList.remove("OUTDRAGER");
                                item.classList.remove("dragin");
                                item.classList.remove("ofDragin");
                                item.style.top = "";
                                father.removeChild(AnimationElm);
                            }, 250);
                            father.querySelectorAll('.folder').forEach((sitem, order) => {
                                const item = sitem as HTMLFolderElement;
                                let id = item.identifier;
                                DB.Folders.update(id as string, { order: order + 1 });
                                sitem.removeEventListener('mouseover', Sortable);
                            })

                            Socket.send({
                                data: null,
                                event: "update-app"
                            })

                            document.removeEventListener('mousemove', AlignPosition);
                            document.removeEventListener('mouseup', EndDrag);
                        }
                    }
                }
                mss += 1;
            }, 15);
            itemfolder.current?.addEventListener('mouseup', cancelAction);
            setTimeout(() => {
                document.addEventListener('mousemove', mousemoved);
            }, 0);
            function mousemoved(e: MouseEvent) {
                if (mss < timers) {
                    clearInterval(intervals);
                }
                document.removeEventListener('mousemove', mousemoved);
            }
            function cancelAction() {
                clearInterval(intervals);
                itemfolder.current?.removeEventListener('mouseup', cancelAction);
            
                if (mss < timers) {
                    UI.changeSelectedFolder(data.id);
                }
            }
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
            // onMouseDown={SelectThis}
            onMouseDown={onMouseDown}
            onAuxClick={AuxEvent}
            ref={itemfolder}>
            <span className="folder__name">
                <Mat>arrow_forward_ios</Mat>{data.name}
            </span>
            {DB.Notes.search("folder", data.id).length}
        </div>
    )
}