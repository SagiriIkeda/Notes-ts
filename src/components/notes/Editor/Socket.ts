import Note from "../../../interfaces/notes";
import Socket, { SendData } from "../../../socket";
import Editor from "./Editor";
import OpenEditor from "./OpenEditor";

export default class EditorSocket {
    invoker: OpenEditor;

    constructor(Invoker: OpenEditor) {
        this.invoker = Invoker;

        this.onUpdateReceived = this.onUpdateReceived.bind(this);
        this.onDeleteReceived = this.onDeleteReceived.bind(this);
    }
    /**
     * Empezar a recibir las Actualizaciones externas
     */
    start() {
        Socket.on("note-update", this.onUpdateReceived, this.invoker.id);
        Socket.on("note-delete", this.onDeleteReceived, this.invoker.id);
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
    
    onDeleteReceived(message: SendData) {
        const { invoker } = this;

        this.delete();

        invoker.forceClose(true);
    }

    /**
     * Destruir Todos Los eventos en el Socket
     */
    delete() {
        Socket.remove(this.onUpdateReceived);
        Socket.remove(this.onDeleteReceived);

    }

}