import Note from "./interfaces/notes";

const bc = new BroadcastChannel("Notes");

interface EventType {
    "update-app"?: null,//cuando algo sea actualizado

    "note-update": Note,// cuando una nota sea actualizada, para actualizar otras instancias del editor
    "note-delete": null,// cuando una nota sea borrada, para cerrar otras instancias del editor
    "note-bulk-delete": string[],//ids: cuando varias notas sean borradas (con el SelectMenu) para cerrar otras instancias del Editor

    "folder-delete"?: string,//id:  cuando una carpeta sea borrada, para cerrar instancias de editores de notas en esa carpeta
}


export interface SendData<Type = any, E extends keyof EventType = any> {
    data: Type,
    event: E,
    id?: string,
    by?: string,
}

interface SocketEventFunction extends Function {
    SocketIdentifier?: string;
}

const clientId = crypto.randomUUID ? crypto.randomUUID() : "SocketIdNotSupported-" + Date.now();

class Socket {
    static clientId = clientId;

    static EventFunctions = new Map<string, (data: SendData) => void>()

    static send<T extends keyof EventType>(data: SendData<EventType[T], T>) {
        data.by = clientId;
        bc.postMessage(data)
    }

    static on<E extends keyof EventType>(event: E, fn: (data: SendData<EventType[E], E>) => void, id?: string) {
        const identifier = event + (id ? `+${id}` : "");
        const reference = fn as SocketEventFunction;

        reference.SocketIdentifier = identifier;

        this.EventFunctions.set(identifier, fn);
    }

    static remove(ref: Function) {
        const reference = ref as SocketEventFunction;
        const { SocketIdentifier } = reference;

        if (SocketIdentifier) {
            this.EventFunctions.delete(SocketIdentifier);

            delete reference.SocketIdentifier;
        }
    }
}

bc.onmessage = (message: MessageEvent<SendData>) => {
    const { data } = message;
    if (data.by != clientId) {
        const id = data.event + (data.id ? `+${data.id}` : "");
        const getFunction = Socket.EventFunctions.get(id);
        if (getFunction) {
            getFunction(message.data);
        }

    }
}




export default Socket;