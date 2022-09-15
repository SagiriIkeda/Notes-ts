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
        this.load();
    }
    load() {
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
    save() {
        localStorage.setItem(this.storage, JSON.stringify(this.content));
    }
    add(content: Type): string {
        this.load();
        let uuid = `${Date.now()}-${this.content.length}`;
        (content as any)[this.identifier] = uuid;
        this.content.push(content)
        this.save();
        return uuid;
    }

    get(id: string): Type | undefined {
        this.load();
        return this.content.find((e: any) => e[this.identifier] == id);
    }

    update(id: string, content: Partial<Type> = {}) {
        this.load();
        let find = this.content.findIndex((e: any) => e[this.identifier] == id);
        if (find != -1) {
            this.content[find] = { ...this.content[find], ...content }
            this.save();
        }
    }
    delete(ok = false) {
        if (ok == true) {
            this.content = [];
            if (this.default != false) {
                this.content = this.default();
            }
            this.save()
        }
    }
    remove(id: string) {
        this.load();
        let find = this.content.findIndex((e: any) => e[this.identifier] == id);
        if (find != -1) {
            this.content.splice(find, 1)
            this.save();
        } else {
            return false;
        }
    }
    search(key: string, value: string) {
        this.load()
        return this.content.filter((e: any) => e[key] == value);
    }

    getAll() {
        // this.Load();
        return this.content;
    }

    filter(filterFn: (item: Type) => void) {
        this.load()
        return this.content.filter(filterFn);
    }
}