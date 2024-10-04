import { z } from "zod";

export const cursorSchema = z.object({
  id: z.string(),
  field: z.enum(["priority", "id"]).default("id"),
  value: z.string(),
});

export type CursorType = z.infer<typeof cursorSchema>;
