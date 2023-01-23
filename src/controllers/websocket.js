import { newPlayer, removePlayer, getTurno } from "./database.js";

//
// todos los eventos del socket
//
export const tratamiento_Socket = (io) => {
  io.on("connection", (socket) => {
    // guadamos el jugador. Retorna el número total de jugadores tras inserción
    var numUsers = newPlayer(socket.id);

    // enviamos a todos (incluido yo) el número de conectados
    io.sockets.emit("bomb:users", numUsers);

    // console.log(`nueva conexión ${socket.id} ;usuarios: ${numUsers}`);
    /**
     * Eventos
     */

    // bomb:accion ==>
    socket.on("bomb:accion", ({ senderId, text, time }) => {
      // console.log(`accion de cliente ${senderId} ${time}`);
      // console.log(text);
      socket.broadcast.emit("boom:acc:resto", { dato: text }); // a todos excepto "a mi"
      var turno = getTurno();
      // console.log(`turno: ${turno}`);
    });

    // disconnect ==> se ha desconectado el jugador
    socket.on("disconnect", () => {
      // console.log(`desconectado ${socket.id}`);
      numUsers = removePlayer(socket.id);

      // actualizamos enviando a todos el número de conectados
      io.sockets.emit("bomb:users", numUsers);
    });
  });
};
