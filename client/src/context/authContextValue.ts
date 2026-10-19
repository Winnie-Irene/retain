import { createContext } from "react";
import type { Credentials, RegisterPayload } from "../api/services";
import type { Role, User } from "../types/models";

export type AuthStatus = "checking" | "authenticated" | "guest";

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  isAdmin: boolean;
  signIn: (credentials: Credentials) => Promise<User>;
  signUp: (payload: RegisterPayload) => Promise<User>;
  signOut: () => void;
  updateUser: (user: User) => void;
  homePath: string;
  hasRole: (...roles: Role[]) => boolean;
}

export function homePathFor(user: User): string {
  if (user.role === "admin") return "/admin";
  return `/${user.preferences?.landingPage ?? "dashboard"}`;
}

export const AuthContext = createContext<AuthContextValue | null>(null);