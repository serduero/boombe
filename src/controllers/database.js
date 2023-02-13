import { makeRoom } from "../helps/functions.js";

// vector de objetos "room", "id" y "nick" de cada jugador (todos String)
var master = [];

// el index del turno que le toca en una determinada sala: "room" (String) y "num" (int)
var turno = [];

// si partida de una sala en curso o no: "room" (String) y "enCurso" (bool)
var partida_enCurso = [];

// nuevo jugador a la lista
function newPlayer(id, nickname) {
  var salaAsignada = "";
  // console.log(`new player ${id}  ${nickname}`);

  // miramos si hay una sala abierta pendiente de que entren jugadores
  var idSala = partida_enCurso.findIndex((el) => el.enCurso === false);

  if (idSala == -1) {
    // si no existe ninguna, la crearemos ahora

    // sala aleatoria
    const sala = makeRoom(10);

    master.push({ room: sala, id: id, nick: nickname });
    partida_enCurso.push({ room: sala, enCurso: false });
    turno.push({ room: sala, num: 0 });

    salaAsignada = sala;
  } else {
    // si ya existe una pendiente de iniciar, asignamos esa
    salaAsignada = partida_enCurso[idSala].room;
    master.push({ room: salaAsignada, id: id, nick: nickname });
  }

  // console.log("master:");
  // console.log(JSON.stringify(master, null, 4));
  // console.log("en curso:");
  // console.log(JSON.stringify(partida_enCurso, null, 4));
  // console.log("turno:");
  // console.log(JSON.stringify(turno, null, 4));

  var numUsr = numUsers(salaAsignada);

  return { salaAsignada: salaAsignada, numUsr: numUsr };
}

// Numero de jugadores en una sala
function numUsers(room) {
  return master.filter((el) => el.room == room).length;
}

// Inicia la partida, si procede y asigna el primer turno
function iniciaPartidaOk(senderId) {
  // console.log(`inicia partida ${senderId}`);
  const sala = getRoom(senderId);
  const indexSala = partida_enCurso.findIndex((el) => el.room === sala);

  var ret = false;

  if (!partida_enCurso[indexSala].enCurso) {
    partida_enCurso[indexSala].enCurso = true;
    ret = true;
  }

  // console.log(JSON.stringify(partida_enCurso, null, 4));
  // console.log(`retorno: ${ret}`);
  return ret;
}

// inicializa el turno con el id entrado y retorna el nickname
function iniciaTurno(senderId) {
  // console.log(`inicia turno ${senderId}`);
  const sala = getRoom(senderId);
  var subVectorSala = master.filter((el) => el.room == sala);
  // console.log(JSON.stringify(subVectorSala, null, 4));

  var indexTurno = subVectorSala.findIndex((el) => el.id === senderId);
  // console.log(`turno: ${indexTurno}  nick: ${subVectorSala[indexTurno].nick}`);

  // nos guardamos ese turno
  const indTurno = turno.findIndex((el) => el.room === sala);
  turno[indTurno].num = indexTurno;

  // console.log(
  //   `nos guardamos el turno (index subvector): ${turno[indTurno].num}`
  // );

  return { nick: subVectorSala[indexTurno].nick, sala: sala };
}

// retorna el id del turno actual
function getTurno(senderId, suma) {
  // obtenemos la sala del jugador
  // console.log(`get turno ${senderId} ${suma}`);
  const sala = getRoom(senderId);

  // después los jugadores de esa sala
  var subVectorSala = master.filter((el) => el.room == sala);
  // console.log("subvector:");
  // console.log(JSON.stringify(subVectorSala, null, 4));

  // console.log("turno:");
  // console.log(JSON.stringify(turno, null, 4));

  // buscamosa el turno de esta sala
  var indexSala = turno.findIndex((el) => el.room === sala);
  // console.log(`indice sala ${indexSala}`);

  // el turno será el siguiente al actual
  turno[indexSala].num += suma;
  if (turno[indexSala].num >= subVectorSala.length) {
    turno[indexSala].num = 0;
  }

  // console.log(`turno ${turno[indexSala].num}, elemento:`);
  // console.log(JSON.stringify(subVectorSala[turno[indexSala].num], null, 4));

  const elem = subVectorSala[turno[indexSala].num];

  return elem;
}

// Finaliza partida
function finPartida(id) {
  // console.log(`fin partida ${id}`);

  // obtenemos la sala del jugador
  const sala = getRoom(id);

  // buscamosa el elemento de partida en curso de esa sala
  var indexSala = partida_enCurso.findIndex((el) => el.room === sala);

  partida_enCurso[indexSala].enCurso = false;
}

// Reset total
function reset(id) {
  // console.log(`reset total de ${id}`);

  const sala = getRoom(id);

  function arrayRemove(arr, value) {
    return arr.filter(function (ele) {
      return ele.room != value;
    });
  }

  partida_enCurso = arrayRemove(partida_enCurso, sala);
  master = arrayRemove(master, sala);
  turno = arrayRemove(turno, sala);

  // console.log("master:");
  // console.log(JSON.stringify(master, null, 4));
  // console.log("en curso:");
  // console.log(JSON.stringify(partida_enCurso, null, 4));
  // console.log("turno:");
  // console.log(JSON.stringify(turno, null, 4));

  return sala;
}

// obtenermos la sala de un jugador
function getRoom(id) {
  var indexJugadorEnmaster = master.findIndex((el) => el.id === id);
  return master[indexJugadorEnmaster].room;
}

// retorna si está o no en la partida este Id
function enPartida(elemId) {
  const elem = master.findIndex((el) => el.id === elemId);

  return elem !== -1;
}

// un jugador menos a la lista
function removePlayer(id) {
  function arrayRemove(arr, value) {
    return arr.filter(function (ele) {
      return ele.id != value;
    });
  }
  master = arrayRemove(master, id);

  // TODO: guardar en BBDDs el master de la partida
  return master.length;
}

export {
  removePlayer,
  newPlayer,
  iniciaTurno,
  getTurno,
  iniciaPartidaOk,
  finPartida,
  reset,
  enPartida,
  getRoom,
};
