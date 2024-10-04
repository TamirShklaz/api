import { StatusCodes } from "http-status-codes";

export class InvalidBodyError extends Error {
  status: number;
  details: string | object;

  constructor(message: string, details: string | object) {
    super(message);
    this.name = "InvalidBodyError";
    this.status = StatusCodes.BAD_REQUEST;
    this.details = details;
  }
}
