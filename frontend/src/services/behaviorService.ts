import api from "@/lib/axios";
import type { APIResponse } from "./authService";
import type {
  BehaviorLogItem,
  StudentWeeklyDetail,
  BehaviorCreateRequest,
  BehaviorBatchRequest,
  BehaviorUpdateRequest,
} from "@/types/behavior";

export interface StudentWeeklyDetailParams {
  classId: number;
  academicYear?: number;
  weekNumber: number;
}

const behaviorService = {
  getStudentWeeklyDetail: async (
    studentId: number,
    params: StudentWeeklyDetailParams
  ): Promise<StudentWeeklyDetail> => {
    const response = await api.get<APIResponse<StudentWeeklyDetail>>(
      `/students/${studentId}/weekly-detail`,
      { params }
    );
    return response.data.data;
  },

  createBehavior: async (data: BehaviorCreateRequest): Promise<BehaviorLogItem> => {
    const response = await api.post<APIResponse<BehaviorLogItem>>("/behaviors", data);
    return response.data.data;
  },

  createBehaviorsBatch: async (data: BehaviorBatchRequest): Promise<void> => {
    await api.post<APIResponse<void>>("/behaviors/batch", data);
  },

  updateBehavior: async (
    id: number,
    data: BehaviorUpdateRequest
  ): Promise<BehaviorLogItem> => {
    const response = await api.patch<APIResponse<BehaviorLogItem>>(`/behaviors/${id}`, data);
    return response.data.data;
  },

  deleteBehavior: async (id: number): Promise<void> => {
    await api.delete<APIResponse<void>>(`/behaviors/${id}`);
  },
};

export default behaviorService;
