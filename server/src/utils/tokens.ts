import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { ROLES, type Role } from "../config/constants.js";

export interface TokenPayload {
  sub: string;
  role: Role;
}

export function signToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

function isTokenPayload(value: unknown): value is TokenPayload {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.sub === "string" && ROLES.includes(candidate.role as Role);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return isTokenPayload(decoded) ? decoded : null;
  } catch {
    return null;
  }
}