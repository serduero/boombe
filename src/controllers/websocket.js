import { newPlayer, removePlayer, getTurno } from "./database.js";

//
// todos los eventos del socket
//
export const tratamiento_Socket = (io) => {
  io.on("connection", (socket) => {
    // console.log(`nueva conexión ${socket.id}`);
    /**
     * Eventos
     */

    // primer evento siempre tras conectarse:
    // recibimos el nickname del nuevo jugador conectado
    socket.on("cli:nick", (nickname) => {
      var numUsers = newPlayer(socket.id, nickname);
      // console.log(
      //   `recibido de ${socket.id} el nick ${nickname} users: ${numUsers}`
      // );

      // si partida ya iniciada no dejamos a más jugadores
      if (numUsers === -1) {
        socket.disconnect(true);
      }

      // enviamos a todos (incluido yo) el número de conectados
      io.sockets.emit("ser:nump", numUsers);
    });

    socket.on("bomb:accion", ({ senderId, text, time }) => {
      // console.log(`accion de cliente ${senderId} ${time}`);
      // console.log(text);
      socket.broadcast.emit("boom:acc:resto", { dato: text }); // a todos excepto "a mi"
      var turno = getTurno();
      // console.log(`turno: ${turno}`);
    });

    // se ha desconectado el jugador, lo quitemos de la lista y
    // actualizamos número de los conectados a todos
    socket.on("disconnect", () => {
      // console.log(`desconectado ${socket.id}`);
      var numUsers = removePlayer(socket.id);

      // actualizamos enviando a todos el número de conectados
      io.sockets.emit("ser:fin", numUsers);
    });
  });
};
