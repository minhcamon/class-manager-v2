export interface Group {
  id: number;
  classId: number;
  groupName: string;
  leaderStudentId: number | null;
  leaderName: string | null;
}

export interface GroupCreateRequest {
  classId: number;
  groupName: string;
}

export interface LeaderAssignRequest {
  studentProfileId: number;
}

export interface GroupAssignRequest {
  groupId: number | null;
}
