//variables
const Data = React.createContext({});
let Application; 
let globalInterval;

//Functions Folders
function CreateFolder(props) {
    Swal.fire({
        confirmButtonText: 'Crear',
        title:"Nueva Carpeta",
        input: 'text',
        showCancelButton:true,
        showCloseButton:true,
        reverseButtons:true,
        inputPlaceholder: 'Nombre de la Carpeta...',
      }).then((result) => {
        if (result.isConfirmed) {
            if(result.value.trim() || result.value === "Notas"){
                if(DB.Folders.Content.findIndex(e => e.name == result.value) != -1){
                    Swal.fire({
                        icon: 'error',
                        text: 'Esa Carpeta ya existe!',
                    })
                }else {
                    DB.Folders.Add({
                        name: result.value,
                        order: DB.Folders.Content.length
                    })
                    Application.reloadData();
                }
            }else {
                Swal.fire({
                    icon: 'error',
                    text: 'La Carpeta no puede tener un nombre vacio!',
                })
            }

        }
    })
    Swal.getInput().setAttribute("maxlength","24");
}
function DeleteFolder(id) {
    if(id == 0) return false;
    let information = DB.Folders.Obtain(id);
    if(information == false) return false;
    Swal.fire({
        icon: 'warning',
        html: `Desea Borrar la carpeta <b>${information.name}?</b>`,
        confirmButtonText: "borrar"
    }).then((result) => {
        if (result.isConfirmed) {
            if(DB.Folders.Remove(id) != false) {
                if(Application.state.activeFolder == id) {
                    Application.setFolder(0);
                }
                let DeletedNotes = (DB.Notes.Search("folder",id));
                DeletedNotes.forEach(content => {
                    if(document.querySelector(`.Editor[identifier="${content.id}"]`)){
                        document.querySelector(`.Editor[identifier="${content.id}"]`).CloseEditor(true);
                    }
                    DB.Notes.Remove(content.id);
                })
                Application.reloadData();
                Swal.fire({
                    icon: 'success',
                    html: `Carpeta Borrada!`,
                    confirmButtonText: "ok"
                })
            }else {
                Swal.fire({
                    icon: 'error',
                    html: `Ocurrio un Error!`,
                    confirmButtonText: "ok"
                })
            }
        }
    })
}
function RenameFolder(id) {
    if(id == 0) return false;
    let information = DB.Folders.Obtain(id);
    if(information == false) return false;
    Swal.fire({
        confirmButtonText: 'Crear',
        title:"Renombar Carpeta",
        input: 'text',
        showCancelButton:true,
        showCloseButton:true,
        reverseButtons:true,
        inputValue:information.name,
        inputPlaceholder: 'Nombre de la Carpeta...',
      }).then((result) => {
        if (result.isConfirmed) {
            if(result.value.trim() || result.value === "Notas"){
                if(DB.Folders.Content.findIndex(e => e.name == result.value) != -1){
                    Swal.fire({
                        icon: 'error',
                        text: 'Esa Carpeta ya existe!',
                    })
                }else {
                    DB.Folders.Update(id,{
                        name: result.value,
                    })
                    Application.reloadData();
                }
            }else {
                Swal.fire({
                    icon: 'error',
                    text: 'La Carpeta no puede tener un nombre vacio!',
                })
            }

        }
    })
    Swal.getInput().setAttribute("maxlength","24");
}

//Functions Notes 
function NewNote() {
    new Editor(true);
}
function DeleteNote(id) {
    let data = DB.Notes.Obtain(id);
    if(data == false) return false;
    Swal.fire({
        icon: 'warning',
        showCancelButton:true,
        cancelButtonText:"Cancelar",
        reverseButtons:true,
        html: `¿Deseas Borrar la Nota <b>${data.title}</b>?<br><br>¡Una vez borrada no podras recuperarla!`,
        confirmButtonText: "borrar"
    }).then((result) => {
        if (result.isConfirmed) {
            if(DB.Notes.Remove(id) != false){
                if(document.querySelector(`.Editor[identifier="${id}"]`)){
                    document.querySelector(`.Editor[identifier="${id}"]`).CloseEditor(true);
                }
                Application.reloadData();
            }else {
                Swal.fire({
                    icon: 'error',
                    html: `Ocurrio un Error!`,
                    confirmButtonText: "ok"
                })
            }
        }
    })
}