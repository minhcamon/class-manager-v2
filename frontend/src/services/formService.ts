import api from "@/lib/axios";
import type { FormTemplate, FormTemplateCreateRequest } from "@/types/form";
import type { APIResponse } from "./authService";

const formService = {
  createForm: async (classId: number, data: FormTemplateCreateRequest): Promise<FormTemplate> => {
    const response = await api.post<APIResponse<FormTemplate>>(`/classes/${classId}/forms`, data);
    return response.data.data;
  },

  getActiveForm: async (classId: number): Promise<FormTemplate> => {
    const response = await api.get<APIResponse<FormTemplate>>(`/classes/${classId}/forms/active`);
    return response.data.data;
  },

  getFormHistory: async (classId: number): Promise<FormTemplate[]> => {
    const response = await api.get<APIResponse<FormTemplate[]>>(`/classes/${classId}/forms`);
    return response.data.data;
  }
};

export default formService;
