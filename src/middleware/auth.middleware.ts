import { NextFunction, Request, Response } from "express";
import { AuthError } from "../errors/auth.error";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any>
  extends Request<P, ResBody, ReqBody, ReqQuery> {
  token?: string | jwt.JwtPayload;
  userId?: string;
}

export const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    throw new AuthError("Missing Authorization header");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new AuthError("Invalid Authorization header");
  }

  const token = parts[1];

  jwt.verify(token, process.env.TOKEN_SECRET!, (err, decoded) => {
    if (err) {
      throw new AuthError("Invalid token");
    }
    req.token = decoded;
    req.userId = (decoded as any).id; // Extract userId from the token
    next();
  });
};
