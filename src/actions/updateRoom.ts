import db from "../DB/DB";
import { ResponseBody } from "../interfaces/response";
import { createResponse, getUpdateRoomData } from "../utils/index";

export const updateRoom = async (
  currentPlayerId: number
): Promise<ResponseBody> => {
  const currentPlayer = db.getPlayerByIndex(currentPlayerId);
  const isUserInAnyRoom = db.isUserInAnyRoom(currentPlayerId);
  if (!isUserInAnyRoom && currentPlayer) {
    db.addRoom(currentPlayer);
  }

  return createResponse("update_room", getUpdateRoomData());
};
