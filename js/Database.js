class DATABASE {
    constructor({ storage = "", identifier = "id", Default }) {
        this.storage = storage;
        this.Default = Default;
        this.identifier = identifier;
        this.Content = [];
        this.Load();
    }
    Load() {
        if (localStorage.getItem(this.storage)) {
            this.Content = JSON.parse(localStorage.getItem(this.storage));
        } else {
            if (this.Default != false) {
                this.Content = this.Default();
            }
        }
    }
    Save() {
        localStorage.setItem(this.storage, JSON.stringify(this.Content));
    }
    Add(content) {
        // try {
            this.Load();
            let uuid = `${Date.now()}-${this.Content.length}`;
            content[this.identifier] = `${Date.now()}-${this.Content.length}`;
            this.Content.push(content)
            this.Save();
            return uuid;

        // }catch()
    }
    Obtain(id) {
        this.Load();
        let find = this.Content.findIndex(e => e[this.identifier] == id);
        if (find != -1) {
            return this.Content[find]
        } else {
            return false;
        }
    }
    Update(id, content = {}) {
        this.Load();
        let find = this.Content.findIndex(e => e[this.identifier] == id);
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
    Remove(id) {
        this.Load();
        let find = this.Content.findIndex(e => e[this.identifier] == id);
        if (find != -1) {
            this.Content.splice(find, 1)
            this.Save();
        } else {
            return false;
        }
    }
    Search(key, value) {
        this.Load()
        return this.Content.filter(e => e[key] == value);
    }
}

const DB = {
    Folders: new DATABASE({
        storage: "Folders",
        identifier: "id",
        Default: e => {
            return [{ name: "Notas", id: "0" }]
        }
    }),
    Notes: new DATABASE({
        storage: "Notes",
        identifier: "id",
        Default: false
    })
}


function simulate(create) {
    const themes = ["green", "red", "yellow", "blue"]

    for (let i = 0; i < create; i++) {
        const useTheme = themes[Math.floor(Math.random() * themes.length)];

        const note = DefaultNoteGenerate();

        note.content = `Note #${i}+ ${crypto.randomUUID()}`
        note.theme = useTheme;
        note.content = crypto.randomUUID().repeat(2700)
        note.position.width = 300;
        note.position.height = 200;

        DB.Notes.Add(note);
        // note.
    }

    Application.reloadData();

    return getStorageBytes();
}

function getStorageBytes() {
    let cached  = ""
    for (const name in DB) {
        const database = DB[name];

        const storage = localStorage.getItem(database.storage);

        cached += storage;
    }

    return (cached.length / 1024 / 1024).toFixed(2) + "MB's";
}