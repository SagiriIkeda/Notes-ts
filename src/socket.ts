const bc = new BroadcastChannel("Notes");

/**
 * Por agregar "note-delete" "folder-delete"
 */
type Events = "update-app" | "note-update" | "note-delete" | "folder-delete" ;

export interface SendData<Type = any> {
    data: Type,
    event: Events,
    id?: string,
    by?: string,
}

const clientId = crypto.randomUUID();

class Socket {
    static clientId = clientId;

    static send<Type>(data: SendData<Type>) {
        data.by = clientId;
        bc.postMessage(data)
    }

    static on(event: Events, fn: (data: SendData) => void, id?: string) {

        function socketFn(message: MessageEvent<SendData<any>>) {
            if (message.data.by != clientId) {
                if (message.data.event == event) {
                    if (id === message.data.id) {
                        return fn(message.data);
                    }
                    fn(message.data);
                }
            }
        }

        bc.addEventListener("message", socketFn)

        return socketFn;
    }

    static remove(ref: (data: MessageEvent) => void) {
        bc.removeEventListener("message", ref);
    }
}



export default Socket;