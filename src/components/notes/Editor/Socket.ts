import Note from "../../../interfaces/notes";
import Socket, { SendData } from "../../../socket";
import Editor from "./Editor";
import OpenEditor from "./OpenEditor";

export default class EditorSocket {
    invoker: OpenEditor;

    CACHEDOnUpdateReceived?: (data: MessageEvent) => void;

    constructor(Invoker: OpenEditor) {
        this.invoker = Invoker;

        this.onUpdateReceived = this.onUpdateReceived.bind(this);
    }
    /**
     * Empezar a recibir las Actualizaciones externas
     */
    start() {
        this.CACHEDOnUpdateReceived = Socket.on("note-update", this.onUpdateReceived, this.invoker.id);
    }

    onUpdateReceived(message: SendData<Note>) {
        const { invoker } = this;
        const { EditorInstance } = invoker;
        const { data } = message;
        if (EditorInstance) {

            EditorInstance.chachedUpdate = data;
            EditorInstance.setState({
                updateReceived: true,
            })
        }
    }
    /**
     * Send Update to the Socket
     */
    deferUpdate() {
        const { invoker } = this;

        Socket.send({
            data: invoker.data,
            event: "note-update",
            id: invoker.id,
        })
    }

    /**
     * Destruir Todos Los eventos en el Socket
     */
    delete() {
        // console.log("deleting");

        this.CACHEDOnUpdateReceived && Socket.remove(this.CACHEDOnUpdateReceived)
    }

}