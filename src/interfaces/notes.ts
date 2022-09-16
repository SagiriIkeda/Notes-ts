import { version } from "./config"

export type Themes = "dark" | "red" | "blue" | "yellow" | "green";

export default interface Note {
    id: string,
    content: string,
    folder: string,
    theme: Themes,
    time: number,
    title: string,
    position: {
        width: number,
        height: number,
        left: number,
        top: number
    },
    v: string,
}

export class NoteBuilder implements Note {
    id: string;
    content: string;
    folder: string;
    theme: Themes;
    time: number;
    title: string;
    position: { width: number; height: number; left: number; top: number; };
    v: string;

    constructor(folder: string, from?: Partial<Note>) {

        const windowHeight = document.documentElement.scrollHeight;
        const windowWidth = document.documentElement.scrollWidth;

        this.id = from?.id || "";
        this.content = from?.content || "Write Here...";
        this.folder = from?.folder || folder;
        this.theme = from?.theme || "dark";
        this.time = from?.time || Date.now();
        this.title = from?.title || "Note title";
        this.position = {
            width: from?.position?.width || 700,
            height: from?.position?.height || 600,
            left: from?.position?.left || (windowWidth / 2) - (700 / 2),
            top: from?.position?.top || (windowHeight / 2.3) - (600 / 2)
        };

        this.v = version;
    }
}