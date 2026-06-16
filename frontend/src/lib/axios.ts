import axios from "axios";
import { getTokens } from "@/utils/utils";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || "http://localhost:8080/api"
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
