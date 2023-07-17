import type { ResData, ResponseBody } from "../interfaces/response";

export const createResponse = (type: string, data: ResData): ResponseBody => {
  return {
    type,
    data: JSON.stringify(data),
    id: 0,
  };
};
