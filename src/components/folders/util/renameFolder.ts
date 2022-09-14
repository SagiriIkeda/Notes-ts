import Swal from "sweetalert2";
import DB from "../../../db/database";
import Folder from "../../../interfaces/folder";
import UINOTES from "../../UI";

export default function renameFolder(UI: UINOTES, data: Folder) {
    const folderId = data.id;
    if (folderId === "0") return false;

    Swal.fire({
        confirmButtonText: 'Crear',
        title: "Renombar Carpeta",
        input: 'text',
        showCancelButton: true,
        showCloseButton: true,
        reverseButtons: true,
        inputValue: data.name,
        inputPlaceholder: 'Nombre de la Carpeta...',
    }).then((result) => {
        if (result.isConfirmed) {
            const { value } = result;
            const alreadyExist = (DB.Folders.getAll().findIndex(folder => folder.name == value) != -1)

            if (result.value.trim()) {
                if (alreadyExist || result.value === "Notes") {
                    Swal.fire({
                        icon: 'error',
                        text: 'Esa Carpeta ya existe!',
                    })
                } else {
                    DB.Folders.Update(folderId, {
                        name: result.value,
                    })
                    UI.reloadData();
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    text: 'La Carpeta no puede tener un nombre vacio!',
                })
            }

        }
    })
    Swal.getInput()?.setAttribute("maxlength", "24");
}