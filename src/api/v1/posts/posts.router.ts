import { Router } from "express";
import { tryCatch } from "@/utils/try-catch";
import { errorHandler } from "@/middleware/error-handler.middleware";
import { createComment, createPost, getAllPosts, getPost } from "@/api/v1/posts/posts.controller";
import { auth } from "@/middleware/auth.middleware";

const router = Router();

router.post("/", auth, tryCatch(createPost));
router.get("/:id", tryCatch(getPost));
router.get("/", tryCatch(getAllPosts));
router.post("/:id/comments", auth, tryCatch(createComment));

router.use(errorHandler);

export default router;
