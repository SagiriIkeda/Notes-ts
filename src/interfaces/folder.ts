export default interface Folder {
    id: string,
    name: string,
    order: number,
   
}

export class FolderBuilder implements Folder {
    id: string;
    name: string;
    order: number;
    

    constructor(data: Folder) {
        this.id = data.id;
        this.name = data.name;
        this.order = data.order ?? 0;
    }
}