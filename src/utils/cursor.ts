import { cursorSchema, CursorType } from "@/schemas/cursor.schema";

export const decodeCursor = (cursor: string) => {
  const cursorString = Buffer.from(cursor, "base64").toString("utf-8");
  const parsedCursor = JSON.parse(cursorString);
  const params = cursorSchema.parse(parsedCursor);
  return params;
};

export const encodeCursor = (params: CursorType) => {
  const cursorString = JSON.stringify(params);
  return Buffer.from(cursorString).toString("base64");
};
