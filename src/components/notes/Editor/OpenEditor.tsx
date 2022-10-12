import React from "react";
import DB from "../../../db/database";
import Note, { NoteBuilder, Themes } from "../../../interfaces/notes";
import UI from "../../UI";
import Editor from "./Editor";
import Tab from "./Tab";
import Swal from "sweetalert2";
import { EDITORCONFIG } from "../../../interfaces/config";
import EditorSocket from "./Socket";
import Socket from "../../../socket";

export default class OpenEditor {

    id?: string;
    data: Note;
    lastest_save: string;
    TabInstance?: Tab;
    EditorInstance?: Editor;
    temporalId?: string;

    createdAt = Date.now();
    Socket = new EditorSocket(this);


    constructor(public UI: UI, id?: string) {
        //open
        const { activeFolder } = UI.state;
        this.id = id;
        if (id) {// se está abriendo una nota existente
            this.data = new NoteBuilder(activeFolder, DB.Notes.get(id))
            this.Socket.start();
            UI.state.Editors.set(id, this);
        } else {//la nota no existe (colocarle una id temporal)
            this.data = new NoteBuilder(activeFolder);

            this.temporalId = Date.now().toString();
            UI.state.Editors.set(this.temporalId, this);
        }

        UI.setState({});

        const { data } = this;

        this.lastest_save = data.content;

        this.Close = this.Close.bind(this);
        this.forceClose = this.forceClose.bind(this);
        this.setTopZIndex = this.setTopZIndex.bind(this);
    }

    setTopZIndex(e?: React.MouseEvent) {
        if (e) {//anti tab close btn-click
            const target = e.target as HTMLDivElement;
            if (target.classList.contains("material-icons")) {
                return;
            }
        }

        const { UI, EditorInstance } = this;

        const { Editors } = UI.state;

        Editors.delete((this.id ?? this.temporalId) as string);
        Editors.set((this.id ?? this.temporalId) as string, this);

        EditorInstance?.editor_window.current?.classList.add("noanimation");

        UI.setState({});
    }

    setTheme(theme: Themes) {
        const { EditorInstance, TabInstance, data } = this;
        data.theme = theme;

        EditorInstance?.setState({ theme })
        TabInstance?.setState({ theme })
    }

    Save() {
        const { data, id, UI,EditorInstance } = this;
        const { Editors } = UI.state;

        this.lastest_save = data.content;

        // Crear copia de los Datos de la nota
        let construct = JSON.parse(JSON.stringify(data));
        construct.time = Date.now();

        try {
            if (!id) {//la nota no existe, crearla
                let uuid = DB.Notes.add(construct);
                this.id = uuid;
                data.id = uuid;
                this.Socket.start();

                if(EditorInstance) {//Quitar el folderdDeleted Warn
                    EditorInstance.state.folderDeleted = false;
                };

                Editors.delete(this.temporalId as string);//eliminar la instancia temporal
                Editors.set(this.id, this);// volver a crearla usando la id real

            } else {//la nota si existe
                this.Socket.deferUpdate();
                
                if(EditorInstance) {
                    EditorInstance.state.folderDeleted = false;
                    EditorInstance.state.updateReceived = false;
                    EditorInstance.chached_update_received = undefined;
                };
            
                DB.Notes.update(construct.id, construct);
            }
            if(EditorInstance) EditorInstance.state.saved = true;
        } catch (error: any) {
            if(EditorInstance) EditorInstance.state.saved = false;
            QuotaLimit(error)
        }

        function QuotaLimit(error: { name: string }) {
            let message = "";

            if (error.name == "QuotaExceededError") {
                message = "Se alcanzó el limite de localStorage (5MB) por lo que la Nota no fue posible guardarla..."
            } else {
                message = "Error desconocido..."
            }

            console.error(error)
            Swal.fire({
                title: "A ocurrido un error",
                icon: "error",
                text: message
            })
        }

        this.UI.reloadData();
    }

    //Close
    Close(force: React.MouseEvent | boolean = false, update = true) {
        const { data } = this;

        let construct = JSON.parse(JSON.stringify(data));
        if (force == true) {
            this.forceClose(update);
        } else {
            if (construct.content != this.lastest_save) {
                Swal.fire({
                    icon: 'warning',
                    showCancelButton: true,
                    cancelButtonText: "Cancelar",
                    reverseButtons: true,
                    html: 'Aún no haz guardado<br> <b>¿estas seguro que deseas cerrar?</b>',
                    confirmButtonText: 'Cerrar Editor'
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.forceClose(update);
                    }
                })
            } else {
                this.forceClose(update);
            }
        }
    }

    async forceClose(update = true) {
 
        const { TabInstance, EditorInstance, UI, data } = this;
        const { Editors } = UI.state;

        await EditorInstance?.closeWindow();
        TabInstance?.closeTab();

        this.temporalId && Editors.delete(this.temporalId);
        data.id && Editors.delete(data.id);

        update && UI.setState({})
    }

}

export function OpenLimitedEditor(UI: UI, id?: string) {
    if (UI.state.Editors.size + 1 >= EDITORCONFIG.MAX_EDITORS_OPENDS) {
        Swal.fire({
            // title: "A ocurrido un error",
            icon: "warning",
            text: `No puedes Abrir más ${EDITORCONFIG.MAX_EDITORS_OPENDS} Editores a la vez`
        })
        return false;
    }

    new OpenEditor(UI, id);
    return true;
}