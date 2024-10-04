import { NextFunction, Request, Response } from "express";

type AsyncRequestHandler<T extends Request = Request> = (req: T, res: Response, next: NextFunction) => Promise<any>;

export const tryCatch = <T extends Request = Request>(handler: AsyncRequestHandler<T>) => {
  return async (req: T, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
