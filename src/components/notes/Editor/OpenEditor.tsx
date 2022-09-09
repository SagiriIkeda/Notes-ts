import React from "react";
import ReactDOM from "react-dom/client";
import DB from "../../../db/database";
import Note, { NoteBuilder } from "../../../interfaces/notes";
import UI from "../../UI";
import Editor from "./Editor";
import Tab from "./Tab";


export default class OpenEditor {

    id?: string;
    data: Note;
    LastestSave: string;
    TabInstance?: Tab;
    EditorInstance?: Editor;

    // windowEditor: HTMLDivElement;
    // TabEditor: HTMLDivElement;

    constructor(UI: UI, id?: string) {
        if (id) {
            // console.log(UI);
            UI.state.Editors.set(id, this);

            UI.setState({});

        }
        this.id = id;

        // super(id);
        //information;

        let DefaultData = new NoteBuilder(UI.state.activeFolder);

        this.data = { ...DefaultData, ...DB.Notes.get(id) };

        if (!id) {
            this.data = JSON.parse(JSON.stringify(DefaultData)) as Note ;
        }

        const { data } = this;

        this.LastestSave = data.content;
        //references
        // this.windowEditor = document.createElement('div');
        // this.windowEditor.className = "Editor";
        // this.TabEditor = document.createElement('div');
        // this.TabEditor.className = "editortab";

        // (document.querySelector('.Editors') as HTMLDivElement).appendChild(this.windowEditor);

        // ReactDOM.createRoot(this.windowEditor).render(<Editor invoker={this} />);
        

        // (document.querySelector('.activeEditors') as HTMLDivElement).appendChild(this.TabEditor)
        // ReactDOM.createRoot(this.TabEditor).render(<Tab invoker={this}/>);

        //LOAD POSITION
        // this.windowEditor.style.height = `${data.position.height}px`;
        // this.windowEditor.style.width = `${data.position.width}px`;
        // this.windowEditor.style.left = `${data.position.left}px`;
        // this.windowEditor.style.top = `${data.position.top}px`;

        // windowEditor.CloseEditor = CloseTotal;

        // this.TabEditor.setAttribute('theme', data.theme)
        // this.windowEditor.setAttribute('theme', data.theme);


        // const self = this;

        //FINderid
        // if (id) {
        //     this.windowEditor.setAttribute('identifier', id)
        // }
        //SAVE FUNCTIONS

        // this.TabEditor.addEventListener('click', this.setIndex)




    }

    setIndex() {
        // this.windowEditor.classList.add("noanimation");
        // document.querySelector('.Editors').appendChild(windowEditor);
    }

    SavePosition() {
        const { data, id } = this;
        // if (id) {
        //     let construct = JSON.parse(JSON.stringify(data)) as Note;

        //     let rect = this.windowEditor.getBoundingClientRect();
        //     let wswidth = rect.width
        //     let wsheight = rect.height;
        //     let wsleft = rect.left;
        //     let wstop = rect.top
        //     DB.Notes.Update(construct.id, {
        //         position: {
        //             width: wswidth,
        //             height: wsheight,
        //             top: wstop,
        //             left: wsleft
        //         }
        //     });
        // }
    }

    Save() {
        const { data, id } = this;

        this.LastestSave = data.content;
        // EditInstance.SaveAnimation();
        let construct = JSON.parse(JSON.stringify(data));
        construct.time = Date.now();
        try {
            if (id) {//la nota no existe
                // let uuid = DB.Notes.Add(construct);
                // this.id = uuid;
                // data.id = uuid;
                // this.windowEditor.setAttribute('identifier', id);
                // Application.state.Editors.push(id);
            } else {//la nota si existe
                // construct.folder = DB.Notes.Obtain(data.id).folder;
                DB.Notes.Update(construct.id, construct)

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

        this.SavePosition();

        // Application.reloadData();
    }

    //Close
    CloseTotal(forceClose = false) {
        const { data } = this;

        let construct = JSON.parse(JSON.stringify(data));
        if (forceClose == true) {
            closeanim();
        } else {
            if (construct.content != this.LastestSave) {
                console.log("No es igual");

                // swal.fire({
                //     icon: 'warning',
                //     showCancelButton: true,
                //     cancelButtonText: "Cancelar",
                //     reverseButtons: true,
                //     html: 'Aún no haz guardado<br> <b>¿estas seguro que deseas cerrar?</b>',
                //     confirmButtonText: 'cerrar'
                // }).then((result) => {
                //     if (result.isConfirmed) {
                //         closeanim();
                //     }
                // })
            } else {
                closeanim();
            }
        }
        function closeanim() {
            // bc.removeEventListener('message', BcReceivedUpdate)

            // TabEditor.removeEventListener('click', setIndex)
            // EditInstance.closeWindow();
            // TabInstance.closeTab();
            // TabEditor.parentNode.removeChild(TabEditor);
            // setTimeout(e => {
            //     windowEditor.parentNode.removeChild(windowEditor);
            // }, 310)
        }
    }

}