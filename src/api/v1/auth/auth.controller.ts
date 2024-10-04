import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { LoginSchema, RegisterSchema } from "../../../schemas/user.schema";
import bcrypt from "bcrypt";
import { AuthError } from "@/errors/auth.error";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Req params
// Res body
// Req body
// Req query
export const login = async (req: Request<unknown, unknown, LoginSchema>, res: Response) => {
  const { email, password } = req.body;
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) {
    throw new AuthError("User with this email does not exist");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (isPasswordValid) {
    const token = jwt.sign({ email, id: user.id }, process.env.TOKEN_SECRET!, { expiresIn: "10000s" });
    return res.status(StatusCodes.OK).send({ token });
  } else {
    throw new AuthError("Invalid password");
  }
};

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // Number of salt rounds
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export const register = async (req: Request<unknown, unknown, RegisterSchema>, res: Response) => {
  const { name, email, password } = req.body;
  const hashedPassword = await hashPassword(password);
  const [newUser] = await db.insert(users).values({ name, email, password: hashedPassword }).returning();
  return res.status(StatusCodes.CREATED).send({ name: newUser.name, email: newUser.email });
};
