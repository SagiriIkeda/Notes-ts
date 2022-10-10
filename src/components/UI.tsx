import React, { createRef } from "react";
import DB from "../db/database";
import { Mat } from "./prefabs";

import FolderSection from "./folders/FolderSection";
import Folder from "../interfaces/folder";

import NotesSection from "./notes/NotesSection";
import OpenEditor, { OpenLimitedEditor } from "./notes/Editor/OpenEditor";

import SelectMode from "./notes/controllers/SelectMode";
import AuxMenu from "./AuxMenu/Menu";
import JsonMenu from "./notes/controllers/JsonMenu";

import { mode } from "./notes/NoteItem";
import MoveFolder from "./notes/controllers/MoveFolder";
import Note from "../interfaces/notes";
import EditorsBar from "./notes/Editor/Bar";
import { DevEditors } from "./notes/Editor/Editor";
import Socket from "../socket";
import DropZone from "./notes/controllers/droopzone";
import { FOLDERSCONFIG } from "../interfaces/config";
import { Header } from "./Header";

export default class UINOTES extends React.Component {

    state = {
        Notes: DB.Notes.getAll(),
        Folders: DB.Folders.getAll(),
        activeFolder: FOLDERSCONFIG.DEFAULT_ID as string ,
        Editors: new Map<string, OpenEditor>(),
        SelectMode: false,
        selectes: new Set<string>(),
        findText: ""
    }
    cachedSearchedNotes?: Note[];

    SelectMode = new SelectMode({ UI: this });

    SearchInput = createRef<HTMLInputElement>();

    AUX?: AuxMenu;
    JSONMENU?: JsonMenu;
    MOVEFOLDER?: MoveFolder;
    HEADER?: Header;

    constructor(props: {}) {
        super(props)

        //AutoSet ActiveFolder
        const ActiveFolder = DB.ActiveFolder.get();

        if (ActiveFolder != FOLDERSCONFIG.DEFAULT_ID) {
            const folderExists = DB.Folders.get(ActiveFolder)
            if (folderExists) {
                this.state.activeFolder = ActiveFolder
            }
        }

        this.reloadData({
            update: false,
            send: false,
        });

    }

    componentDidMount() {
        //Socket Events
        Socket.on("update-app", (response) => {
            DB.loadAll();
            this.reloadData({
                send: false,
            })
        })

        Socket.on("note-bulk-delete", (response) => {
            const NoteIds = response.data;
            // Cerrar los editores de esas Notas
            NoteIds.forEach((id) => {
                const Editor = this.state.Editors.get(id);
                if (Editor) {
                    Editor.forceClose(false);
                }
            })
        })

        Socket.on("folder-delete", (response) => {
            const { state } = this;
            const folderId = response.data;
            DB.ActiveFolder.load();

            if (state.activeFolder == folderId) {
                state.activeFolder = FOLDERSCONFIG.DEFAULT_ID;
                mode.first = true;
            }

            state.Editors.forEach((Invoker, id) => {
                const { data } = Invoker;

                if (data.folder == folderId) {//El editor está en la misma carpeta
                    if (Invoker.temporalId) {//es una nota sin guardar (Aún temporal) añadirle una nota
                        Invoker.data.folder = FOLDERSCONFIG.DEFAULT_ID;
                        const { EditorInstance } = Invoker;
                        if (EditorInstance) EditorInstance.state.folderDeleted = true;
                    } else {//es una nota previamente guardada (cerrarla)
                        Invoker.forceClose(false);
                    }

                }
            })
        })


    }

    changeSelectedFolder(id: Folder["id"]) {
        const {HEADER} = this;
        DB.ActiveFolder.set(id);
        this.state.activeFolder = id;
        mode.first = true;
        HEADER && (HEADER.state.folderSectionVisible = false);
        this.reloadData({ send: false });
    }
    // send is sendUpdateToBC
    reloadData({ update = true, send = true }: { send?: boolean, update?: boolean } = {}) {
        const { state } = this;

        const Notes = DB.Notes.getAll()
            .filter((note) => note.folder == state.activeFolder)
            .sort((a, b) => b.time - a.time);

        const Folders = DB.Folders.getAll()
            .sort((a, b) => a?.order - b?.order);

        this.state.Notes = Notes;
        this.state.Folders = Folders;

        update && this.setState({})

        if (send) {
            Socket.send({
                data: null,
                event: "update-app",
            })
        }

    }

    render() {
        const { state } = this;
        const SelectMenuButtonsDisabled = state.selectes.size == 0 ? " disabled" : "";

        return (
            <div className="UI-notes-manager" >
                <Header  UI={this} />
                {/* <div className="header">
                    <div className="foldername">{(DB.Folders.get(state.activeFolder) as Folder)?.name}</div>
                </div> */}
                <div className="sections">
                    <FolderSection UI={this} />

                    <div className="notes-sections">
                        <NotesSection UI={this} />
                        {/* <EditorsBar UI={this} /> */}
                        <DevEditors UI={this} />
                    </div>
                </div>
                <div className={`FloatBtn${(state.SelectMode) ? " ocult" : ""}`}
                    onClick={() => OpenLimitedEditor(this)}
                >
                    <Mat>add</Mat>
                </div>

                <div className={`SelectBox${(state.SelectMode == true) ? " visible" : ""}`}>
                    <span className="titles" >¿Qué Desea hacer?</span>
                    <div className="div">
                        <div className={`item${SelectMenuButtonsDisabled}`} onClick={this.SelectMode.deleteSelectes} ><Mat>delete</Mat> Borrar</div>
                        <div className={`item${SelectMenuButtonsDisabled}`} onClick={() => this.MOVEFOLDER?.open()}><Mat>drive_file_move_rtl</Mat> Mover a...</div>
                        <div className="item" onClick={() => this.SelectMode.setMode(false)}><Mat>close</Mat> Cancelar</div>
                    </div>
                </div>

                <AuxMenu UI={this} />
                <JsonMenu UI={this} />
                <MoveFolder UI={this} />
                <DropZone UI={this} />
            </div>
        )

    }
}