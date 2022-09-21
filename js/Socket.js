const ApplicationSocketID = crypto.randomUUID();

const sock = {
    codify(obj) {
        return JSON.stringify(obj)
    },
    decode(text) {
        return JSON.parse(text);
    }
}

// Crea una nueva conexión.
let socket = new WebSocket("ws://localhost:8080");

socket.addEventListener('open', (e) => {
  alert("[open] Conexión establecida");
  socket.send("Mi nombre es John");
});

socket.onmessage = function(event) {
  alert(`[message] Datos recibidos del servidor: ${event.data}`);
};

socket.onclose = function(event) {
  if (event.wasClean) {
    alert(`[close] Conexión cerrada limpiamente, código=${event.code} motivo=${event.reason}`);
  } else {
    // ej. El proceso del servidor se detuvo o la red está caída
    // event.code es usualmente 1006 en este caso
    alert('[close] La conexión se cayó');
  }
};

socket.onerror = function(error) {
  alert(`[error] ${error.message}`);
};