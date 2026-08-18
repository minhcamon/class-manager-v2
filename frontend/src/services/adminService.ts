import api from '../lib/axios';
import type {
  AdminUser,
  AdminUserDetail,
  TeacherRequest,
  SupportActionPayload,
  ViewAsSession,
  AdminSchoolSummary,
  AdminClassSummary,
  SystemHealthData,
  ApiMetricsData,
  AdminDashboardOverview,
  PageResponse,
  Role,
  TeacherRequestStatus,
} from '../types/admin';

export const adminService = {
  getDashboardOverview: async (): Promise<AdminDashboardOverview> => {
    const res = await api.get<AdminDashboardOverview>('/admin/dashboard/overview');
    return res.data;
  },

  searchUsers: async (params?: {
    query?: string;
    role?: Role;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AdminUser>> => {
    const res = await api.get<PageResponse<AdminUser>>('/admin/users', { params });
    return res.data;
  },

  getUserDetail: async (userId: number): Promise<AdminUserDetail> => {
    const res = await api.get<AdminUserDetail>(`/admin/users/${userId}`);
    return res.data;
  },

  executeSupportAction: async (payload: SupportActionPayload): Promise<AdminUserDetail> => {
    const res = await api.post<AdminUserDetail>('/admin/support/action', payload);
    return res.data;
  },

  viewAsUser: async (userId: number): Promise<ViewAsSession> => {
    const res = await api.post<ViewAsSession>(`/admin/view-as/${userId}`);
    return res.data;
  },

  getTeacherRequests: async (params?: {
    status?: TeacherRequestStatus;
    page?: number;
    size?: number;
  }): Promise<PageResponse<TeacherRequest>> => {
    const res = await api.get<PageResponse<TeacherRequest>>('/admin/teacher-requests', { params });
    return res.data;
  },

  approveTeacherRequest: async (id: number): Promise<TeacherRequest> => {
    const res = await api.post<TeacherRequest>(`/admin/teacher-requests/${id}/approve`);
    return res.data;
  },

  rejectTeacherRequest: async (id: number, reason: string): Promise<TeacherRequest> => {
    const res = await api.post<TeacherRequest>(`/admin/teacher-requests/${id}/reject`, { reason });
    return res.data;
  },

  getSchoolsSummary: async (): Promise<AdminSchoolSummary[]> => {
    const res = await api.get<AdminSchoolSummary[]>('/admin/schools');
    return res.data;
  },

  getClassesBySchool: async (schoolId: number): Promise<AdminClassSummary[]> => {
    const res = await api.get<AdminClassSummary[]>(`/admin/schools/${schoolId}/classes`);
    return res.data;
  },

  getAllClasses: async (params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<AdminClassSummary>> => {
    const res = await api.get<PageResponse<AdminClassSummary>>('/admin/classes', { params });
    return res.data;
  },

  getSystemHealth: async (): Promise<SystemHealthData> => {
    const res = await api.get<SystemHealthData>('/admin/metrics/health');
    return res.data;
  },

  getApiMetrics: async (): Promise<ApiMetricsData> => {
    const res = await api.get<ApiMetricsData>('/admin/metrics/api');
    return res.data;
  },
};
