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
};

export default groupService;
