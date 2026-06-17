import api from "@/lib/axios";
import type { Class, ClassCreateRequest } from "@/types/class";
import type { APIResponse } from "./authService";

const classService = {
  createClass: async (data: ClassCreateRequest): Promise<Class> => {
    const response = await api.post<APIResponse<Class>>("/classes", data);
    return response.data.data;
  },

  endClass: async (id: number): Promise<Class> => {
    const response = await api.put<APIResponse<Class>>(`/classes/${id}/end`);
    return response.data.data;
  },

  getClass: async (id: number): Promise<Class> => {
    const response = await api.get<APIResponse<Class>>(`/classes/${id}`);
    return response.data.data;
  },

  getClassById: async (id: number): Promise<Class> => {
    const response = await api.get<APIResponse<Class>>(`/classes/${id}`);
    return response.data.data;
  },

  getActiveClass: async (): Promise<Class | null> => {
    const response = await api.get<APIResponse<Class | null>>("/classes/active");
    return response.data.data;
  }
};

export default classService;
