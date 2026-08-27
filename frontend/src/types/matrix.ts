export interface WeekCell {
  weekNumber: number;
  netScore: number;
  posScore: number;
  negScore: number;
  logCount: number;
}

export interface StudentMatrix {
  studentId: number;
  studentName: string;
  groupName: string;
  totalAcademicPoints: number;
  isLeader?: boolean;
  roles?: string[];
  weekCells: WeekCell[];
}

export interface GroupMatrix {
  groupId: number | null;
  groupName: string;
  groupTotalScore: number;
  leaderStudentId?: number | null;
  leaderName?: string | null;
  students: StudentMatrix[];
}

export interface MatrixBoardResponse {
  classId: number;
  academicYear: number;
  semester?: number;
  fromWeek: number;
  toWeek: number;
  groups: GroupMatrix[];
}

export interface WeeklyStudentLog {
  id: number;
  pointValue: number;
  reason: string;
  dayOfWeek: string;
  createdByUserId?: number | null;
  createdByName: string;
  createdAt: string;
}

export interface WeeklyFocusStudent {
  studentId: number;
  studentName: string;
  groupName: string;
  isLeader?: boolean;
  roles?: string[];
  totalPlus: number;
  totalMinus: number;
  netScore: number;
  logs: WeeklyStudentLog[];
}

export interface WeeklyFocusGroup {
  groupId: number | null;
  groupName: string;
  groupAvgScore: number;
  totalGroupPlus: number;
  totalGroupMinus: number;
  totalGroupNet?: number;
  rank?: number;
  leaderStudentId?: number | null;
  leaderName?: string | null;
  students: WeeklyFocusStudent[];
}

export interface WeeklyFocusResponse {
  classId: number;
  academicYear: number;
  weekNumber: number;
  weekStartDate: string;
  isLocked: boolean;
  groups: WeeklyFocusGroup[];
}

