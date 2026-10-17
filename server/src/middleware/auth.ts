import type { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/tokens.js";
import { User } from "../models/User.js";
import type { Role } from "../config/constants.js";

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw AppError.unauthorized();
  }

  const payload = verifyToken(header.slice(7));
  if (!payload) {
    throw AppError.unauthorized("Your session has expired. Please sign in again.");
  }

  const user = await User.findById(payload.sub).select("_id role");
  if (!user) {
    throw AppError.unauthorized("This account no longer exists");
  }

  req.user = { id: user._id.toString(), role: user.role };
  next();
};

export function requireRole(...roles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden("Only admins can access this area");
    }
    next();
  };
}

export const requireAdmin = requireRole("admin");

export function currentUser(req: Request): Express.AuthUser {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  return req.user;
}