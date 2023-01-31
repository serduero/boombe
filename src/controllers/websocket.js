import {
  newPlayer,
  removePlayer,
  iniciaTurno,
  getTurno,
  iniciaPartidaOk,
  finPartida,
  reset,
} from "./database.js";

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
      //   `cli:nick de ${socket.id} el nick ${nickname} users: ${numUsers}`
      // );

      // si partida ya iniciada no dejamos a más jugadores
      if (numUsers === -1) {
        // console.log(`ser:ful a ${socket.id}`);
        socket.emit("ser:ful", socket.id);
      } else {
        // enviamos a todos (incluido yo) el número de conectados
        // console.log("emite ser:nump");
        io.sockets.emit("ser:nump", numUsers);
      }
    });

    // jugador inicia la partida
    socket.on("cli:ini", ({ senderId, x, y, mapa, timer, time }) => {
      // console.log(`cli:ini ${senderId} ${x} ${y} ${timer}`);

      // control por si varios a la vez inician: sólo uno entra
      if (!iniciaPartidaOk()) {
        return;
      }

      // lo trasladamos a todos (tambien al que envía)
      // e iniciamos el turno
      var nickTurno = iniciaTurno(senderId);
      // console.log(`turno: ${nickTurno}`);

      io.sockets.emit("ser:ini", {
        idTurno: senderId,
        nickTurno: nickTurno,
        x: x,
        y: y,
        timer: timer,
        mapa: mapa,
      });
    });

    // jugador clica una casilla
    socket.on("cli:mov", ({ senderId, x, y, resultado, time }) => {
      // console.log(`cli:mov ${senderId} ${x} ${y} ${resultado} ${time}`);

      // lo trasladamos a todos (tambien al que envía)
      // y continuamos con el siguiente turno
      var nuevo = resultado === "curso" ? 1 : 0;
      var turno = getTurno(nuevo);

      // console.log(`turno: ${turno}`);
      // console.log(turno.id);
      // console.log(turno.nick);

      io.sockets.emit("ser:mov", {
        senderId: senderId,
        idTurno: turno.id,
        nickTurno: turno.nick,
        x: x,
        y: y,
      });

      // si la partida ha finalizado, nos lo guardamos
      if (resultado != "curso") {
        finPartida();
      }
    });

    // se ha desconectado el jugador, reiniciamos
    socket.on("disconnect", () => {
      // console.log(`desconectado ${socket.id}`);
      reset();

      // actualizamos enviando a todos el número de conectados
      io.sockets.emit("ser:fin", 0);
    });
  });
};
