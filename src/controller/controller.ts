import { MyWebSocket, RequestData } from "../interfaces/interfaces";
import { createGame, updateRoom, userRegistration } from "../model/model";

export const controller = (ws: MyWebSocket, receivedMessage: RequestData) => {
  const { type } = receivedMessage;
  switch (type) {
    case "reg":
      userRegistration(receivedMessage, ws);
      break;
    case "create_game":
      createGame(ws);
      break;
    case "start_game ":
      break;
    case "turn":
      break;
    case "attack":
      break;
    case "finish":
      break;
    case "update_room":
      updateRoom();
      break;
    case "update_winners":
      break;
    default:
      console.log(`Invalid ${type}!`);
      break;
  }
};
