// vector de objetos "id" y "nickname" de cada jugador
var master = [];

// el index del turno que le toca
var turno = 0;

// si partida en curso o no
var partida_enCurso = false;

// nuevo jugador a la lista
function newPlayer(id, nickname) {
  // si partida en curso no aceptamos a nadie más
  // console.log(`curso? ${partida_enCurso}  ${nickname}`);
  if (partida_enCurso) {
    return -1;
  }

  master.push({ id: id, nick: nickname });
  // TODO: guardar en BBDDs el master de la partida
  // console.log(`guardado: ${JSON.stringify(master)}`);

  return master.length;
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
  // console.log(`borrado id ${id} vector: ${JSON.stringify(master)}`);
  return master.length;
}

// inicializa el turno con el id entrado y retorna el nickname
function iniciaTurno(senderId) {
  // console.log(`inicia turno ${senderId}`);

  turno = master.findIndex((el) => el.id === senderId);
  // console.log(`indice: ${turno}`);

  return master[turno].nick;
}

// retorna el id del turno actual
function getTurno(suma) {
  turno = turno + suma;
  if (turno >= master.length) {
    turno = 0;
  }

  // TODO: guardar en BBDDs el master de la partida
  // console.log(`turno ${turno}, elemento: ${master[turno]}`);
  return master[turno];
}

// Inicia la partida, si procede
function iniciaPartidaOk() {
  if (partida_enCurso) {
    return false;
  } else {
    partida_enCurso = true;
    return true;
  }
}

// Inicia la partida, si procede
function finPartida() {
  // console.log("fin partida");
  partida_enCurso = false;
}

// Reset total
function reset() {
  // console.log("reset total");
  partida_enCurso = false;
  master = [];
  turno = 0;
}

// retorna si está o no en la partida este Id
function enPartida(elemId) {
  // console.log(`en partida? ${elemId}`);

  const elem = master.findIndex((el) => el.id === elemId);
  // console.log(`elem: ${elem}`);

  return elem !== -1;
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
};
