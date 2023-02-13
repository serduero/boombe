import {
  newPlayer,
  iniciaTurno,
  getTurno,
  iniciaPartidaOk,
  finPartida,
  reset,
  enPartida,
  getRoom,
} from "./database.js";

//
// todos los eventos del socket
//
export const tratamiento_Socket = (io) => {
  io.on("connection", (socket) => {
    console.log(`nueva conexión ${socket.id}`);
    /**
     * Eventos
     */

    // primer evento siempre tras conectarse:
    // recibimos el nickname del nuevo jugador conectado
    socket.on("cli:nick", (nickname) => {
      // entro en una sala (o la creo si soy el primero de una sin empezar)
      var { salaAsignada, numUsr } = newPlayer(socket.id, nickname);

      // obtengo cuántos somos en la sala
      console.log(
        `cli:nick ${socket.id} nick:${nickname} users:${numUsr} sala asignada:${salaAsignada}`
      );

      // me uno a esa sala
      console.log(`me uno a la sala ${salaAsignada}`);
      socket.join(salaAsignada);

      console.log(`emite ser:nump ${numUsr} a la sala ${salaAsignada}`);
      // enviamos a todos (incluido yo) el número de conectados
      io.to(salaAsignada).emit("ser:nump", numUsr);
    });

    // jugador inicia la partida
    socket.on("cli:ini", ({ senderId, x, y, mapa, timer, help }) => {
      console.log(`cli:ini ${senderId} ${x} ${y} ${timer} ${help}`);

      // control por si varios a la vez inician: sólo uno hace "ser:ini" a todos
      if (!iniciaPartidaOk(senderId)) {
        return;
      }

      // lo trasladamos a todos (tambien al que envía)
      // e iniciamos el turno
      var { nick, sala } = iniciaTurno(senderId);
      console.log(`emitimos a sala ${sala} que le toca a ${nick}`);

      io.to(sala).emit("ser:ini", {
        idTurno: senderId,
        nickTurno: nick,
        x: x,
        y: y,
        timer: timer,
        help: help,
        mapa: mapa,
      });
    });

    // jugador clica una casilla
    socket.on("cli:mov", ({ senderId, x, y, resultado, time }) => {
      console.log(`cli:mov ${senderId} ${x} ${y} ${resultado} ${time}`);

      // lo trasladamos a todos (tambien al que envía)
      // y continuamos con el siguiente turno
      var nuevo = resultado === "curso" ? 1 : 0;
      var turno = getTurno(senderId, nuevo);

      // console.log(`envía turno:`);
      // console.log(turno.id);
      // console.log(turno.nick);
      // console.log(turno.room);

      io.to(turno.room).emit("ser:mov", {
        senderId: senderId,
        idTurno: turno.id,
        nickTurno: turno.nick,
        x: x,
        y: y,
        resultado: resultado,
      });

      // si la partida ha finalizado, nos lo guardamos
      if (resultado != "curso") {
        finPartida(senderId);
      }
    });

    // jugador/es ganan por lo que el que movió pierde
    socket.on("cli:win", ({ senderId, time }) => {
      console.log(`cli:win ${senderId}`);

      const sala = getRoom(senderId);
      // a todos, yo incluido, quien ha ganado
      io.to(sala).emit("ser:win", {
        senderId: senderId,
      });

      // siempre finaliza partida
      finPartida(senderId);
    });

    // envía un mensaje al resto de la sala
    socket.on("cli:msg", ({ senderId, nick, msg }) => {
      const sala = getRoom(senderId);
      console.log(`cli:msg ${senderId} ${nick} ${msg} sala: ${sala}`);

      socket.broadcast.to(sala).emit("ser:msg", {
        senderId: senderId,
        nick: nick,
        msg: msg,
      });
    });

    // se ha desconectado un jugador
    socket.on("disconnect", () => {
      console.log(`desconectado ${socket.id}`);

      // si es uno de la partida reiniciamos toda la sala
      if (enPartida(socket.id)) {
        const sala = reset(socket.id);

        console.log(`tras reset, sala: ${sala}`);

        // actualizamos enviando a todos el número de conectados
        io.to(sala).emit("ser:fin", 0);
      }
    });
  });
};

/*
// sending to sender-client only
socket.emit('message', "this is a test");

// sending to all clients, include sender
io.emit('message', "this is a test");

// sending to all clients except sender
socket.broadcast.emit('message', "this is a test");

// sending to all clients in 'game' room(channel) except sender
socket.broadcast.to('game').emit('message', 'nice game');

// sending to all clients in 'game' room(channel), include sender
io.in('game').emit('message', 'cool game');

// sending to sender client, only if they are in 'game' room(channel)
socket.to('game').emit('message', 'enjoy the game');

// sending to all clients in namespace 'myNamespace', include sender
io.of('myNamespace').emit('message', 'gg');

// sending to individual socketid
socket.broadcast.to(socketid).emit('message', 'for your eyes only');

// list socketid
for (var socketid in io.sockets.sockets) {}
 OR
Object.keys(io.sockets.sockets).forEach((socketid) => {});
*/
