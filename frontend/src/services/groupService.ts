import api from "@/lib/axios";
import type { Group, GroupCreateRequest } from "@/types/group";
import type { APIResponse } from "./authService";

const groupService = {
  createGroup: async (data: GroupCreateRequest): Promise<Group> => {
    const response = await api.post<APIResponse<Group>>("/groups", data);
    return response.data.data;
  },

  assignLeader: async (groupId: number, studentProfileId: number): Promise<Group> => {
    const response = await api.put<APIResponse<Group>>(`/groups/${groupId}/leader`, {
      studentProfileId,
    });
    return response.data.data;
  },

  assignStudentGroup: async (studentProfileId: number, groupId: number | null): Promise<void> => {
    await api.put<APIResponse<void>>(`/students/${studentProfileId}/group`, {
      groupId,
    });
  },

  getClassGroups: async (classId: number): Promise<Group[]> => {
    const response = await api.get<APIResponse<Group[]>>(`/classes/${classId}/groups`);
    return response.data.data;
  },

  previewImport: async (classId: number, file: File): Promise<import("@/types/group").GroupImportPreviewResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<APIResponse<import("@/types/group").GroupImportPreviewResponse>>(
      `/classes/${classId}/groups/import-preview`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  },

  executeImport: async (
    classId: number,
    data: import("@/types/group").GroupImportConfirmRequest
  ): Promise<import("@/types/group").GroupImportResultResponse> => {
    const response = await api.post<APIResponse<import("@/types/group").GroupImportResultResponse>>(
      `/classes/${classId}/groups/import`,
      data
    );
    return response.data.data;
  },

  downloadTemplate: async (classId: number): Promise<void> => {
    const response = await api.get(`/classes/${classId}/groups/export-template`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Mau_Import_Danh_Sach_To.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default groupService;
