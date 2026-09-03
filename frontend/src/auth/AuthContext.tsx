import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AdminAuthApiError, loginAdmin } from "../api/admin-auth";
import {
  clearAccessToken,
  getAccessToken,
  getAdminUser,
  setAdminUser,
  setAccessToken,
} from "./auth-storage";
import type { AdminUser } from "./types";

type AuthContextValue = {
  isAuthenticated: boolean;
  isAuthReady: boolean;
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => getAccessToken() !== null,
  );
  const [admin, setAdmin] = useState<AdminUser | null>(() => getAdminUser());
  const [isAuthReady, setIsAuthReady] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginAdmin(email, password);
    setAccessToken(response.data.accessToken);
    setAdminUser(response.data.admin);
    setAdmin(response.data.admin);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    setAdmin(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    // Local storage restoration is synchronous, but readiness is published after the
    // provider mounts so protected routes never render during session initialization.
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener(
      "virtual-reality.admin-unauthorized",
      handleUnauthorized,
    );
    return () =>
      window.removeEventListener(
        "virtual-reality.admin-unauthorized",
        handleUnauthorized,
      );
  }, [logout]);

  const value = useMemo(
    () => ({ isAuthenticated, isAuthReady, admin, login, logout }),
    [admin, isAuthenticated, isAuthReady, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export function isInvalidCredentialsError(error: unknown) {
  return error instanceof AdminAuthApiError && error.status === 401;
}
