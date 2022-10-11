import React, { createRef, RefObject, useEffect } from "react";
import Folder from "../../interfaces/folder";
import { Mat } from "../prefabs"
import DB from "../../db/database";

import UI from "../UI";
import { AuxList } from "../AuxMenu/item";
import deleteFolder from "./util/deleteFolder";
import renameFolder from "./util/renameFolder";
import Socket from "../../socket";
import VerticalGrid, { GridConfig } from "./Grid";
import { FOLDERSCONFIG } from "../../interfaces/config";

interface FolderProp {
    data: Folder,
    UI: UI,
    grid?: RefObject<VerticalGrid>,
    createFolder: () => void,
}

export let EnableFolderSectionDrag = true;

interface HTMLFolderElement extends HTMLDivElement {
    identifier?: string
}

export default function FolderItem({ UI, data, createFolder, grid }: FolderProp) {

    let itemfolder = createRef<HTMLFolderElement>();

    useEffect(() => {
        if (itemfolder.current) {
            itemfolder.current.identifier = data.id;
        }
    })

    let classes = "folder-item";

    if (UI.state.activeFolder == data.id) {
        classes += " active";
    }

    function onMouseDown(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent) {
        const eventTarget = e.target as HTMLDivElement;
        const MouseEvent = e as React.MouseEvent;
        const TouchEvent = e as React.TouchEvent;

        const isMouse = e.type == "mousedown";

        /**!
         * DRAG EN TOUCHEVENT AÚN ES EXPERIMENTAL Y NO ESTÁ COMPLETAMENTE IMPLEMENTADO (10/10/2022)
         * FUNCIÓN EN FASE BETA `TEMPORALMENTE SE RETIRÓ POSIBILIDAD DE DRAG PARA CERRAR EL FOLDERSECTION`
        */

        if ((MouseEvent.buttons == 1 || e.type == "touchstart") && !eventTarget.classList.contains("__action-icon")) {
            // if ((MouseEvent.buttons == 1) && !eventTarget.classList.contains("__action-icon")) {
            const folderItem = itemfolder.current as HTMLDivElement;
            const father = folderItem.parentElement as HTMLElement;

            const rectH = itemfolder.current?.getBoundingClientRect().top as number;

            const clientY = (isMouse ? MouseEvent.nativeEvent : TouchEvent.changedTouches[0]).clientY;
            const offsetYdiff = clientY - rectH;

            let isDragInitialized = false;

            EnableFolderSectionDrag = false;

            function startDrag() {
                isDragInitialized = true;
                const folderList = [...father.querySelectorAll('.folder-item') as NodeListOf<HTMLFolderElement>];
                let __cachedLastTarget: HTMLFolderElement | undefined;
                let timeout: number;

                if (grid) {
                    const vGrid = grid.current;
                    if (vGrid) {
                        const folderRect = folderItem.getBoundingClientRect();

                        //crear el elemento invisible que ocupará el espació del folder
                        const voidElm = document.createElement("div");
                        voidElm.className = "VoidPlaceHolderIndicator";
                        voidElm.style.height = folderRect.height + "px";

                        folderItem.parentNode?.insertBefore(voidElm, folderItem);
                        //alinear la posición actual para q sea fixed y no absoluta
                        AlignFolderTargetPositionToMouse(e.nativeEvent)

                        //añadirle clases a los elementos
                        folderItem.classList.add("__dragStateIn");
                        folderItem.classList.add(GridConfig.IGNORED_CLASSNAME)//ignorar el elemento en la grid
                        father.classList.add("__dragStateIn");

                        //agregar eventos
                        document.addEventListener('mousemove', AlignFolderTargetPositionToMouse);
                        document.addEventListener('touchmove', AlignFolderTargetPositionToMouse);

                        document.addEventListener('mouseup', EndDrag);
                        document.addEventListener('touchend', EndDrag);


                        folderList.forEach(sitem => {
                            //agregarle el evento "Sortable"a todos los folders para que se detecte
                            sitem.addEventListener('mouseover', Sortable)
                        })


                        function AlignFolderTargetPositionToMouse(e: MouseEvent | TouchEvent) {
                            EnableFolderSectionDrag = false;

                            const clientY = (isMouse ? (e as MouseEvent) : (e as TouchEvent).changedTouches[0]).clientY;
                            //prohibir que el elemento se pase a menos de 0
                            if (clientY - offsetYdiff < 0) return;
                            const actual = clientY - offsetYdiff;
                            //prohibir que el elemento se desborde a más del alto de la pantalla
                            if (actual > window.innerHeight) return;

                            folderItem.animate({
                                top: `${actual}px`
                            }, {
                                duration: 0,
                                fill: "forwards",
                            })

                            if (!isMouse) {
                                clearTimeout(timeout);

                                timeout = setTimeout(() => {
                                    const target = folderList.find((e) => {
                                        if (e != folderItem) {
                                            const { top, height } = e.getBoundingClientRect();
                                            return (clientY >= top && clientY <= (top + height));
                                        }
                                        return false;
                                    })

                                    if (__cachedLastTarget != target) {

                                        __cachedLastTarget = target;

                                        if (target != undefined) {
                                            Sortable({ target });
                                        }
                                    }
                                }, 4)
                            }
                        }

                        let LastVoidPositionY = folderRect.top + folderRect.height;

                        // function Sortable(e: Event) {
                        function Sortable(e: Event | { target: HTMLDivElement }) {

                            const target = e.target as HTMLDivElement;
                            let sibling = target;
                            const folderRect = target.getBoundingClientRect()
                            // const targetRect = target.getBoundingClientRect().top + folderRect.height;
                            const folderY = folderRect.top + folderRect.height;
                            //detectar si se está moviendo para arriba o para abajo
                            if (folderY > LastVoidPositionY) {
                                sibling = target.nextElementSibling as HTMLDivElement;
                            }

                            father.insertBefore(voidElm, sibling);
                            LastVoidPositionY = folderY;
                            //Actualizar la grid
                            vGrid?.UpdateElementPositions();
                        }

                        function EndDrag() {

                            itemfolder.current?.removeEventListener('mouseup', cancelAction);
                            //Ajustar la posición para que pase de "fixed" a "absolute" sin que sea un cambio brusco
                            const fatherRect = father.getBoundingClientRect();
                            const targetRect = folderItem.getBoundingClientRect();
                            const actual = targetRect.top - fatherRect.top

                            folderItem.animate({
                                top: `${actual}px`
                            }, {
                                duration: 0,
                                fill: "forwards",
                            })

                            //Quitar clases a los elementos
                            father.classList.add("__dragStateOut");
                            father.classList.remove("__dragStateIn");

                            folderItem.classList.add("__dragStateOut");
                            folderItem.classList.remove("__dragStateIn");
                            folderItem.classList.remove(GridConfig.IGNORED_CLASSNAME);//Hacer que la grid vuelva a contarlo

                            //colocar el folder donde el "void element" para que éste sea su nueva posición
                            father.insertBefore(folderItem, voidElm);
                            father.removeChild(voidElm);


                            setTimeout(() => {
                                EnableFolderSectionDrag = true;

                                //Quitar las clases de animación
                                father.classList.remove("__dragStateOut");
                                folderItem.classList.remove("__dragStateOut");
                            }, GridConfig.ANIMATION_DURATION);

                            //Guardar la nueva Posición en la DB de cada folder
                            father.querySelectorAll('.folder-item').forEach((sitem, order) => {
                                const item = sitem as HTMLFolderElement;
                                let id = item.identifier as string;
                                DB.Folders.update(id, { order: order + 1 });
                                sitem.removeEventListener('mouseover', Sortable);
                            })
                            //Actualizar la grid
                            vGrid?.UpdateElementPositions();

                            Socket.send({
                                data: null,
                                event: "update-app"
                            })
                            UI.reloadData({ send: false, update: false })

                            document.removeEventListener('mousemove', AlignFolderTargetPositionToMouse);
                            document.removeEventListener('touchmove', AlignFolderTargetPositionToMouse);

                            document.removeEventListener('mouseup', EndDrag);
                            document.removeEventListener('touchend', EndDrag);

                        }
                        //Actualizar la grid
                        vGrid.UpdateElementPositions();
                    }
                }
            }
            itemfolder.current?.addEventListener('mouseup', cancelAction);

            const timeout = setTimeout(() => {
                itemfolder.current?.removeEventListener('mouseup', cancelAction);
                startDrag();
            }, 225);


            function cancelAction() {
                EnableFolderSectionDrag = true;
                // console.log(EnableFolderSectionDrag,"cancel");

                clearTimeout(timeout);
                itemfolder.current?.removeEventListener('mouseup', cancelAction);

                if (!isDragInitialized) {
                    UI.changeSelectedFolder(data.id);
                }
            }
        }

    }

    function AuxEvent(event: React.MouseEvent) {
        event.clientX += 5;
        event.clientY += 5;
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
        if (data.id == FOLDERSCONFIG.DEFAULT_ID) {
            AuxActions.splice(2, 2);
        }
        UI.AUX?.set(AuxActions, event, "FolderAux");
    }

    return (
        <div
            className={classes}
            onMouseDown={onMouseDown}
            onTouchStart={onMouseDown}
            onAuxClick={AuxEvent}
            ref={itemfolder}
        >
            <Mat>arrow_forward_io</Mat>
            <span className="__name">
                {data.name}
            </span>
            <div className="__action-icon" onClick={AuxEvent} >
                <span>
                    {DB.Notes.search("folder", data.id).length}
                </span>
                <Mat>more_vert</Mat>
            </div>
        </div>
    )
}