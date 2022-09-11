import React, { MouseEventHandler } from "react";
import DB from "../../db/database";
import UI from "../UI";
import { Mat, Btn } from "../prefabs"
import NoteItem from "./NoteItem";
import OpenEditor from "./Editor/OpenEditor";
import Tab from "./Editor/Tab";


interface NoteSectionProps {
    UI: UI
}

export default function NotesSection({ UI }: NoteSectionProps) {
    const { state } = UI;
    // let state = React.usestate(Data);
    let Notes = DB.Notes.Filter(e => e.folder == state.activeFolder).sort((a, b) => b.time - a.time);
    let Reg = new RegExp(state.findText.replace(/\W/gim, "\\$&"), 'gim');

    let NotesSearched = Notes.filter(note => {
        return Reg.test(note.content) == true || Reg.test(note.title) == true;
        // if (Reg.test(note.content) == true || Reg.test(note.title) == true) {
        //     return true;
        // } else {
        //     return false;
        // }
    })
    // function AuxForNotesSection(event : MouseEventHandler ) {
    //     if(event.target.classList.contains("notes-preview-container")){
    //         let obj = [
    //             {
    //                 icon:"note_add",
    //                 Action:e => {
    //                     NewNote();
    //                 },
    //                 name:"Crear Nueva Nota"
    //             },
    //         ]
    //         SetOpenAuxClick(obj,event,"NewNoteAux");
    //     }
    // }
    return (
        <>
            <div className={`selectedIndicate ${(state.SelectMode == true) ? "visible" : ""}`}>
                <div className="item" onClick={UI.CloseSelectMode}><Mat>close</Mat></div>
                <span className="numsels"><div id="NumSelections">{state.selectes.length}</div>notas Seleccionadas</span>
                <div
                    className={`item ${(state.selectes.length == Notes.length) ? "active" : ""}`}
                    onClick={UI.ShowSelectes}
                    id="ButtonSelectAll"
                ><Mat>grading</Mat></div>
            </div>
            <div className="search">
                <div className={`search__container ${(state.findText.length != 0) ? "active" : ""}`}>
                    <label>
                        <Mat>search</Mat>
                        <input
                            type="text"
                            placeholder="buscar notas..."
                            onInput={UI.changeFindText}
                            ref={UI.SearchInput}
                        />
                        <i className="material-icons" onClick={UI.cancelFind}>close</i>
                    </label>
                </div>
            </div>
            <div className={`notes-preview-container ${(UI.state.SelectMode == true) ? "selectmode" : ""}`}
            // onAuxClick={AuxForNotesSection}
            >
                {(Notes.length == 0 || NotesSearched.length == 0) ?
                    (
                        <div className="NoNotes">
                            <div>
                                {(NotesSearched.length == 0 && state.findText.length != 0) ? (
                                    <>
                                        <Mat>search_off</Mat>
                                        <span>No hay Resultados</span>
                                    </>
                                ) :
                                    (<>
                                        <Mat>note_add</Mat>
                                        <span>Aun no hay notas</span>
                                        <Btn
                                        // onClick={NewNote}
                                        >Crea una</Btn>
                                    </>
                                    )}
                            </div>
                        </div>
                    )
                    :
                    (state.findText.length != 0) ?
                        NotesSearched.map(note =>
                            <NoteItem data={note} UI={UI} key={note.id}></NoteItem>
                        )
                        : Notes.map(note =>
                            <NoteItem data={note} UI={UI} key={note.id}></NoteItem>
                        )
                }
                {(state.SelectMode == true) && (<div className="SimulateBox"></div>)}
            </div>
            <div className="activeEditorsContainer">
                <div className="activeEditors">
                    {[...UI.state.Editors.entries()].map(([id,item] : [string,OpenEditor] ) => {
                        return <Tab invoker={item} key={id} />
                    })}
                </div>
            </div>
        </>
    )
}