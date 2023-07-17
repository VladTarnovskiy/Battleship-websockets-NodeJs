import { MyWebSocket, RequestData } from "../interfaces/interfaces";
import { players, registerPlayer } from "../data";
import { wsClients } from "../../index";

export const sendToAllClients = (
  message: RequestData,
  wsClients: MyWebSocket[]
) => {
  wsClients.forEach((client) => {
    client.send(JSON.stringify(message));
  });
};
export const userRegistration = (
  receivedMessage: RequestData,
  ws: MyWebSocket
) => {
  const { name, password } = JSON.parse(receivedMessage.data);
  const updatedMessage: RequestData = {
    type: "reg",
    data: JSON.stringify({
      name,
      index: ws.index,
      error: false,
      errorText: "",
    }),
    id: 0,
  };
  ws.send(JSON.stringify(updatedMessage));
  registerPlayer(name, password, ws.index);
};

export const createGame = (ws: MyWebSocket) => {
  const updatedMessage: RequestData = {
    type: "create_game",
    data: JSON.stringify({
      idGame: players[0].index,
      idPlayer: ws.index,
    }),
    id: 0,
  };
  sendToAllClients(updatedMessage, wsClients);
};

export const updateRoom = () => {
  const roomUsers = players.map((player) => ({
    name: player.name,
    index: player.index,
  }));
  const rooms = JSON.stringify([
    {
      roomId: 1,
      roomUsers: roomUsers,
    },
  ]);

  const updatedMessage: RequestData = {
    type: "update_room",
    data: rooms,
    id: 0,
  };
  sendToAllClients(updatedMessage, wsClients);
};
