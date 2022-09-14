import React, { useState } from "react";
import UI from "../UI";
import { Mat, Btn } from "../prefabs"
import NoteItem from "./NoteItem";
import OpenEditor, { OpenLimitedEditor } from "./Editor/OpenEditor";
import Tab from "./Editor/Tab";
import { AuxList } from "../AuxMenu/item";

interface NoteSectionProps {
    UI: UI
}

export default function NotesSection({ UI }: NoteSectionProps) {
    const { state } = UI;
    const [findText, setFindText] = useState("");

    const isSelectMode = state.SelectMode == true;

    const Notes = UI.state.Notes;

    const Reg = new RegExp(findText.replace(/\W/gim, "\\$&"), 'gim');

    const NotesSearched = findText ? Notes.filter(note => {
        return Reg.test(note.content) == true || Reg.test(note.title) == true;
    }): Notes;

    UI.cachedSearchedNotes = (findText) ? NotesSearched : undefined;

    function changeFindText(e: React.ChangeEvent<HTMLInputElement>) {
        const { value } = e.target;
        UI.state.findText = value;
        setFindText(value);
    }

    function cancelFind() {
        const input = UI.SearchInput.current;
        if(input) input.value = "";
        UI.state.findText = "";
        setFindText("");
    }

    function AuxForNotesSection(event: React.MouseEvent) {
        const target = event.target as HTMLDivElement;
        if (target.classList.contains("notes-preview-container")) {
            let obj: AuxList = [
                {
                    icon: "note_add",
                    action: () => {
                        OpenLimitedEditor(UI)
                    },
                    name: "Crear Nueva Nota"
                },
            ]
            UI.AUX?.set(obj, event, "NewNoteAux");
        }
    }
    return (
        <>
            <div className={`selectedIndicate ${(isSelectMode) ? "visible" : ""}`}>
                <div className="item" onClick={() => UI.SelectMode.setMode(false)}><Mat>close</Mat></div>
                <span className="numsels"><div id="NumSelections">{state.selectes.size}</div>notas Seleccionadas</span>
                <div
                    className={`item ${(state.selectes.size == NotesSearched.length) ? "active" : ""}`}
                    onClick={() => UI.SelectMode.toggleAll()}
                    id="ButtonSelectAll"
                ><Mat>grading</Mat></div>
            </div>
            <div className="search">
                <div className={`search__container ${(findText.length != 0) ? "active" : ""}`}>
                    <label>
                        <Mat>search</Mat>
                        <input
                            type="text"
                            placeholder="buscar notas..."
                            onInput={changeFindText}
                            ref={UI.SearchInput}
                        />
                        <Mat onClick={cancelFind}>close</Mat>
                    </label>
                </div>
            </div>
            <div className={`notes-preview-container ${(isSelectMode) ? "selectmode" : ""}`}
                onAuxClick={AuxForNotesSection}
            >
                {/* No hay Notas o no hay resultados por búsqueda */}
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
                                            onClick={() => OpenLimitedEditor(UI)}
                                        >Crea una</Btn>
                                    </>
                                    )}
                            </div>
                        </div>
                    )
                    :
                    // Resultados de Notas
                    (findText.length != 0) ?
                        NotesSearched.map(note =>
                            <NoteItem data={note} UI={UI} key={note.id}></NoteItem>
                        )
                        //No hay búsqueda (todas las notas)
                        : Notes.map(note =>
                            <NoteItem data={note} UI={UI} key={note.id}></NoteItem>
                        )
                }
                {(state.SelectMode == true) && (<div className="SimulateBox"></div>)}
            </div>
            <div className="activeEditorsContainer">
                <div className="activeEditors">
                    {[...UI.state.Editors.entries()]
                        .sort(([ia, a], [ib, b]) => a.createdAt - b.createdAt)
                        .map(([id, item]) => {
                            return <Tab invoker={item} key={id} />
                        })}
                </div>
            </div>
        </>
    )
}