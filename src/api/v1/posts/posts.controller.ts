import { Request, Response } from "express";
import { db } from "@/db/drizzle";
import { StatusCodes } from "http-status-codes";
import { eq } from "drizzle-orm";
import { comments, posts } from "@/db/schema";
import { NotFoundError } from "@/errors/not-found.error";
import { PostsSchema } from "@/schemas/posts.schema";
import { CommentSchema } from "@/schemas/comment.schema";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";

type CommentNode = {
  id: string;
  content: string;
  userId: string;
  createdAt: Date;
  children: CommentNode[];
};

export const getAllPosts = async (req: Request, res: Response) => {
  const posts = await db.query.posts.findMany();
  return res.status(StatusCodes.OK).json(posts);
};

export const getPost = async (req: Request, res: Response) => {
  const id = req.params.id;
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      comments: {
        orderBy: (comments, { asc }) => asc(comments.createdAt),
      },
    },
  });
  if (!post) {
    throw new NotFoundError(`Post with ID ${id} not found`);
  }

  if (post.comments.length === 0) {
    return res.status(StatusCodes.OK).json(post);
  }

  const comments = post.comments;
  const commentMap = new Map<string, CommentNode>();

  comments.forEach((comment) => {
    commentMap.set(comment.id, {
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      createdAt: comment.createdAt,
      children: [],
    });
  });

  const rootComments: CommentNode[] = [];
  comments.forEach((comment) => {
    const commentNode = commentMap.get(comment.id)!;
    if (comment.parentId) {
      const parentNode = commentMap.get(comment.parentId);
      if (parentNode) {
        parentNode.children.push(commentNode);
      }
    } else {
      rootComments.push(commentNode);
    }
  });

  return res.status(StatusCodes.OK).json({ ...post, comments: rootComments });
};

export const createPost = async (req: AuthenticatedRequest<unknown, unknown, PostsSchema>, res: Response) => {
  const { title, content } = req.body;
  const userId = req.userId!;

  const [newPost] = await db
    .insert(posts)
    .values({
      title,
      content,
      userId,
    })
    .returning();
  return res.status(StatusCodes.CREATED).json(newPost);
};

export const createComment = async (
  req: AuthenticatedRequest<
    {
      id: string;
    },
    unknown,
    CommentSchema
  >,
  res: Response,
) => {
  const { content, parentId } = req.body;
  const postId = req.params.id;
  const userId = req.userId!;

  const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  if (!post) {
    throw new NotFoundError(`Post with ID ${postId} not found`);
  }

  if (parentId) {
    const parentComment = await db.query.comments.findFirst({ where: eq(comments.id, parentId) });
    if (!parentComment) {
      throw new NotFoundError(`Comment with ID ${parentId} not found`);
    }
  }

  const [newComment] = await db
    .insert(comments)
    .values({
      content,
      postId,
      parentId,
      userId,
    })
    .returning();
  return res.status(StatusCodes.CREATED).json(newComment);
};
