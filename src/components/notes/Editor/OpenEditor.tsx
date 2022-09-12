import React from "react";
import DB from "../../../db/database";
import Note, { NoteBuilder, Themes } from "../../../interfaces/notes";
import UI from "../../UI";
import Editor from "./Editor";
import Tab from "./Tab";
import Swal from "sweetalert2";

export default class OpenEditor {

    id?: string;
    data: Note;
    LastestSave: string;
    TabInstance?: Tab;
    EditorInstance?: Editor;

    temporalId?: number;

    constructor(public UI: UI, id?: string) {
        //open
        const { activeFolder } = UI.state;
        this.id = id;
        if (id) {// se está abriendo una nota existente
            this.data = new NoteBuilder(activeFolder, DB.Notes.get(id))

            UI.state.Editors.set(id, this);
        } else {//la nota no existe
            this.data = new NoteBuilder(activeFolder);

            this.temporalId = Date.now();
            UI.state.Editors.set(this.temporalId, this);
        }

        UI.setState({});

        console.log(this.data,"jad");

        const { data } = this;

        this.LastestSave = data.content;

        this.Close = this.Close.bind(this);
        this.closeAnimation = this.closeAnimation.bind(this);
        //FINderid
        // if (id) {
        //     this.windowEditor.setAttribute('identifier', id)
        // }
    }

    setIndex() {
        // this.windowEditor.classList.add("noanimation");
        // document.querySelector('.Editors').appendChild(windowEditor);
    }

    setTheme(theme: Themes) {
        const { EditorInstance, TabInstance, data } = this;

        if (EditorInstance && TabInstance) {
            data.theme = theme;
            EditorInstance.setState({ theme })
            TabInstance.setState({ theme })
        }
    }

    Save() {
        const { data, id,UI } = this;
        const {Editors} = UI.state;

        this.LastestSave = data.content;

        // Crear copia de los Datos de la nota
        let construct = JSON.parse(JSON.stringify(data));
        construct.time = Date.now();

        try {
            if (!id) {//la nota no existe, crearla
                let uuid = DB.Notes.Add(construct);
                this.id = uuid;
                data.id = uuid;

                Editors.delete(this.temporalId);//eliminar la instancia temporal
                Editors.set(this.id, this);// volver a crearla usando la id real

                // this.temporalId = undefined;
            } else {//la nota si existe
                DB.Notes.Update(construct.id, construct);
            }
        } catch (error: any) {
            QuotaLimit(error)
        }

        function QuotaLimit(error: { name: string }) {
            // c
            let message = "";

            if (error.name == "QuotaExceededError") {
                message = "Se alcanzó el limite de localStorage (5MB) por lo que la Nota no fue posible guardarla..."
            } else {
                message = "Error desconocido..."
            }

            console.error(error)
            // Swal.fire({
            //     title: "A ocurrido un error",
            //     icon: "error",
            //     text: message
            // })
        }

        // bc.postMessage(new NoteUpdateData(construct));

        // EditInstance.chachedUpdate = null;
        // EditInstance.setState({ updateReceived: false })

        this.UI.reloadData();
    }

    //Close
    Close(force: React.MouseEvent | boolean = false) {
        const { data } = this;

        let construct = JSON.parse(JSON.stringify(data));
        if (force == true) {
            this.closeAnimation();
        } else {
            if (construct.content != this.LastestSave) {
                Swal.fire({
                    icon: 'warning',
                    showCancelButton: true,
                    cancelButtonText: "Cancelar",
                    reverseButtons: true,
                    html: 'Aún no haz guardado<br> <b>¿estas seguro que deseas cerrar?</b>',
                    confirmButtonText: 'cerrar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.closeAnimation();
                    }
                })
            } else {
                this.closeAnimation();
            }
        }
    }

    async closeAnimation() {
        // bc.removeEventListener('message', BcReceivedUpdate)

        // TabEditor.removeEventListener('click', setIndex)
        const { TabInstance, EditorInstance, UI, data } = this;
        const {Editors} = UI.state;

        await EditorInstance?.closeWindow();
        TabInstance?.closeTab();

        this.temporalId && Editors.delete(this.temporalId);
        data.id && Editors.delete(data.id);

        UI.setState({})
    }

}