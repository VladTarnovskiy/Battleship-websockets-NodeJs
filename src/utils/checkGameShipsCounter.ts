import db from "../DB/DB";
import { RequestBody } from "../interfaces/interfaces";

import { Ship, ShipField } from "../interfaces/interfaces";

export const calculateShipField = (ships: Ship[]): ShipField => {
  const shipfield: ShipField = [];
  ships.forEach((ship) => {
    const resShip: ShipField[0] = { killed: false, positions: [] };
    let counter = 0;
    if (ship.direction) {
      while (counter < ship.length) {
        resShip.positions.push({
          x: ship.position.x,
          y: ship.position.y + counter,
          status: true,
        });
        counter++;
      }
    } else {
      while (counter < ship.length) {
        resShip.positions.push({
          x: ship.position.x + counter,
          y: ship.position.y,
          status: true,
        });
        counter++;
      }
    }
    shipfield.push(resShip);
  });
  return shipfield;
};

export const checkGameShipsCounter = (parsedBody: RequestBody) => {
  const { gameId, indexPlayer, ships } = JSON.parse(parsedBody.data);
  const activeGame = db.updateActiveGameById(
    gameId,
    indexPlayer,
    calculateShipField(ships)
  );
  if (activeGame) return activeGame.sentShipsCounter;
};
