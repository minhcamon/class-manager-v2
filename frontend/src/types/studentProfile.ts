import { FormTemplate } from "./form";

export interface StudentProfile {
  id: number;
  enrollmentId?: number;
  formVersionId: number;
  formVersion?: FormTemplate;
  data: Record<string, string | number | boolean | null>;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfileUpdateRequest {
  data: Record<string, string | number | boolean | null>;
}
