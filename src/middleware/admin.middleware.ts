import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { UserRole } from "../types/user.type";

export function adminMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw HttpError.unauthorized();
  }
  if (req.user.role !== UserRole.ADMIN) {
    throw HttpError.forbidden("Admin access required");
  }
  next();
}

export function bakerMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw HttpError.unauthorized();
  }
  if (req.user.role !== UserRole.BAKER && req.user.role !== UserRole.ADMIN) {
    throw HttpError.forbidden("Baker access required");
  }
  next();
}
