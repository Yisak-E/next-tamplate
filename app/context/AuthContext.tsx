"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { authApi, type AuthUser, type AuthResponse, ApiError } from "../lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "sc_token";
const USER_KEY = "sc_user";

function loadFromStorage(): { token: string | null; user: AuthUser | null } {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    const user = raw ? JSON.parse(raw) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

function saveToStorage(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored.token && stored.user) {
      // Validate token by fetching profile
      authApi
        .profile(stored.token)
        .then((profileUser) => {
          setToken(stored.token);
          setUser(profileUser);
        })
        .catch(() => {
          clearStorage();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuth = useCallback((res: AuthResponse) => {
    saveToStorage(res.access_token, res.user);
    setToken(res.access_token);
    setUser(res.user);
    setError(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setLoading(true);
      try {
        const res = await authApi.login({ email, password });
        handleAuth(res);
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? (err.message || "Invalid credentials")
            : "Network error";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleAuth]
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      setError(null);
      setLoading(true);
      try {
        const res = await authApi.register({ username, email, password });
        handleAuth(res);
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? (err.message || "Registration failed")
            : "Network error";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleAuth]
  );

  const logout = useCallback(() => {
    clearStorage();
    setToken(null);
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, register, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
