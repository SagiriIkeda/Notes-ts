import Folder from "../../../interfaces/folder";
import { Mat } from "../../prefabs";
import MoveFolder from "./MoveFolder";

export default function MoveFolderItem(props: { data: Folder, MF: MoveFolder }) {
    const { MF, data } = props;

    const isOrigin = MF.UI.state.activeFolder == data.id

    function setFolder() {
        !isOrigin && MF.setFolder(data.id)
    }
    let className = "folder";

    if (MF.state.selected == data.id) className += " Selected";
    if (isOrigin) className += " __originFolder";


    return (
        <div className={className} onClick={setFolder}>
            <Mat>folder</Mat>
            <span>{data.name}</span>
            {(isOrigin) ? (<strong>Carpeta de Origen</strong>) :
                (MF.state.selected == data.id) ? (
                    <Mat>check_circle</Mat>
                ) : (
                    <Mat>radio_button_unchecked</Mat>
                )
            }
        </div>
    )
}