import Note from "../interfaces/notes";
import Folder from "../interfaces/folder";
import ARRAYDATABASE from "./array";
import ITEMDATABASE from "./item";
import { FOLDERSCONFIG } from "../interfaces/config";

export const Folders = new ARRAYDATABASE<Folder>({
    storage: "Folders",
    identifier: "id",
    default: () => {
        return [{ name: FOLDERSCONFIG.DEFAULT_NAME, id: FOLDERSCONFIG.DEFAULT_ID }]
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
export const ActiveFolder = new ITEMDATABASE<string>({
    storage: "ActiveFolder",
    default: FOLDERSCONFIG.DEFAULT_ID
});

const DB = {
    Folders,
    Notes,
    AutoUP,
    ActiveFolder,

    loadAll() {
        for (const [name,db] of Object.entries(this)) {
            if(name != "loadAll") {
                (db as ITEMDATABASE<any>)?.load()
            }
        }
    }
}

export default DB;