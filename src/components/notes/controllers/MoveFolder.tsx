import React, { FormEvent, SyntheticEvent } from "react";
import { createRef } from "react";
import DB from "../../../db/database";
import Folder from "../../../interfaces/folder";
import { Mat } from "../../prefabs";
import UINOTES from "../../UI";

interface MoveFolderProps {
    UI: UINOTES,
}
interface MoveFolderState {
    selected: string,
    search: string,
    noSelectioned: boolean,
    opend: boolean
}

export default class MoveFolder extends React.Component<MoveFolderProps, MoveFolderState>{

    searchInput = createRef<HTMLInputElement>();
    container = createRef<HTMLDivElement>();
    shadow = createRef<HTMLDivElement>();


    state: MoveFolderState = {
        selected: "",
        search: "",
        noSelectioned: false,
        opend: false
    }
    UI: UINOTES

    constructor(props: MoveFolderProps) {
        super(props);
        this.moveNotes = this.moveNotes.bind(this);

        this.UI = props.UI;

        this.UI.MOVEFOLDER = this;

        this.setFolder = this.setFolder.bind(this);

        this.search = this.search.bind(this);
        this.cancelSearch = this.cancelSearch.bind(this);
        this.setFolder = this.setFolder.bind(this);
        this.moveNotes = this.moveNotes.bind(this);
        this.close = this.close.bind(this);
    }

    close() {
        return new Promise((resolve, reject) => {
            const { container, shadow, UI } = this;
            shadow.current?.classList.add("noaction")
            container.current?.animate({
                opacity: 0,
                transform: "scale(0.9)"
            }, {
                duration: 250,
                fill: "forwards",
                easing: "cubic-bezier(0.190, 1.000, 0.220, 1.000)"
            })
                .addEventListener("finish", () => {
                    // if(Application.state.SelectMode == false && Application.state.selectes.length == 1){
                    if (UI.state.SelectMode == false && UI.state.selectes.size == 1) { // solo una nota seleccionada sin SelectMenu
                        UI.SelectMode.clear()
                    }
                    this.setState({
                        selected: "",
                        search: "",
                        noSelectioned: false,
                        opend: false
                    })
                    resolve(true);
                })
        })
    }

    open() {
        if (this.UI.state.selectes.size > 0) {
            this.setState({
                opend: true
            })
        }
    }

    setFolder(id: string) {
        const { state } = this;
        if (state.selected != id) {
            this.setState({
                selected: id,
                noSelectioned: false
            })
        } else {
            this.setState({
                selected: ""
            })
        }
    }
    moveNotes() {
        const { state, UI } = this;
        if (state.selected.trim()) {
            UI.state.selectes.forEach(note => {
                DB.Notes.Update(note, {
                    folder: state.selected
                })
            })
            UI.SelectMode.clear();
            UI.state.SelectMode = false;
            UI.reloadData();
            this.close();
        } else {
            this.setState({
                noSelectioned: true
            })
        }
    }


    cancelSearch() {
        const searchInput = this.searchInput.current;
        if (searchInput) {
            searchInput.value = "";
        }
        this.setState({
            search: ""
        })
    }
    search(e: SyntheticEvent<HTMLInputElement, InputEvent>) {
        let value = (e.target as HTMLInputElement).value;

        this.setState({
            search: value
        })
    }

    render() {
        const { UI, state } = this;

        let { Folders } = UI.state;

        if (state.search != "") {
            let Reg = new RegExp(state.search.replace(/\W/gim, "\\$&"), 'gim');
            Folders = Folders.filter(folder => Reg.test(folder.name))
        }

        if (state.opend) {
            let size = UI.state.selectes.size;
            return (
                <div className="MoveFolderContainer">
                    <div className="shadow" ref={this.shadow} onClick={this.close} ></div>
                    <div className="MoveFolder" ref={this.container} >
                        <div className="Nav">
                            <div className="MoveTitle">
                                <h2>Mover a la carpeta </h2>
                                <Mat onClick={this.close}>close</Mat>
                            </div>
                            <label className="searchFolderBar">
                                <Mat>search</Mat>
                                <input type="text" maxLength={50} placeholder="Buscar Carpetas..." onInput={this.search} ref={this.searchInput} />
                                {(state.search != "") && (
                                    <Mat onClick={this.cancelSearch}>close</Mat>
                                )}
                            </label>

                        </div>
                        <div className="FoldersSection">
                            {(state.search != "" && Folders.length == 0) && (
                                <div className="centerFolders">
                                    <Mat>search_off</Mat>
                                    <span>No hay Carpetas con "{state.search}"</span>
                                </div>
                            )}
                            {Folders.map(folder =>
                                <MoveFolderItem key={folder.id} MF={this} data={folder} />
                            )}
                        </div>
                        <div className="footer">
                            <span>
                                <div className={(state.noSelectioned == true) ? "NoSelected" : ""}>{(state.selected != "") ? DB.Folders.get(state.selected)?.name : "Selecciona una carpeta..."} </div>
                                <br />
                                <p>{size} {(size > 1) ? "Notas Seleccionadas" : "Nota Seleccionada"}</p>
                            </span>
                            <div className="btn" onClick={this.close}>Cancelar</div>
                            <div className="btn act" onClick={this.moveNotes}>Mover</div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}

function MoveFolderItem(props: { data: Folder, MF: MoveFolder }) {
    const { MF, data } = props;

    function setFolder() {
        MF.setFolder(data.id)
    }

    if (MF.UI.state.activeFolder != data.id) {
        return (
            <div className={`folder ${(MF.state.selected == data.id) ? "Selected" : ""}`} onClick={setFolder}>
                <Mat>folder</Mat>
                <span>{data.name}</span>
                {(MF.state.selected == data.id) ? (
                    <Mat>check_circle</Mat>
                ) : (
                    <Mat>radio_button_unchecked</Mat>
                )}
            </div>
        )
    }

    return <></>;
}