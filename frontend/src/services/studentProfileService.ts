import api from "@/lib/axios";
import type { StudentProfile, StudentProfileUpdateRequest, ClassStudentResponse } from "@/types/studentProfile";
import type { APIResponse } from "./authService";

const studentProfileService = {
  updateMyProfile: async (data: StudentProfileUpdateRequest): Promise<StudentProfile> => {
    const response = await api.put<APIResponse<StudentProfile>>("/students/me/profile", data);
    return response.data.data;
  },

  getMyProfile: async (): Promise<StudentProfile> => {
    const response = await api.get<APIResponse<StudentProfile>>("/students/me/profile");
    return response.data.data;
  },

  getStudentProfile: async (classId: number, studentId: number): Promise<StudentProfile> => {
    const response = await api.get<APIResponse<StudentProfile>>(`/classes/${classId}/students/${studentId}/profile`);
    return response.data.data;
  },

  getClassStudents: async (classId: number): Promise<ClassStudentResponse[]> => {
    const response = await api.get<APIResponse<ClassStudentResponse[]>>(`/classes/${classId}/students`);
    return response.data.data;
  }
};

export default studentProfileService;
