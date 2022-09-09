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

    constructor(folder: string) {

        const windowHeight = document.documentElement.scrollHeight;
        const windowWidth = document.documentElement.scrollWidth;

        this.id = "";
        this.content = "Write Here...";
        this.folder = folder;
        this.theme = "dark";
        this.time = Date.now();
        this.title = "Note title";
        this.position = {
            width: 700,
            height: 600,
            left: (windowWidth / 2) - (700 / 2),
            top: (windowHeight / 2.3) - (600 / 2)
        };

        this.v = version;
    }
}