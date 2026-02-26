"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Models, ID } from "appwrite";
import { account } from "@/lib/appwrite/client";

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

// ─── Provider ─────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for an existing session on mount
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const session = await account.get();
      setUser(session);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
    await account.deleteSession("current");
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
