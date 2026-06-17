export type ClassStatus = 'ACTIVE' | 'ENDED';

export interface Class {
  id: number;
  className: string;
  grade: number;
  teacherId: number;
  teacherName?: string;
  schoolId: number;
  schoolName?: string;
  status: ClassStatus;
  basePoint: number;
  classCode?: string;
  classPassword?: string;
  studentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClassCreateRequest {
  className: string;
  grade: number;
  basePoint: number;
}
