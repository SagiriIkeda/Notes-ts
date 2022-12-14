import React from "react";
import Editor from "./Editor";

interface EditorSelectionProperties {
    Editor: Editor;
}

export default class EditorSelection {
    Editor: Editor;

    timetorange = 0;

    constructor({ Editor }: EditorSelectionProperties) {
        this.Editor = Editor;

        this.SelectionChange = this.SelectionChange.bind(this);
        this.getSelectionHtml = this.getSelectionHtml.bind(this);
        this.preventPasteHTML = this.preventPasteHTML.bind(this);
    }

    SelectionChange(e: any) {
        const { Editor } = this;
        const InputCamp = Editor.content_editable_input.current;

        const self = this;

        if (InputCamp) {
            if (e.path[0].activeElement == InputCamp) {
                clearInterval(this.timetorange);
            
                const range = document.getSelection()?.toString() as string;
                //estilizar los botones
                function IdentifyProperties() {
                    const html = self.getSelectionHtml();
                    const selection = document.getSelection();
                    const parenttag = selection?.anchorNode?.parentElement?.tagName;

                    const cachedTextures = {
                        italic: false,
                        bold: false,
                        underline: false,
                    }

                    cachedTextures.italic = (html.search(/<i>.*?<\/i>/) != -1 || parenttag == "I")
                    cachedTextures.underline = (html.search(/<u>.*?<\/u>/) != -1 || parenttag == "U");
                    cachedTextures.bold = (html.search(/<b>.*?<\/b>/) != -1 || parenttag == "B");

                    if (parenttag == "B" || parenttag == "I" || parenttag == "U") {
                        const ActualRange = document.getSelection();
                        if (ActualRange) {
                            let actualparent = ActualRange?.anchorNode?.parentElement;

                            if (actualparent) {
                                let array: string[] = [];
                                let tag = actualparent.tagName;
                                array.push(tag)
                                const superiorTag = actualparent?.parentElement?.tagName;

                                if (superiorTag && superiorTag != "DIV") {
                                    array.push(superiorTag);

                                    const superiorTag2 = actualparent?.parentElement?.parentElement?.tagName

                                    if (superiorTag2 && superiorTag2 != "DIV") {
                                        array.push(superiorTag2)
                                    }
                                }

                                if (array.includes("I")) {
                                    cachedTextures.italic = true;
                                }
                                if (array.includes("U")) {
                                    cachedTextures.underline = true;
                                }
                                if (array.includes("B")) {
                                    cachedTextures.bold = true;
                                }

                            }
                        }
                    }
                    Editor.setState(cachedTextures)

                }
                //abrir y cerrar el menu de textura
                if (range.length != 0) {
                    let ms = 0;
                    this.timetorange = setInterval(() => {
                        ms++;
                        if (ms >= 100) {
                            clearInterval(this.timetorange);
                            Editor.setState({
                                texturize: true
                            })
                            ms = 0;
                        }
                    }, 1);

                } else {
                    Editor.setState({
                        texturize: false,
                    })
                }
                IdentifyProperties();
            }

        }
    }

    getSelectionHtml() {
        let html = "";
        let selection = window.getSelection();

        if (selection && selection.rangeCount) {
            let container = document.createElement("div");

            for (let i = 0, length = selection.rangeCount; i < length; ++i) {
                container.appendChild(selection.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }

        // if (window.getSelection) {
        // } 

        // else if (typeof document.selection != "undefined") {
        //     if (document.selection.type == "Text") {
        //         html = document.selection.createRange().htmlText;
        //     }
        // }
        return html;
    }

    preventPasteHTML(e: React.ClipboardEvent) {
        e.preventDefault();
        let text = e.clipboardData.getData("text/plain");
        document.execCommand('insertText', false, text);
    }
}