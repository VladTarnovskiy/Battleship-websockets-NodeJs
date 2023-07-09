import { MyWebSocket } from "../interfaces/interfaces";

export const controller = (type: string, ws: MyWebSocket) => {
  switch (type) {
    case "reg":
      break;
    case "create_game":
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
      break;
    case "update_winners":
      break;
    default:
      console.log(`Invalid ${type}!`);
      break;
  }
};
