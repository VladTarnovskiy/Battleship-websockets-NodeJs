import { WebSocket } from "ws";

export interface RequestData {
  type: string;
  data: string;
  id: number;
}

export interface MyWebSocket extends WebSocket {
  index: string;
}
