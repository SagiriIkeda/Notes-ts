import React from "react";
import { EDITORCONFIG } from "../../../interfaces/config";
import Editor from "./Editor";

interface EditorMovementProperties {
    Editor: Editor;
}

export default class EditorMovement {
    Editor: Editor;
    windowEditor: Editor["editor_window"];

    left = 0;
    top = 0;
    clientX = 0;
    clientY = 0;
    
    constructor({ Editor }: EditorMovementProperties) {
        this.Editor = Editor;
        this.windowEditor = Editor.editor_window;
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

            this.clientX = e.clientX;
            this.clientY = e.clientY;

            Editor.invoker.setTopZIndex();

            const pagewidth = document.documentElement.offsetWidth;
            const pageheight = document.documentElement.offsetHeight;

            const StartDrag = (e: MouseEvent) => {
                e.preventDefault();
                this.left = this.clientX - e.clientX;
                this.top = this.clientY - e.clientY;
                this.clientX = e.clientX;
                this.clientY = e.clientY;

                let PositionY = windowEditor.offsetTop - this.top;
                let PositionX = windowEditor.offsetLeft - this.left;

                let width = windowEditor.getBoundingClientRect().width;
                let height = windowEditor.getBoundingClientRect().height;
                if (PositionY + height > pageheight) PositionY = pageheight - height;
                if (PositionY < 0) PositionY = 0;
                if (PositionX + width > pagewidth) PositionX = pagewidth - width;
                if (PositionX < 0) PositionX = 0;

                position.left = PositionX;
                position.top = PositionY;

                windowEditor.style.top = `${PositionY}px`;
                windowEditor.style.left = `${PositionX}px`;

            }

            function closeDragElement(e: MouseEvent) {
                Editor.SavePosition()
                document.removeEventListener('mouseup', closeDragElement)
                document.removeEventListener('mousemove', StartDrag)
            }
            document.addEventListener('mouseup', closeDragElement)
            document.addEventListener('mousemove', StartDrag)
        }
    }

    ResizeWindow(e: React.MouseEvent) {
        const { Editor } = this;
        const { position } = Editor.data;

        const windowEditor = this.windowEditor.current;

        if (!windowEditor) return;

        e.preventDefault();

        const maxscreenw = document.documentElement.offsetWidth;
        const maxscreenh = document.documentElement.offsetHeight;

        const ResizeWindow = (e: MouseEvent) => {
            const ny = e.clientY;
            const nx = e.clientX;
            const rect = windowEditor.getBoundingClientRect();
            const wetop = rect.top;
            const weleft = rect.left;
            const top = rect.top;
            const left = rect.left;

            let width = nx - weleft;
            let height = ny - wetop;

            if (height < EDITORCONFIG.MIN_HEIGHT) height = EDITORCONFIG.MIN_HEIGHT;
            if (width < EDITORCONFIG.MIN_WIDTH) width = EDITORCONFIG.MIN_WIDTH;

            position.width = width;
            position.height = height;
            
            windowEditor.style.maxHeight = `${maxscreenh - top}px`;
            windowEditor.style.maxWidth = `${maxscreenw - left}px`;
            windowEditor.style.height = `${height}px`;
            windowEditor.style.width = `${width}px`;
            Editor.MaxCampHeight();
        }
        
        document.addEventListener('mouseup', CancelResize)
        document.addEventListener('mousemove', ResizeWindow)
        
        function CancelResize() {
            Editor.SavePosition();
            Editor.MaxCampHeight();
            document.removeEventListener('mousemove', CancelResize)
            document.removeEventListener('mousemove', ResizeWindow)
        }
    }
}