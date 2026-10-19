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

  const user = await User.findById(payload.sub).select("_id role status");
  if (!user) {
    throw AppError.unauthorized("This account no longer exists");
  }
  if (user.status === "suspended") {
    throw AppError.unauthorized("This account has been suspended. Please contact the Retain team.");
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
      throw AppError.forbidden(
        roles.includes("admin")
          ? "Only admins can access this area"
          : "This area belongs to personal planners. Admin accounts look after the platform instead.",
      );
    }
    next();
  };
}

export const requireAdmin = requireRole("admin");
export const requireMember = requireRole("user");

export function currentUser(req: Request): Express.AuthUser {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  return req.user;
}