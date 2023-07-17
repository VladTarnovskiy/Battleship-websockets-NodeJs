import { MyWebSocket, RequestBody } from "../interfaces/interfaces";
import {
  createGame,
  registrationUser,
  startGame,
  updateRoom,
  attack,
} from "../actions/index";

import {
  getUpdateWinnersData,
  getTurnData,
  getFinishData,
  getUpdateRoomData,
  createResponse,
  getCreateGameData,
  checkGameShipsCounter,
} from "../utils/index";

export const controller = async (
  messageStream: any,
  requestbody: RequestBody
) => {
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
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(responseBody));
    });
  } else if (type === "add_user_to_room") {
    const responseBody = await createGame(requestbody, ws.id);
    if (responseBody) {
      const roomId = Number(responseBody.data);
      const room = db.getRoomByRoomId(roomId);
      if (room && room.roomUsers.length === 2) {
        db.deleteRoom(roomId);
        wss.clients.forEach((client) => {
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

      wss.clients.forEach((client) => {
        if (currentGame.players.some((player) => player.index === client.id)) {
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

    wss.clients.forEach((client) => {
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

    /* Check if game is with bot and if it is bot's turn */
    const bot = currentGame.players.find(
      (player) => player.index !== ws.id && player.isBot
    );
    const botWS: WebSocketWithId | undefined = [...wss.clients.values()].find(
      (client) => client.id === bot?.index
    );

    if (botWS) {
      const botAttackRes: ResponseBody[] | undefined = [];
      while (currentGame.turn === botWS.id && !currentGame.finished) {
        const attackRes = await attack(
          createBotAttack(currentGame.gameId, botWS.id)
        );
        if (attackRes) {
          botAttackRes.push(...attackRes);
        }
      }

      wss.clients.forEach((client) => {
        if (currentGame.players.some((player) => player.index === client.id)) {
          if (botAttackRes) {
            botAttackRes.forEach((item) => {
              client.send(JSON.stringify(item));
              client.send(
                JSON.stringify(
                  createResponse("turn", getTurnData(currentGame.turn))
                )
              );
            });
          }
        }
      });
    }
  } else if (type === "finish") {
    /* When game is finished */
    finished = true;
    db.deleteActiveGame(currentGame);

    /* Delete bot from db and from ws connections after the game */
    if (botWS) {
      db.deletePlayerByIndex(botWS.id);
      botWS.close();
    }
  } else {
    console.log(`Invalid request!`);
  }
};
