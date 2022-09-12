import Note from "../interfaces/notes";
import Folder from "../interfaces/folder";
import ARRAYDATABASE from "./array";
import ITEMDATABASE from "./item";

export const Folders = new ARRAYDATABASE<Folder>({
    storage: "Folders",
    identifier: "id",
    default: () => {
        return [{ name: "Notas", id: "0" }]
    }
});
export const Notes = new ARRAYDATABASE<Note>({
    storage: "Notes",
    identifier: "id",
    default: false
});

export const AutoUP = new ITEMDATABASE<boolean>({
    storage: "AutoUP",
    default: true
});

const DB = { Folders, Notes }

export default DB;