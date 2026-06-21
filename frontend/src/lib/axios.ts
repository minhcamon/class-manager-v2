import axios from "axios";
import { getTokens } from "@/utils/utils";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || 
           (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/v1` : "/api/v1"),
  withCredentials: true
});

// Request Interceptor: Attach token automatically if available
api.interceptors.request.use(
  (config) => {
    const token = getTokens();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Basic wrapper
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
