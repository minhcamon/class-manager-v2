import api from "@/lib/axios";
import type { APIResponse } from "./authService";

export interface School {
  id: number;
  name: string;
  address: string;
}

export interface SchoolCreateRequest {
  name: string;
  address: string;
}

const schoolService = {
  getSchools: async (search?: string): Promise<School[]> => {
    const response = await api.get<APIResponse<School[]>>("/schools", {
      params: { search }
    });
    return response.data.data;
  },

  createSchool: async (data: SchoolCreateRequest): Promise<School> => {
    const response = await api.post<APIResponse<School>>("/schools", data);
    return response.data.data;
  }
};

export default schoolService;
