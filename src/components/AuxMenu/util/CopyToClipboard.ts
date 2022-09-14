import Swal from "sweetalert2"

export function CopyToClipboard(text: string = "") {
    navigator.clipboard.writeText(text).catch((error) => {
        console.error(error);
        
        Swal.fire({
            icon:"warning",
            text:"Ocurrió un error, no se pudo copiar"
        })
    } )
}