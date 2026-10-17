import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { onUnauthorized, tokenStorage } from "../api/client";
import { authApi, type Credentials, type RegisterPayload } from "../api/services";
import type { Role, User } from "../types/models";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./authContextValue";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStorage.get() ? "checking" : "guest"));

  const signOut = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus("guest");
  }, []);

  useEffect(() => {
    onUnauthorized(signOut);
    return () => onUnauthorized(null);
  }, [signOut]);

  useEffect(() => {
    if (!tokenStorage.get()) return;
    let active = true;

    authApi
      .me()
      .then(({ user: current }) => {
        if (!active) return;
        setUser(current);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!active) return;
        tokenStorage.clear();
        setStatus("guest");
      });

    return () => {
      active = false;
    };
  }, []);

  const startSession = useCallback((token: string, nextUser: User) => {
    tokenStorage.set(token);
    setUser(nextUser);
    setStatus("authenticated");
    return nextUser;
  }, []);

  const signIn = useCallback(
    async (credentials: Credentials) => {
      const { token, user: signedIn } = await authApi.login(credentials);
      return startSession(token, signedIn);
    },
    [startSession],
  );

  const signUp = useCallback(
    async (payload: RegisterPayload) => {
      const { token, user: created } = await authApi.register(payload);
      return startSession(token, created);
    },
    [startSession],
  );

  const hasRole = useCallback((...roles: Role[]) => (user ? roles.includes(user.role) : false), [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAdmin: user?.role === "admin",
      signIn,
      signUp,
      signOut,
      hasRole,
    }),
    [user, status, signIn, signUp, signOut, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}