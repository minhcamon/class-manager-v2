/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { setTokens, clearTokens, getTokens, decodeToken } from "../utils/utils";
import type { DecodedUser } from "../utils/utils";
import authService from "../services/authService";

interface AuthContextType {
  user: DecodedUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DecodedUser | null>(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser) as DecodedUser;
      } catch (e) {
        console.error("Failed to restore stored user:", e);
      }
    }
    const token = getTokens();
    return token ? decodeToken(token) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    await Promise.resolve();
    
    const token = getTokens();
    if (!token) {
      setUser(null);
      localStorage.removeItem("user");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const userData = await authService.getUserProfile();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Auto login failed:", error);
      clearTokens();
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const { token, user: userData } = await authService.login(username, password);
    setTokens(token);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    localStorage.removeItem("user");
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được bọc bên trong AuthProvider");
  }
  return context;
}
