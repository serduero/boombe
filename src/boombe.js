import express from "express";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import cors from "cors";

import { varios } from "./controllers/varios.js";
import { tratamiento_Socket } from "./controllers/websocket.js";

// Creamos servidor
const server = express();
const port = 8001;

const corsOptions = {
  origin: varios.allowedOrigins,
  credentials: true,
  optionSuccessStatus: 200,
};

// Poder recibir datos
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// permitir desde otro servidor
server.use(cors(corsOptions));

// Control de sitio no encontrado
server.all("*", function (req, res) {
  res.status(200);
  res.send("OK");
  return;
});

// Escuchamos por el puerto port
const app = server.listen(port, () => {
  console.log(`Listen on port ${port}`);
});

// tratamiento del socket
tratamiento_Socket(new Server(app));
