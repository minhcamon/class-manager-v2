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
  weekCells: WeekCell[];
}

export interface GroupMatrix {
  groupId: number | null;
  groupName: string;
  groupAvgScore: number;
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
