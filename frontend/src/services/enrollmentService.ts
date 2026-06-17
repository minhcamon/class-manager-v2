import api from "@/lib/axios";
import type { APIResponse } from "./authService";

export interface JoinClassRequest {
  classCode: string;
  classPassword?: string;
}

export interface Enrollment {
  id: number;
  studentId: number;
  classId: number;
  status: string;
}

const enrollmentService = {
  joinClass: async (data: JoinClassRequest): Promise<Enrollment> => {
    const response = await api.post<APIResponse<Enrollment>>("/enrollments/join", data);
    return response.data.data;
  }
};

export default enrollmentService;
