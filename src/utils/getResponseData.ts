import type {
  ResCreateGameData,
  ResFinishData,
  ResTurnData,
  ResUpdateRoomData,
  ResUpdateWinnersData,
} from "../interfaces/response";
import db from "../DB/DB";

export const getFinishData = (winPlayer: number): ResFinishData => ({
  winPlayer,
});

export const getTurnData = (currentPlayer: number): ResTurnData => ({
  currentPlayer,
});

export const getUpdateRoomData = (): ResUpdateRoomData => db.rooms;
export const getUpdateWinnersData = (): ResUpdateWinnersData => db.winners;
export const getCreateGameData = (
  idGame: number,
  idPlayer: number
): ResCreateGameData => ({
  idGame,
  idPlayer,
});
