import { httpServer } from "./src/http_server/index";
import { WebSocketServer, createWebSocketStream } from "ws";
import { RequestBody } from "./src/interfaces/interfaces";
import {
  createGame,
  registrationUser,
  startGame,
  updateRoom,
  attack,
} from "./src/actions/index";

import {
  getUpdateWinnersData,
  getTurnData,
  getUpdateRoomData,
  createResponse,
  getCreateGameData,
  checkGameShipsCounter,
  getFinishData,
} from "./src/utils/index";
import { WebSocket } from "ws";
import db from "./src/DB/DB";
import "dotenv/config";

class MyWebSocket extends WebSocket {
  id = Math.floor(Math.random() * 1000);
}

const HTTP_PORT = Number(process.env.HTTP_PORT) ?? 8181;
const WS_PORT = Number(process.env.WS_PORT) ?? 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wsServer = new WebSocketServer(
  { host: "localhost", port: WS_PORT, WebSocket: MyWebSocket },
  () => {
    console.log(`Websocket is connected to ${WS_PORT} port`);
  }
);

let finished = false;

wsServer.on("connection", async (ws) => {
  const messageStream = createWebSocketStream(ws, { decodeStrings: false });

  console.log(`New WS client ${ws.id}`);
  messageStream.on("data", async (chunk) => {
    const requestbody: RequestBody = JSON.parse(chunk);
    const { type } = requestbody;
    if (type === "reg") {
      const responseBody = await registrationUser(requestbody, ws.id);
      messageStream.write(JSON.stringify(responseBody));
      messageStream.write(
        JSON.stringify(createResponse("update_room", getUpdateRoomData()))
      );
      messageStream.write(
        JSON.stringify(createResponse("update_winners", getUpdateWinnersData()))
      );
    } else if (type === "create_room") {
      const responseBody = await updateRoom(ws.id);
      wsServer.clients.forEach((client) => {
        client.send(JSON.stringify(responseBody));
      });
    } else if (type === "add_user_to_room") {
      const responseBody = await createGame(requestbody, ws.id);
      if (responseBody) {
        const roomId = Number(responseBody.data);
        const room = db.getRoomByRoomId(roomId);
        if (room && room.roomUsers.length === 2) {
          db.deleteRoom(roomId);
          wsServer.clients.forEach((client) => {
            client.send(
              JSON.stringify(createResponse("update_room", getUpdateRoomData()))
            );
            if (room.roomUsers.some((player) => player.index === client.id)) {
              responseBody.data = JSON.stringify(
                getCreateGameData(roomId, client.id)
              );
              client.send(JSON.stringify(responseBody));
            }
          });
        }
      }
    } else if (type === "add_ships") {
      const sentShipsCounter = checkGameShipsCounter(requestbody);
      if (sentShipsCounter === 2) {
        const responseBody = startGame(requestbody, ws.id);
        let turnSent = 0;
        let counter = 0;

        const currentGame = db.getActiveGameByPlayerIndex(ws.id);
        if (!currentGame) return;

        wsServer.clients.forEach((client) => {
          if (
            currentGame.players.some((player) => player.index === client.id)
          ) {
            client.send(JSON.stringify(responseBody));
            counter++;
            if ((Math.random() > 0.5 || counter > 1) && !turnSent) {
              db.setActiveGameTurn(currentGame, client.id);
              client.send(
                JSON.stringify(createResponse("turn", getTurnData(client.id)))
              );
              turnSent = client.id;
            }
          }
        });

        counter = 0;
      }
    } else if (type === "attack") {
      const responseBody = await attack(requestbody);
      if (!responseBody) return;
      const currentGame = db.getActiveGameByPlayerIndex(ws.id);
      if (!currentGame) return;
      wsServer.clients.forEach((client) => {
        if (currentGame.players.some((player) => player.index === client.id)) {
          responseBody.forEach((item) => {
            client.send(JSON.stringify(item));
          });
          if (currentGame.finished) {
            client.send(
              JSON.stringify(
                createResponse("finish", getFinishData(currentGame.turn))
              )
            );
          } else {
            client.send(
              JSON.stringify(
                createResponse("turn", getTurnData(currentGame.turn))
              )
            );
          }
        }
      });
      if (currentGame.finished) {
        finished = true;
        db.deleteActiveGame(currentGame);
      }
    } else {
      console.log(`Invalid request!`);
    }

    if (finished) {
      wsServer.clients.forEach((client) => {
        client.send(
          JSON.stringify(
            createResponse("update_winners", getUpdateWinnersData())
          )
        );
      });
      finished = false;
    }
  });

  ws.on("close", () => {
    db.deleteRoom(ws.id);
    db.toggleActivePlayer(ws.id, false);
    wsServer.clients.forEach((client) => {
      client.send(
        JSON.stringify(createResponse("update_room", getUpdateRoomData()))
      );
    });

    console.log(`Client with ID ${ws.id} disconnected from websocket`);
  });

  ws.on("error", (e) => console.error(e));
});
