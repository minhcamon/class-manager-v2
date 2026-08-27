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
  groupAvgScore: number;
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
