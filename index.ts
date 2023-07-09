import { httpServer } from "./src/http_server/index";
import { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";
import { MyWebSocket, RequestData } from "./src/interfaces/interfaces";
import { controller } from "./src/controller/controller";

const HTTP_PORT = 8000;
export const wsclients: MyWebSocket[] = [];

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wsServer = new WebSocketServer({ port: 3000 });

wsServer.on("connection", (ws: MyWebSocket) => {
  const id: string = uuid();
  ws.index = id;
  wsclients.push(ws);

  console.log(`New WS client ${id}`);
  ws.on("message", (message: string) => {
    const receivedMessage = JSON.parse(message);
    const { type }: RequestData = receivedMessage;
    controller(type, ws);
  });
});
