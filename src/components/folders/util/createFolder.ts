import Swal from "sweetalert2";
import DB from "../../../db/database";
import UINOTES from "../../UI";

export default function createFolder(UI: UINOTES) {
    Swal.fire({
        confirmButtonText: 'Crear',
        title: "Nueva Carpeta",
        input: 'text',
        showCancelButton: true,
        showCloseButton: true,
        reverseButtons: true,
        inputPlaceholder: 'Nombre de la Carpeta...',
    }).then((result) => {
        if (result.isConfirmed) {
            const { value } = result;
            if (value.trim()) {
                const alreadyExist = (DB.Folders.getAll().findIndex(folder => folder.name == value) != -1)

                if (alreadyExist || value == "Notes") {
                    Swal.fire({
                        icon: 'error',
                        text: 'Esa Carpeta ya existe!',
                    })
                } else {
                    DB.Folders.add({
                        id: "",
                        name: result.value,
                        order: DB.Folders.getAll().length
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