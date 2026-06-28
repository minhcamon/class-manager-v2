export interface DecodedUser {
  id?: number;
  username: string;
  fullName: string;
  email: string | null;
  phoneNumber?: string | null;
  avatarUrl: string | null;
  role: string | null;
  schoolName: string | null;
  classId?: number;
  teacherProfileId?: number;
  studentProfileId?: number;
  groupId?: number;
  isLeader?: boolean;
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
      id: claims.sub ? parseInt(claims.sub) : 0,
      username: claims.username,
      fullName: claims.fullName || claims.name || "",
      email: claims.email || claims.googleEmail || null,
      phoneNumber: claims.phoneNumber || null,
      avatarUrl: claims.avatar || claims.avatarUrl || null,
      role: claims.role || null,
      schoolName: claims.schoolName || null,
      classId: claims.classId,
      teacherProfileId: claims.teacherProfileId,
      studentProfileId: claims.studentProfileId,
      groupId: claims.groupId,
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
