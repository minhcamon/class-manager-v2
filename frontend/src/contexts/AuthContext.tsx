/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { setTokens, clearTokens, getTokens } from "../utils/utils";
import type { DecodedUser } from "../utils/utils";
import authService from "../services/authService";

interface AuthContextType {
  user: DecodedUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (username: string, password: string, phoneNumber: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  selectRole: (role: string) => Promise<void>;
  createSchool: (name: string, address: string) => Promise<void>;
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
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
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
      console.warn("Auto login check with accessToken failed, trying to refresh token:", error);
      try {
        const { accessToken, user: decoded } = await authService.refreshToken();
        setTokens(accessToken);
        setUser(decoded);
        localStorage.setItem("user", JSON.stringify(decoded));
      } catch (refreshErr) {
        console.error("Token refresh failed during checkAuth, logging out:", refreshErr);
        clearTokens();
        setUser(null);
        localStorage.removeItem("user");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const { accessToken, user: userData } = await authService.login(username, password);
    setTokens(accessToken);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const loginWithGoogle = async (idToken: string) => {
    const { accessToken, user: userData } = await authService.loginWithGoogle(idToken);
    setTokens(accessToken);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const register = async (username: string, password: string, phoneNumber: string, fullName: string) => {
    await authService.register(username, password, phoneNumber, fullName);
    // Auto login after successful registration
    await login(username, password);
  };

  const selectRole = async (role: string) => {
    await authService.selectRole(role);
    // Refresh token to get updated JWT claims containing the new role
    const { accessToken, user: userData } = await authService.refreshToken();
    setTokens(accessToken);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const createSchool = async (name: string, address: string) => {
    await authService.createSchool(name, address);
    // Refresh token to get updated JWT claims containing the new schoolId
    const { accessToken, user: userData } = await authService.refreshToken();
    setTokens(accessToken);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Fire API call without awaiting to prevent UI blocking on slow/hanging network
      authService.logout().catch((e) => console.error("Logout API call failed:", e));
    } finally {
      clearTokens();
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    checkAuth,
    selectRole,
    createSchool,
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
