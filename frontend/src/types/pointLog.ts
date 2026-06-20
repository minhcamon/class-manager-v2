export interface PointLog {
  id: number;
  studentId: number;
  studentName: string | null;
  pointValue: number;
  reason: string;
  weekStartDate: string; // yyyy-MM-dd
  createdByUserId: number;
  createdByName: string;
  createdAt: string;
}

export interface PointLogCreateRequest {
  studentId: number;
  pointValue: number;
  reason: string;
  weekStartDate: string; // yyyy-MM-dd
}

export interface PointLogBatchRequest {
  studentIds: number[];
  pointValue: number;
  reason: string;
  weekStartDate: string; // yyyy-MM-dd
}

export interface PointLogUpdateRequest {
  pointValue?: number;
  reason?: string;
}

export interface StudentCurrentPointResponse {
  studentId: number;
  fullName: string;
  basePoint: number;
  totalDelta: number;
  currentPoint: number;
}
