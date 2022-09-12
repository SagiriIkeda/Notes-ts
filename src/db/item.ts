interface ITEMDATABASECONFIG<T> {
    storage: string;
    default: T | (() => T);
}

export default class ITEMDATABASE<Type>{
    private default:  (() => Type) | Type;
    private storage: string;
    private content: Type;

    constructor(config : ITEMDATABASECONFIG<Type>) {

        this.default = config.default;
        this.storage = config.storage;

        this.content = this.load();

    }

    load() {
   
        const gettedItem = localStorage.getItem(this.storage);

        const defaultValue= (upsert = true) =>{
            const defaultv = (this.default instanceof Function) ? this.default() : this.default;


            if (upsert && this.default != undefined) {
                this.content = defaultv;
            }
            return defaultv;
        }

        if (gettedItem) {

            try {
                const result = JSON.parse(gettedItem);
                const getTypeofDefault = typeof (defaultValue(false));
                if(typeof result != getTypeofDefault) {
                    throw `FORCE-RESET DATABASE ${this.storage} INVALID TYPE`;
                }

                this.content = result;
            } catch (error) {
                console.error(error);
                defaultValue();
            }

        } else {
            defaultValue()
        }
        return this.content;
    }

    set(content: Type) {
        localStorage.setItem(this.storage,JSON.stringify(content))
        this.load()
    }
    get() {
        this.load();

        return this.content;
    }

    

}