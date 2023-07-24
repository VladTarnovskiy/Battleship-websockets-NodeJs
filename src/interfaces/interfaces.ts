import { WebSocket } from "ws";

export const enum RequestType {
  REGISTRATION = "reg",
  CREATE_ROOM = "create_room",
  ADD_TO_ROOM = "add_user_to_room",
  ADD_SHIPS = "add_ships",
  ATTACK = "attack",
}

export type RequestBody = {
  type: string;
  data: string;
  id: 0;
};

export type ResRegData = {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
};

export interface Player {
  name: string;
  password: string;
  index: number;
  active: boolean;
  isBot: boolean;
}

export type Room = {
  roomId: number;
  roomUsers: Omit<Player, "password" | "active">[];
};

export type Ship = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
};

export type Winner = { name: Player["name"]; wins: number };

export type ShipField = {
  killed: boolean;
  positions: { x: number; y: number; status: boolean }[];
}[];

export type ActiveGame = {
  finished: boolean;
  turn: number;
  gameId: number;
  sentShipsCounter: 0 | 1 | 2;
  players: {
    index: number;
    isBot?: boolean;
    shipField: ShipField;
    hittedFields: { x: number; y: number }[];
  }[];
};
