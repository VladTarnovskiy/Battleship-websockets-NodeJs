import type { RequestBody } from "../interfaces/interfaces";
import { ResponseBody } from "../interfaces/response";
import db from "../DB/DB";

export const createGame = async (parsedBody: RequestBody, idPlayer: number) => {
  const idGame = (await JSON.parse(parsedBody.data).indexRoom) as number;

  const isUserARoomHost = db.isUserARoomHost(idGame, idPlayer);

  if (isUserARoomHost) return;

  db.addPlayerToRoom(idGame, idPlayer);
  db.addActiveGame(idGame);

  const res: ResponseBody = {
    type: "create_game",
    data: idGame.toString(),
    id: 0,
  };

  return res;
};
