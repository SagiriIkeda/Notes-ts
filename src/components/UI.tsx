import React, { createRef } from "react";
import DB from "../db/database";
import { Mat } from "./prefabs";

import FolderSection from "./folders/FolderSection";
import Folder from "../interfaces/folder";

import NotesSection from "./notes/NotesSection";
import OpenEditor, { OpenLimitedEditor } from "./notes/Editor/OpenEditor";
import Editor, { Editors } from "./notes/Editor/Editor";
import { firstSelected } from "./notes/NoteItem";
// firstSelected
// import { NoteBuilder } from "../interfaces/notes";


// DB.Notes.Add(new NoteBuilder("0"))


export default class UINOTES extends React.Component {

    state = {
        Notes: DB.Notes.getAll(),
        Folders: DB.Folders.getAll(),
        activeFolder: "0",
        Editors: new Map(),
        SelectMode: false,
        selectes: new Set(),
        findText: ""
    }

    SearchInput = createRef<HTMLInputElement>();

    constructor(props: {}) {
        super(props)

        // console.log(this);


        // this.SearchInput = createRef();
        // this.version = "v4.2";
        // this.AuxForFolderSection = this.AuxForFolderSection.bind(this);

        // if(localStorage.getItem('ActiveFolder') != undefined){
        //     this.state.activeFolder = localStorage.getItem('ActiveFolder');
        //     if(DB.Folders.Obtain(this.state.activeFolder) == false){
        //         this.state.activeFolder = 0;
        //     }
        // }

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

        this.SelectAll = this.SelectAll.bind(this);

    }

    changeSelectedFolder(id: Folder["id"]) {
        // this.reloadData(false,false);
        this.state.activeFolder = id;

        this.reloadData();
    }
    // send is sendUpdateToBC
    reloadData(config: { send?: boolean, update?: boolean } = { update: true, send: false }) {

        const { state } = this;

        const Notes = DB.Notes.getAll()
            .filter((note) => note.folder == state.activeFolder)
            .sort((a, b) => b.time - a.time);

        this.state.Notes = Notes;
        this.state.Folders = DB.Folders.getAll();

        config?.update && this.setState({})
    }

    setSelectMode(type: boolean) {
        if (this.state.SelectMode != type) {
            if (type == false) {
                this.state.selectes.clear();
                firstSelected.mode = true;
            }
            this.setState({ SelectMode: type })
        }
    }

    // CloseSelectMode() {

    // }

    SelectAll() {
        const { state } = this;
        // const filtered = this.state.Notes;

        if (state.selectes.size == state.Notes.length) {
            this.state.selectes.clear();
            this.setState({})
        } else {
            this.setState({
                //!NOTE: remover filtrado a tiempo real
                selectes: new Set(state.Notes.map((note) => note.id))
            })
        }
    }

    changeFindText() {
    }

    cancelFind() {

    }

    render() {
        const { state } = this;

        return (
            <div className="UI-manager" >
                <div className="header">
                    <div className="foldername">{(DB.Folders.get(state.activeFolder) as Folder)?.name}</div>
                </div>
                <div className="sections">
                    <div className="folders-section"
                    // onAuxClick={this.AuxForFolderSection}
                    >
                        <FolderSection UI={this} />
                    </div>
                    <div className="notes-sections">
                        <NotesSection UI={this} />
                    </div>
                </div>
                <div className={`FloatBtn${(state.SelectMode) ? " ocult" : ""}`}
                    //* <div className={`FloatBtn`} 
                    onClick={() => OpenLimitedEditor(this)}
                >
                    <Mat>add</Mat>
                </div>
                <div className="Editors" id="Editors">
                    <Editors UI={this} />
                </div>
                {/* <div className={`SelectBox ${(this.state.SelectMode == true)? "visible":""}`}> */}
                <div className={`SelectBox `}>
                    <span className="titles" >¿Qué Desea hacer?</span>
                    <div className="div">
                        {/* <div className="item" onClick={Application.DeleteSelectes} ><Mat>delete</Mat> Borrar</div>
                        <div className="item" onClick={OpenMoveFolder}><Mat>drive_file_move_rtl</Mat> Mover a...</div>
                        <div className="item" onClick={Application.CloseSelectMode}><Mat>close</Mat> Cancelar</div> */}
                    </div>
                </div>
            </div>
        )

    }
}