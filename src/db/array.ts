interface DATABASECONFIG {
    storage: string,
    identifier: string,
    default: Function | false,
}


export default class ARRAYDATABASE<Type> implements DATABASECONFIG {

    readonly storage: string;
    readonly default: DATABASECONFIG["default"];
    readonly identifier: string;
    private content: Type[];

    constructor(config: DATABASECONFIG) {
        this.storage = config.storage;
        this.default = config.default;
        this.identifier = config.identifier;
        this.content = [];
        this.Load();
    }
    Load() {
        const gettedItem = localStorage.getItem(this.storage);
        const setDefaultValue = () => {
            if (this.default instanceof Function) {
                this.content = this.default();
            }
        }

        if (gettedItem) {
            try {
                const result = JSON.parse(gettedItem);
                if (!Array.isArray(result)) {
                    throw `FORCE-RESET DATABASE ${this.storage} INVALID ARRAY`;
                }

                this.content = result;
            } catch (error) {
                console.error(error);
                setDefaultValue()
            }
        } else {
            setDefaultValue()
        }
    }
    Save() {
        localStorage.setItem(this.storage, JSON.stringify(this.content));
    }
    Add(content: Type): string {
        this.Load();
        let uuid = `${Date.now()}-${this.content.length}`;
        (content as any)[this.identifier] = uuid;
        this.content.push(content)
        this.Save();
        return uuid;
    }

    get(id: string): Type | undefined {
        this.Load();
        return this.content.find((e: any) => e[this.identifier] == id);
    }

    Update(id: string, content: Partial<Type> = {}) {
        this.Load();
        let find = this.content.findIndex((e: any) => e[this.identifier] == id);
        if (find != -1) {
            this.content[find] = { ...this.content[find], ...content }
            this.Save();
        }
    }
    Delete(ok = false) {
        if (ok == true) {
            this.content = [];
            if (this.default != false) {
                this.content = this.default();
            }
            this.Save()
        }
    }
    Remove(id: string) {
        this.Load();
        let find = this.content.findIndex((e: any) => e[this.identifier] == id);
        if (find != -1) {
            this.content.splice(find, 1)
            this.Save();
        } else {
            return false;
        }
    }
    Search(key: string, value: string) {
        this.Load()
        return this.content.filter((e: any) => e[key] == value);
    }

    getAll() {
        return this.content;
    }

    Filter(filterFn: (item: Type) => void) {
        this.Load()
        return this.content.filter(filterFn);
    }
}