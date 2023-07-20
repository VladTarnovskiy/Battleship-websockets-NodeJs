import { RequestBody } from "../interfaces/interfaces";
import { makeAttack, createResponse } from "../utils/index";

export const attack = async (parsedBody: RequestBody) => {
  const data = await JSON.parse(parsedBody.data);

  const resData = makeAttack(data);

  if (!resData) return;

  if (Array.isArray(resData)) {
    return resData.map((data) => createResponse("attack", data));
  }

  return [createResponse("attack", resData)];
};
