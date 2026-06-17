export type ClassStatus = 'ACTIVE' | 'ENDED';

export interface Class {
  id: number;
  className: string;
  grade: number;
  teacherId: number;
  schoolId: number;
  schoolName?: string;
  status: ClassStatus;
  basePoint: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClassCreateRequest {
  className: string;
  grade: number;
  basePoint: number;
}
