import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors/not-found.error";
import { InvalidBodyError } from "../errors/invalid-body.error";
import { StatusCodes } from "http-status-codes";
import { AuthError } from "../errors/auth.error";

export const errorHandler = async (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  if (err instanceof NotFoundError) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Not found" });
  }
  if (err instanceof InvalidBodyError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: err.message,
      details: err.details,
    });
  }

  if (err instanceof AuthError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: err.message,
    });
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
};
