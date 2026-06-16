import api from '../lib/axios';
import type { DecodedUser } from '../utils/utils';

export interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
}

export interface LoginResponse {
  token: string;
  user: DecodedUser;
}

const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', { username, password });
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Đăng nhập thất bại!');
      }
      return response.data.data;
    } catch (error) {
      let errorMsg = 'Đăng nhập thất bại!';
      if (error && typeof error === 'object' && 'response' in error) {
        const responseData = (error as { response?: { data?: { message?: string } } }).response?.data;
        if (responseData && typeof responseData === 'object' && 'message' in responseData) {
          errorMsg = String(responseData.message);
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      throw new Error(errorMsg, { cause: error });
    }
  },

  getUserProfile: async (): Promise<DecodedUser> => {
    try {
      const response = await api.get<ApiResponse<DecodedUser>>('/auth/profile');
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Lấy thông tin cá nhân thất bại!');
      }
      return response.data.data;
    } catch (error) {
      let errorMsg = 'Lấy thông tin cá nhân thất bại!';
      if (error && typeof error === 'object' && 'response' in error) {
        const responseData = (error as { response?: { data?: { message?: string } } }).response?.data;
        if (responseData && typeof responseData === 'object' && 'message' in responseData) {
          errorMsg = String(responseData.message);
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      throw new Error(errorMsg, { cause: error });
    }
  }
};

export default authService;
