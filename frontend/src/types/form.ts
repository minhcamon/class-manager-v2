export type FieldType = 'text' | 'number' | 'boolean' | 'select' | 'date' | 'textarea';

export interface FormField {
  fieldName: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

export interface FormTemplate {
  id: number;
  classId: number;
  title: string;
  structure: FormField[];
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormTemplateCreateRequest {
  title: string;
  structure: FormField[];
}
