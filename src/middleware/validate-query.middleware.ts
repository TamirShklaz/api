import { NextFunction, Request, Response } from "express";
import { InvalidBodyError } from "../errors/invalid-body.error";
import { z } from "zod";

export const validateQuery = (schema: z.ZodObject<any, any>) => (req: Request, res: Response, next: NextFunction) => {
  const { success, data, error } = schema.safeParse(req.query);
  console.log(data);
  if (error) {
    throw new InvalidBodyError("Invalid Params", error.message);
  }
  req.query = data;
  next();

};