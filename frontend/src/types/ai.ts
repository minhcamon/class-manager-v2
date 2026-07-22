export type ToneOption = "MOTIVATIONAL" | "STRICT" | "CONCISE";

export interface AiReportRequest {
  classId: number;
  studentId?: number | null;
  weekStartDate: string;
  tone?: ToneOption;
  customInstruction?: string;
}

export interface AiReportResponse {
  summaryText: string;
  strengths: string[];
  improvements: string[];
  suggestedActions: string[];
  isFallback: boolean;
  providerUsed: string;
}

export interface AiChatRefineRequest {
  currentSummary: string;
  userFeedback: string;
  tone?: ToneOption;
}
