import React, { createRef, FormEvent, SyntheticEvent } from "react";
import DB from "../db/database";
import { Mat } from "./prefabs";

import FolderSection from "./folders/FolderSection";
import Folder from "../interfaces/folder";

import NotesSection from "./notes/NotesSection";
import OpenEditor, { OpenLimitedEditor } from "./notes/Editor/OpenEditor";
import Editor, { Editors } from "./notes/Editor/Editor";
import SelectMode from "./notes/controllers/SelectMode";
import AuxMenu from "./AuxMenu/Menu";
import JsonMenu from "./notes/controllers/JsonMenu";
import { mode } from "./notes/NoteItem";
import MoveFolder from "./notes/controllers/MoveFolder";
import Note from "../interfaces/notes";

export default class UINOTES extends React.Component {

    state = {
        Notes: DB.Notes.getAll(),
        Folders: DB.Folders.getAll(),
        activeFolder: "0",
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



    constructor(props: {}) {
        super(props)

        //AutoSet ActiveFolder
        const ActiveFolder = DB.ActiveFolder.get();

        if(ActiveFolder != "0"){
            const folderExists = DB.Folders.get(ActiveFolder)
            if(folderExists){
                this.state.activeFolder = ActiveFolder
            }
        }

        // function UpdateInfoBC({data} = e) {
        //     if(data == "UpdateApplication") {
        //         DB.Notes.Load();
        //         DB.Folders.Load();
        //         self.reloadData(false);
        //     }
        // }

        // this.built = crypto.randomUUID()
        // this.built = "0d21cae2-701b-43da-affc-2e017cc118af"

        // bc.addEventListener("message",UpdateInfoBC)
        this.reloadData({
            update: false,
        });

    }

    changeSelectedFolder(id: Folder["id"]) {
        DB.ActiveFolder.set(id);
        this.state.activeFolder = id;
        mode.first = true;
        this.reloadData();
    }
    // send is sendUpdateToBC
    reloadData(config: { send?: boolean, update?: boolean } = { update: true, send: false }) {

        const { state } = this;

        const Notes = DB.Notes.getAll()
            .filter((note) => note.folder == state.activeFolder)
            .sort((a, b) => b.time - a.time);

        const Folders = DB.Folders.getAll()
            // .filter((folder) => folder.folder == state.activeFolder)
            .sort((a, b) => a?.order - b?.order);

        this.state.Notes = Notes;
        this.state.Folders = Folders;

        config?.update && this.setState({})
    }

    // changeFindText(e: FormEvent<HTMLInputElement>) {
    //     const {value} = e.target as HTMLInputElement;
    //     this.setState({
    //         findText: value
    //     })
    // }

    // cancelFind() {

    // }

    render() {
        const { state } = this;

        return (
            <div className="UI-manager" >
                <div className="header">
                    <div className="foldername">{(DB.Folders.get(state.activeFolder) as Folder)?.name}</div>
                </div>
                <div className="sections">
                    <FolderSection UI={this} />

                    <div className="notes-sections">
                        <NotesSection UI={this} />
                    </div>
                </div>
                <div className={`FloatBtn${(state.SelectMode) ? " ocult" : ""}`}
                    onClick={() => OpenLimitedEditor(this)}
                >
                    <Mat>add</Mat>
                </div>
                <div className="Editors" id="Editors">
                    <Editors UI={this} />
                </div>

                <div className={`SelectBox${(state.SelectMode == true) ? " visible" : ""}`}>
                    <span className="titles" >¿Qué Desea hacer?</span>
                    <div className="div">
                        <div className={`item${state.selectes.size == 0 ? " disabled" : ""}`} onClick={this.SelectMode.deleteSelectes} ><Mat>delete</Mat> Borrar</div>
                        <div className={`item${state.selectes.size == 0 ? " disabled" : ""}`} onClick={() => this.MOVEFOLDER?.open()}><Mat>drive_file_move_rtl</Mat> Mover a...</div>
                        <div className="item" onClick={() => this.SelectMode.setMode(false)}><Mat>close</Mat> Cancelar</div>
                    </div>
                </div>

                <AuxMenu UI={this} />
                <JsonMenu UI={this} />
                <MoveFolder UI={this} />
            </div>
        )

    }
}