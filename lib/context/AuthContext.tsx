"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { Models, ID } from "appwrite";
import { account } from "@/lib/appwrite/client";
import { setAuthToken } from "@/lib/auth/tokenStore";

// ─── Types ────────────────────────────────────────────────────────────
type AuthUser = Models.User<Models.Preferences>;

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  /** Email / password sign‑up */
  register: (email: string, password: string, name: string) => Promise<void>;
  /** Email / password log‑in */
  login: (email: string, password: string) => Promise<void>;
  /** Destroy session */
  logout: () => Promise<void>;
  /** Re‑fetch current session */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// JWT auto-refresh interval (14 min — JWT expires at 15 min)
const JWT_REFRESH_MS = 14 * 60 * 1000;

// ─── Provider ─────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const jwtTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── JWT helpers ─────────────────────────────────────────────────────
  const obtainJWT = useCallback(async () => {
    try {
      const { jwt } = await account.createJWT();
      setAuthToken(jwt);
    } catch {
      setAuthToken(null);
    }
  }, []);

  const startJwtRefresh = useCallback(() => {
    if (jwtTimer.current) clearInterval(jwtTimer.current);
    jwtTimer.current = setInterval(obtainJWT, JWT_REFRESH_MS);
  }, [obtainJWT]);

  const stopJwtRefresh = useCallback(() => {
    if (jwtTimer.current) {
      clearInterval(jwtTimer.current);
      jwtTimer.current = null;
    }
  }, []);

  // ── Check for an existing session on mount ──────────────────────────
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const session = await account.get();
      setUser(session);
      await obtainJWT();
      startJwtRefresh();
    } catch {
      setUser(null);
      setAuthToken(null);
      stopJwtRefresh();
    } finally {
      setLoading(false);
    }
  }, [obtainJWT, startJwtRefresh, stopJwtRefresh]);

  useEffect(() => {
    refresh();
    return () => stopJwtRefresh();
  }, [refresh, stopJwtRefresh]);

  // ── Auth actions ────────────────────────────────────────────────────
  const register = async (email: string, password: string, name: string) => {
    await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    await refresh();
  };

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password);
    await refresh();
  };

  const logout = async () => {
    stopJwtRefresh();
    try {
      await account.deleteSession("current");
    } catch {
      // Session may already be expired — that's fine
    }
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
