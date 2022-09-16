import Swal from "sweetalert2";
import { Notes } from "../../../db/database";
import Note from "../../../interfaces/notes";
import Socket from "../../../socket";
import UINOTES from "../../UI";
// import { firstSelected } from "../NoteItem";

interface SelectModeConfig {
    UI: UINOTES
}

export default class SelectMode implements SelectModeConfig {

    UI: UINOTES;
    first = true;

    constructor(config: SelectModeConfig) {
        this.UI = config.UI;

        this.deleteSelectes = this.deleteSelectes.bind(this);
    }

    add(id: Note["id"]) {
        this.getSelectes().add(id);
    }

    delete(id: Note["id"]) {
        this.getSelectes().delete(id);
    }

    clear() {
        const { UI } = this;
        UI.state.selectes.clear();
    }

    toggleAll(forceAll = false) {
        const { UI } = this;
        const { state } = UI;

        const Notes = UI.cachedSearchedNotes ?? state.Notes;

        if (state.selectes.size == Notes.length && forceAll == false) {

            UI.state.selectes.clear();
            UI.setState({})
        } else {
            UI.setState({
                selectes: new Set<string>(Notes.map((note) => note.id))
            })
        }
    }

    setMode(type: boolean) {
        const { UI } = this;

        if (UI.state.SelectMode != type) {
            if (type == false) {
                UI.state.selectes.clear();
                this.first = true;
            }
            UI.setState({ SelectMode: type })
        }
    }


    getSelectes() {
        return this.UI.state.selectes;
    }

    //utilities 

    deleteSelectes() {
        if (this.getSelectes().size > 0) {
            const selectes = this.getSelectes();

            Swal.fire({
                // title: 'Estas Seguro?',
                showCancelButton: true,
                cancelButtonText: "Cancelar",
                reverseButtons: true,
                html: "<h2>¿Estás seguro?</h2> Una vez borradas no hay forma de recuperarlas!",
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Borrar',
                icon: 'warning'

            }).then((result) => {
                if (result.isConfirmed) {

                    selectes.forEach((id) => {
                        const Editor = this.UI.state.Editors.get(id);
                        if (Editor) {
                            Editor.forceClose(false);
                        }

                        Notes.remove(id);
                    })

                    Socket.send({
                        data: [...selectes],
                        event: "note-bulk-delete",
                    })

                    this.UI.state.SelectMode = false;
                    this.UI.reloadData();
                }
            })
        }

    }



}