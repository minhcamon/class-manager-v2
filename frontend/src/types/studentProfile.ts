import type { FormTemplate } from "./form";

export interface StudentProfile {
  id: number;
  enrollmentId?: number;
  formVersionId: number;
  formVersion?: FormTemplate;
  data: Record<string, string | number | boolean | null>;
  groupId?: number | null;
  groupName?: string | null;
  isLeader?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfileUpdateRequest {
  data: Record<string, string | number | boolean | null>;
}

export interface ClassStudentResponse {
  studentProfileId: number;
  userId: number;
  fullName: string;
  username: string;
  phoneNumber: string;
  groupId: number | null;
  groupName: string | null;
  isLeader: boolean;
  currentPoint: number;
}
