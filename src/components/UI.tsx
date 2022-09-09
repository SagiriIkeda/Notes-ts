import React, { createRef } from "react";
import DB from "../db/database";
import { Mat } from "./prefabs";

import FolderSection from "./folders/FolderSection";

export default class UI extends React.Component {

    state = {
        Notes: DB.Notes.Content,
        Folders: DB.Folders.Content,
        activeFolder: 0,
        Editors: [],
        SelectMode: false,
        selectes: [],
        findText: ""
    }

    SearchInput = createRef();

    constructor(props: {}) {
        super(props)

        console.log(this);


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

    }

    reloadData(sendUpdateToBc = true) {
        // sendUpdateToBc == true && bc.postMessage("UpdateApplication");
        this.setState({
            Notes: DB.Notes.Content,
            Folders: DB.Folders.Content
        })
    }

    render() {

        return (
            <div className="UI-manager" >
                <div className="header">
                    {/* <div className="foldername">{DB.Folders.Obtain(this.state.activeFolder).name}</div> */}
                    <div className="foldername">Notes</div>
                </div>
                <div className="sections">
                    <div className="folders-section"
                    // onAuxClick={this.AuxForFolderSection}
                    >
                        <FolderSection/>
                    </div>
                    <div className="notes-sections">
                        {/* <NotesSection/> */}
                    </div>
                </div>
                {/* <div className={`FloatBtn ${(Application.state.SelectMode == true)? "ocult":""}`} */}
                <div className={`FloatBtn`}
                // onClick={NewNote}
                >
                    <Mat>add</Mat>
                </div>
                <div className="Editors" id="Editors">
                </div>
                {/* <div className={`SelectBox ${(this.state.SelectMode == true)? "visible":""}`}> */}
                <div className={`SelectBox `}>
                    <span className="titles" >¿Que Desea hacer?</span>
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