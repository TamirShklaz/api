import { z } from "zod";
import { NextFunction, Request, Response } from "express";
import { InvalidBodyError } from "../errors/invalid-body.error";

export const validateBody =
  (schema: z.ZodObject<z.ZodRawShape, "passthrough" | "strip" | "strict", z.ZodTypeAny>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { data, error } = schema.safeParse(req.body);
    if (error) {
      throw new InvalidBodyError("Invalid Params", error.errors);
    }
    req.body = data;
    next();
  };
