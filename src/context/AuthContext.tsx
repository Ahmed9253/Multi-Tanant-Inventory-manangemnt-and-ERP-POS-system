import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Role, User } from "../types";
import { api } from "../lib/api";

type LoginResult = { ok: boolean; error: string | null };

type AuthContextValue = {
  user: User | null;
  login: (
    email: string,
    password: string,
    loginType?: "admin" | "hr" | "employee",
  ) => Promise<LoginResult>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "worknest-user";

function loadUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);

  const login = useCallback(
    async (
      email: string,
      password: string,
      loginType?: "admin" | "hr" | "employee",
    ): Promise<LoginResult> => {
      const { data, error } = await api.postDetail<User>("/api/auth/login", {
        email,
        password,
        loginType,
      });
      if (!data) return { ok: false, error: error || "Invalid credentials" };
      setUser(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return { ok: true, error: null };
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => user !== null && roles.includes(user.role),
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
