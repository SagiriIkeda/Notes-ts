import React from "react";
import { EDITORCONFIG } from "../../../interfaces/config";
import Editor from "./Editor";

interface EditorMovementProperties {
    Editor: Editor;
}

// const MIN_WIDTH = 360;
// const MIN_HEIGHT = 272;

export default class EditorMovement {
    Editor: Editor;
    windowEditor: Editor["windowEditor"];

    left = 0;
    top = 0;
    clientX = 0;
    clientY = 0;
    
    constructor({ Editor }: EditorMovementProperties) {
        this.Editor = Editor;
        this.windowEditor = Editor.windowEditor;
        this.DragWindow = this.DragWindow.bind(this);
        this.ResizeWindow = this.ResizeWindow.bind(this);
    }


    DragWindow(e: React.MouseEvent) {
        const { Editor } = this;
        const { position } = Editor.data;
        
        const windowEditor = this.windowEditor.current;

        if (!windowEditor) return;

        const target = e.target as HTMLDivElement;

        if (target.classList[0] != "wbtn") {

            e.preventDefault();
            // setIndex();
            this.clientX = e.clientX;
            this.clientY = e.clientY;

            Editor.invoker.setTopZIndex();

            const elementDrag = (e: MouseEvent) => {
                e.preventDefault();
                this.left = this.clientX - e.clientX;
                this.top = this.clientY - e.clientY;
                this.clientX = e.clientX;
                this.clientY = e.clientY;

                let dy = windowEditor.offsetTop - this.top;
                let dx = windowEditor.offsetLeft - this.left;

                let pagewidth = document.documentElement.scrollWidth;
                let pageheight = document.documentElement.scrollHeight - 123;

                let width = windowEditor.getBoundingClientRect().width;
                let height = windowEditor.getBoundingClientRect().height;
                if (dy + height > pageheight) dy = pageheight - height;
                if (dy < 0) dy = 0;
                if (dx + width > pagewidth) dx = pagewidth - width;
                if (dx < 0) dx = 0;

                position.left = dx;
                position.top = dy;

                windowEditor.style.top = `${dy}px`;
                windowEditor.style.left = `${dx}px`;

                Editor.SavePosition()
            }

            function closeDragElement(e: MouseEvent) {
                document.removeEventListener('mouseup', closeDragElement)
                document.removeEventListener('mousemove', elementDrag)
            }
            document.addEventListener('mouseup', closeDragElement)
            document.addEventListener('mousemove', elementDrag)
        }
    }

    ResizeWindow(e: React.MouseEvent) {
        const { Editor } = this;
        const { position } = Editor.data;

        const windowEditor = this.windowEditor.current;

        if (!windowEditor) return;

        e.preventDefault();

        let maxscreenw = document.documentElement.scrollWidth;
        let maxscreenh = document.documentElement.scrollHeight;

        const changet = (e: MouseEvent) => {
            let ny = e.clientY;
            let nx = e.clientX;
            let rect = windowEditor.getBoundingClientRect();
            let wetop = rect.top;
            let weleft = rect.left;
            let width = nx - weleft;
            let height = ny - wetop;
            let top = rect.top;
            let left = rect.left;

            if (height < EDITORCONFIG.MIN_HEIGHT) height = EDITORCONFIG.MIN_HEIGHT;
            if (width < EDITORCONFIG.MIN_WIDTH) width = EDITORCONFIG.MIN_WIDTH;

            position.width = width;
            position.height = height;
            
            windowEditor.style.maxHeight = `${maxscreenh - top}px`;
            windowEditor.style.maxWidth = `${maxscreenw - left}px`;
            windowEditor.style.height = `${height}px`;
            windowEditor.style.width = `${width}px`;
            Editor.SavePosition();
            Editor.MaxCampHeight();

        }

        document.addEventListener('mouseup', up)
        document.addEventListener('mousemove', changet)
        function up() {
            Editor.MaxCampHeight();
            document.removeEventListener('mousemove', up)
            document.removeEventListener('mousemove', changet)
        }
    }
}