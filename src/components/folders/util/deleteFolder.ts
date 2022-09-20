import Swal from "sweetalert2";
import DB from "../../../db/database";
import { FOLDERSCONFIG } from "../../../interfaces/config";
import Folder from "../../../interfaces/folder";
import Socket from "../../../socket";
import UINOTES from "../../UI";

export default function deleteFolder(UI: UINOTES, data: Folder) {
    const folderId = data.id;

    if (folderId === FOLDERSCONFIG.DEFAULT_ID) return false;

    const deletableNotes = DB.Notes.search("folder", folderId);
    const length = deletableNotes.length;

    Swal.fire({
        icon: 'warning',
        showCancelButton: true,
        showCloseButton: true,
        reverseButtons: true,
        html: `Desea Borrar la carpeta <b>${data.name}?</b><br><b>También se borrarán las notas que contenga (${length}) </b> `,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Borrar Carpeta"
    }).then((result) => {
        if (result.isConfirmed) {
            if (DB.Folders.remove(folderId) != false) {
                if (UI.state.activeFolder == folderId) {
                    UI.state.activeFolder = FOLDERSCONFIG.DEFAULT_ID;
                }

                UI.state.Editors.forEach(invoker => {//en caso de q se esté creando una nota sin guardar en esa carpeta
                    if (invoker.temporalId && invoker.data.folder == folderId) {
                        const { EditorInstance } = invoker;
                        if (EditorInstance) EditorInstance.state.folderDeleted = true;
                        invoker.data.folder = FOLDERSCONFIG.DEFAULT_ID;
                    }
                })

                deletableNotes.forEach(note => { //cerrar editores que estén abiertos de esta carpeta
                    const Editor = UI.state.Editors.get(note.id);

                    if (Editor) {
                        Editor.forceClose();
                    }

                    DB.Notes.remove(note.id);
                })

                Socket.send({
                    data: folderId,
                    event: "folder-delete",
                })


                UI.reloadData();
                Swal.fire({
                    icon: 'success',
                    html: `¡Carpeta Borrada!`,
                    confirmButtonText: "ok"
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    html: `¡Ocurrio un Error!`,
                    confirmButtonText: "ok"
                })
            }
        }
    })

}