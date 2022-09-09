interface DATABASECONFIG {
    storage: string,
    identifier: string,
    Default: Function | false,
}


class DATABASE {

    readonly storage: string;
    readonly Default: DATABASECONFIG["Default"];
    readonly identifier: string;
    Content: Array<Object>;

    // constructor({ storage = "", identifier = "id", Default  }) {
    constructor(config: DATABASECONFIG) {
        this.storage = config.storage;
        this.Default = config.Default;
        this.identifier = config.identifier;
        this.Content = [];
        this.Load();
    }
    Load() {
        const gettedItem = localStorage.getItem(this.storage)
        if (gettedItem) {
            this.Content = JSON.parse(gettedItem);
        } else {
            if (this.Default != false) {
                this.Content = this.Default();
            }
        }
    }
    Save() {
        localStorage.setItem(this.storage, JSON.stringify(this.Content));
    }
    Add(content: any) {
        this.Load();
        let uuid = `${Date.now()}-${this.Content.length}`;
        content[this.identifier] = `${Date.now()}-${this.Content.length}`;
        this.Content.push(content)
        this.Save();
        return uuid;
    }
    Obtain(id: string) {
        this.Load();
        let find = this.Content.findIndex((e: any) => e[this.identifier] == id);
        if (find != -1) {
            return this.Content[find]
        } else {
            return false;
        }
    }
    Update(id: string, content = {}) {
        this.Load();
        let find = this.Content.findIndex((e: any) => e[this.identifier] == id);
        if (find != -1) {
            this.Content[find] = { ...this.Content[find], ...content }
            this.Save();
        }
    }
    Delete(ok = false) {
        if (ok == true) {
            this.Content = [];
            if (this.Default != false) {
                this.Content = this.Default();
            }
            this.Save()
        }
    }
    Remove(id: string) {
        this.Load();
        let find = this.Content.findIndex((e: any) => e[this.identifier] == id);
        if (find != -1) {
            this.Content.splice(find, 1)
            this.Save();
        } else {
            return false;
        }
    }
    Search(key: string, value: string) {
        this.Load()
        return this.Content.filter((e: any) => e[key] == value);
    }

    get() {
        return this.Content;
    }

    Filter(filterFn: () => void) {
        this.Load()
        return this.Content.filter(filterFn);
    }
}

export default {
    Folders: new DATABASE({
        storage: "Folders",
        identifier: "id",
        Default: () => {
            return [{ name: "Notas", id: "0" }]
        }
    }),
    Notes: new DATABASE({
        storage: "Notes",
        identifier: "id",
        Default: false
    })
}

// export default DB;


// function simulate(create : number) {
//     const themes = ["green", "red", "yellow", "blue"]

//     for (let i = 0; i < create; i++) {
//         const useTheme = themes[Math.floor(Math.random() * themes.length)];

//         const note = DefaultNoteGenerate();

//         note.content = `Note #${i}+ ${crypto.randomUUID()}`
//         note.theme = useTheme;
//         note.content = crypto.randomUUID().repeat(2700)
//         note.position.width = 300;
//         note.position.height = 200;

//         DB.Notes.Add(note);
//         // note.
//     }

//     Application.reloadData();

//     return getStorageBytes();
// }

// function getStorageBytes() {
//     let cached  = ""
//     for (const name in DB) {
//         const database = DB[name];

//         const storage = localStorage.getItem(database.storage);

//         cached += storage;
//     }

//     return (cached.length / 1024 / 1024).toFixed(2) + "MB's";
// }