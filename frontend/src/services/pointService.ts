import api from "@/lib/axios";
import type { PointLog, PointLogCreateRequest, PointLogBatchRequest, PointLogUpdateRequest, StudentCurrentPointResponse } from "@/types/pointLog";
import type { APIResponse } from "./authService";

const pointService = {
  createPointLog: async (data: PointLogCreateRequest): Promise<PointLog> => {
    const response = await api.post<APIResponse<PointLog>>("/points", data);
    return response.data.data;
  },

  createPointLogsBatch: async (data: PointLogBatchRequest): Promise<void> => {
    await api.post<APIResponse<void>>("/points/batch", data);
  },

  getPointLogs: async (studentProfileId: number): Promise<PointLog[]> => {
    const response = await api.get<APIResponse<PointLog[]>>("/points", {
      params: { studentProfileId },
    });
    return response.data.data;
  },

  getClassPointLogs: async (classId: number): Promise<PointLog[]> => {
    const response = await api.get<APIResponse<PointLog[]>>(`/classes/${classId}/point-logs`);
    return response.data.data;
  },

  deletePointLog: async (logId: number): Promise<void> => {
    await api.delete<APIResponse<void>>(`/points/${logId}`);
  },

  updatePointLog: async (logId: number, data: PointLogUpdateRequest): Promise<PointLog> => {
    const response = await api.patch<APIResponse<PointLog>>(`/points/${logId}`, data);
    return response.data.data;
  },

  getCurrentPoint: async (classId: number, studentId: number): Promise<StudentCurrentPointResponse> => {
    const response = await api.get<APIResponse<StudentCurrentPointResponse>>(
      `/classes/${classId}/students/${studentId}/current-point`
    );
    return response.data.data;
  },
};

export default pointService;
