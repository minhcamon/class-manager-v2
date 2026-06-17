import api from '../lib/axios';
import type { DecodedUser } from '../utils/utils';
import { decodeToken } from '../utils/utils';

// Backend Standard API Response Wrapper
export interface APIResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  message: string;
}

export interface UserResponse {
  username: string | null;
  googleEmail: string | null;
  phoneNumber: string | null;
  fullName: string;
  role: string | null;
  schoolName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

const authService = {
  register: async (username: string, password: string, phoneNumber: string, fullName: string): Promise<UserResponse> => {
    const response = await api.post<APIResponse<UserResponse>>('/auth/register', {
      username,
      password,
      phoneNumber,
      fullName
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Đăng ký thất bại!');
    }
    return response.data.data;
  },

  login: async (username: string, password: string): Promise<{ accessToken: string; user: DecodedUser }> => {
    const response = await api.post<APIResponse<AuthResponse>>('/auth/login', { username, password });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Đăng nhập thất bại!');
    }
    const { accessToken } = response.data.data;
    const user = decodeToken(accessToken);
    if (!user) {
      throw new Error('Không thể giải mã token xác thực!');
    }
    return { accessToken, user };
  },

  loginWithGoogle: async (idToken: string): Promise<{ accessToken: string; user: DecodedUser }> => {
    const response = await api.post<APIResponse<AuthResponse>>('/auth/google', { idToken });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Đăng nhập bằng Google thất bại!');
    }
    const { accessToken } = response.data.data;
    const user = decodeToken(accessToken);
    if (!user) {
      throw new Error('Không thể giải mã token xác thực từ Google!');
    }
    return { accessToken, user };
  },

  refreshToken: async (): Promise<{ accessToken: string; user: DecodedUser }> => {
    const response = await api.post<APIResponse<AuthResponse>>('/auth/refresh');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Làm mới phiên làm việc thất bại!');
    }
    const { accessToken } = response.data.data;
    const user = decodeToken(accessToken);
    if (!user) {
      throw new Error('Không thể giải mã token làm mới!');
    }
    return { accessToken, user };
  },

  getUserProfile: async (): Promise<DecodedUser> => {
    const response = await api.get<APIResponse<UserResponse>>('/auth/me');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Lấy thông tin tài khoản thất bại!');
    }
    const u = response.data.data;
    return {
      username: u.username || "",
      fullName: u.fullName,
      email: u.googleEmail,
      avatarUrl: u.avatarUrl,
      role: u.role,
      schoolName: u.schoolName
    };
  },

  selectRole: async (role: string): Promise<UserResponse> => {
    const response = await api.put<APIResponse<UserResponse>>('/auth/select-role', { role });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Chọn vai trò thất bại!');
    }
    return response.data.data;
  },

  createSchool: async (name: string, address: string): Promise<UserResponse> => {
    const response = await api.post<APIResponse<UserResponse>>('/schools', { name, address });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Tạo trường học thất bại!');
    }
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    const response = await api.post<APIResponse<void>>('/auth/logout');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Đăng xuất thất bại!');
    }
  }
};

export default authService;
