import { z } from "zod";

export const commentSchema = z.object({
  content: z.string(),
  parentId: z.string().optional(),
});

export type CommentSchema = z.infer<typeof commentSchema>;
