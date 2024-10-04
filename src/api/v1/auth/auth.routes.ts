import { Router } from "express";
import { login, register } from "./auth.controller";
import { loginSchema, registerSchema } from "@/schemas/user.schema";
import { validateBody } from "@/middleware/validate-body.middleware";
import { tryCatch } from "@/utils/try-catch";
import { errorHandler } from "@/middleware/error-handler.middleware";

const router = Router();

router.post("/login", validateBody(loginSchema), tryCatch(login));
router.post("/register", validateBody(registerSchema), tryCatch(register));

router.use(errorHandler);

export default router;
