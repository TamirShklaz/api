import { StatusCodes } from "http-status-codes";

export class NotFoundError extends Error {
  status: number;
  details?: string;

  constructor(message: string, details?: string) {
    super(message);
    this.name = "NotFoundError";
    this.status = StatusCodes.NOT_FOUND;
    this.details = details;
  }
}
