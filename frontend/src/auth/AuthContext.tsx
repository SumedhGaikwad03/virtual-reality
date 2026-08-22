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
  setAccessToken,
} from "./auth-storage";

type AuthContextValue = {
  isAuthenticated: boolean;
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

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginAdmin(email, password);
    setAccessToken(response.data.accessToken);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    setIsAuthenticated(false);
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
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout],
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
