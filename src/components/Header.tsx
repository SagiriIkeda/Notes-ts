import React, { createRef } from "react";
import DB from "../db/database";
import Folder from "../interfaces/folder";
import { Mat } from "./prefabs";
import UINOTES from "./UI";


interface HeaderProps {
    UI: UINOTES
}

interface HeaderState {
    folderSectionVisible: boolean;
}

export class Header extends React.Component<HeaderProps, HeaderState> {
    UI: UINOTES;

    public state: HeaderState;

    container = createRef<HTMLDivElement>()

    constructor(props: HeaderProps) {
        super(props)
        this.UI = props.UI;

        this.state = {
            folderSectionVisible: false,
        }

        this.UI.HEADER = this;

        this.toggleFoldersSection = this.toggleFoldersSection.bind(this);

    }

    toggleFoldersSection(type?: React.MouseEvent | boolean) {
        const { folderSectionVisible } = this.state;
        // console.log(type);
        
        this.setState({
            folderSectionVisible: (typeof type == "boolean") ? type : !folderSectionVisible
            // folderSectionVisible: !folderSectionVisible
        })
    }


    render() {
        const { state } = this.UI;

        const currentFolder = (DB.Folders.get(state.activeFolder) as Folder)?.name;

        return (
            <div className="ui-header" data-folder={this.state.folderSectionVisible} ref={this.container}  >
                <Mat className="FolderBtn" onClick={this.toggleFoldersSection}  >folder</Mat>
                <div className="current-folder-name">{currentFolder}</div>
                <Mat className="UserBtn" >add</Mat>
            </div>
        );
    }
}