import { z } from "zod";

export const postsSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export type PostsSchema = z.infer<typeof postsSchema>;
