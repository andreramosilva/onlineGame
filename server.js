import express from "express";
import http from "http";
import createGame from "./public/game.js";
import socketio from "socket.io";
import { Socket } from "dgram";

const app = express();
const server = http.createServer(app);
const sockets = socketio(server);

app.use(express.static("public"));

const game = createGame();
game.start();

game.subscribe((command) => {
  console.log(`Emmiting ${command.type}`);
  sockets.emit(command.type, command);
});

sockets.on("connection", (socket) => {
  const playerId = socket.id;
  console.log(`> player connected on server with id :${playerId} `);

  game.addPlayer({ playerId: playerId });
  console.log(game.state);

  socket.emit("setup", game.state);

  socket.on("disconnect", () => {
    game.removePlayer({ playerId: playerId });
    console.log(`player disconnected: ${playerId} `);
  });

  socket.on("move-player", (command) => {
    command.playerId = playerId;
    command.type = "move-player";

    game.movePlayer(command);
  });
});

server.listen(3000, () => {
  console.log("server listening on port : 3000");
});
