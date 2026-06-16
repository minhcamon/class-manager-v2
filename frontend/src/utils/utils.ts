export interface DecodedUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
}

// Token Management
export const setTokens = (accessToken: string): void => {
  localStorage.setItem("access_token", accessToken);
};

export const getTokens = (): string | null => {
  return localStorage.getItem("access_token");
};

export const clearTokens = (): void => {
  localStorage.removeItem("access_token");
};

// Client-side JWT Token Decoder
export const decodeToken = (token: string): DecodedUser | null => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const claims = JSON.parse(jsonPayload);
    
    return {
      id: claims.userId || claims.id,
      username: claims.sub,
      fullName: claims.name || claims.fullName,
      email: claims.email,
      avatarUrl: claims.avatar || null,
      role: claims.role,
    };
  } catch (error) {
    console.error("decodeToken failed:", error);
    return null;
  }
};

// Synchronize UI Loading State with Async Actions
export const runWithLoading = async <T>(
  setLoading: (loading: boolean) => void,
  asyncFn: () => Promise<T>
): Promise<T> => {
  setLoading(true);
  try {
    return await asyncFn();
  } finally {
    setLoading(false);
  }
};
