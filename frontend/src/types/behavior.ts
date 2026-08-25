export type BehaviorType = "BONUS" | "PENALTY";

export interface BehaviorLogItem {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  academicYear: number;
  semester: number;
  weekNumber: number;
  ruleName: string;
  type: BehaviorType;
  unitPoint: number;
  quantity: number;
  totalPoints: number;
  dayOfWeek?: string;
  note?: string;
  createdByUserId: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentWeeklyDetail {
  studentId: number;
  studentName: string;
  groupName: string;
  classId: number;
  academicYear: number;
  weekNumber: number;
  netScore: number;
  totalBonus: number;
  totalPenalty: number;
  totalAcademicPoints: number;
  logs: BehaviorLogItem[];
}

export interface BehaviorCreateRequest {
  studentId: number;
  classId: number;
  academicYear: number;
  semester: number;
  weekNumber: number;
  ruleName: string;
  type: BehaviorType;
  unitPoint: number;
  quantity?: number;
  dayOfWeek?: string;
  note?: string;
}

export interface BehaviorBatchRequest {
  studentIds: number[];
  classId: number;
  academicYear: number;
  semester: number;
  weekNumber: number;
  ruleName: string;
  type: BehaviorType;
  unitPoint: number;
  quantity?: number;
  dayOfWeek?: string;
  note?: string;
}

export interface BehaviorUpdateRequest {
  ruleName?: string;
  type?: BehaviorType;
  unitPoint?: number;
  quantity?: number;
  dayOfWeek?: string;
  note?: string;
}
