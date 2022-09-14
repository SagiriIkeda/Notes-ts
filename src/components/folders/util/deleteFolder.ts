import Swal from "sweetalert2";
import DB from "../../../db/database";
import Folder from "../../../interfaces/folder";
import UINOTES from "../../UI";

export default function deleteFolder(UI: UINOTES, data: Folder) {
    const folderId = data.id;

    if (folderId === "0") return false;
    
    Swal.fire({
        icon: 'warning',
        showCancelButton: true,
        showCloseButton: true,
        reverseButtons: true,
        html: `Desea Borrar la carpeta <b>${data.name}?</b><br><b>También se borrarán las notas que contenga</b> `,
        confirmButtonText: "borrar"
    }).then((result) => {
        if (result.isConfirmed) {
            if (DB.Folders.Remove(folderId) != false) {
                if (UI.state.activeFolder == folderId) {
                    UI.state.activeFolder = "0";

                }
                const deletableNotes = DB.Notes.Search("folder", folderId);

                UI.state.Editors.forEach(Editor => {//en caso de q se esté creando una nota sin guardar en esa carpeta
                    if (Editor.temporalId && Editor.data.folder == folderId) {
                        Editor.data.folder = "0";
                    }
                })

                deletableNotes.forEach(note => { //cerrar editores que estén abiertos de esta carpeta

                    const Editor = UI.state.Editors.get(note.id);

                    if (Editor) {
                        Editor.forceClose();
                    }

                    DB.Notes.Remove(note.id);
                })

                UI.reloadData();
                Swal.fire({
                    icon: 'success',
                    html: `Carpeta Borrada!`,
                    confirmButtonText: "ok"
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    html: `Ocurrio un Error!`,
                    confirmButtonText: "ok"
                })
            }
        }
    })

}