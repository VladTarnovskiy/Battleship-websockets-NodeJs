import { Ship } from "../interfaces/interfaces";
import { createResponse } from "../utils/index";

export const startGame = (parsedBody: any, currentPlayerIndex: number) => {
  const ships = JSON.parse(parsedBody.data) as Ship[];

  return createResponse("start_game", { ships, currentPlayerIndex });
};
