import React from "react";
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

    let Notes = UI.state.Notes;

    let Reg = new RegExp(state.findText.replace(/\W/gim, "\\$&"), 'gim');

    let NotesSearched = Notes.filter(note => {
        return Reg.test(note.content) == true || Reg.test(note.title) == true;
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
                <div className="item" onClick={() => UI.SelectMode.setMode(false)}><Mat>close</Mat></div>
                <span className="numsels"><div id="NumSelections">{state.selectes.size}</div>notas Seleccionadas</span>
                <div
                    className={`item ${(state.selectes.size == Notes.length) ? "active" : ""}`}
                    onClick={() => UI.SelectMode.toggleAll()}
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
                    {([...UI.state.Editors.entries()] as [string, OpenEditor][])
                        .sort(([ia, a], [ib, b]) => a.createdAt - b.createdAt)
                        .map(([id, item]) => {
                            return <Tab invoker={item} key={id} />
                        })}
                </div>
            </div>
        </>
    )
}