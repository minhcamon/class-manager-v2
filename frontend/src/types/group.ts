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

export interface GroupImportRow {
  rowNumber: number;
  studentIdentifier: string;
  studentName: string;
  studentProfileId: number | null;
  groupName: string;
  isLeader: boolean;
  status: "VALID" | "STUDENT_NOT_FOUND" | "MISSING_GROUP" | "MULTIPLE_LEADERS" | "DUPLICATE_STUDENT";
  statusMessage: string;
}

export interface GroupImportPreviewResponse {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  newGroupsCount: number;
  newGroupNames: string[];
  rows: GroupImportRow[];
}

export interface GroupImportConfirmRequest {
  rows: Array<{
    studentProfileId: number;
    groupName: string;
    isLeader: boolean;
  }>;
  createNewGroups: boolean;
}

export interface GroupImportResultResponse {
  groupsCreated: number;
  studentsAssigned: number;
  leadersAssigned: number;
  groupNames: string[];
  message: string;
}

