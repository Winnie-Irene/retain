import type { Role } from "../config/constants.js";

declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      role: Role;
    }

    interface Request {
      user?: AuthUser;
    }
  }
}

export {};