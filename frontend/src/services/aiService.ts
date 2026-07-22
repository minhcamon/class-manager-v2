import api from "@/lib/axios";
import type { APIResponse } from "@/services/authService";
import type { AiReportRequest, AiReportResponse, AiChatRefineRequest } from "@/types/ai";

const aiService = {
  generateWeeklySummary: async (request: AiReportRequest): Promise<AiReportResponse> => {
    const response = await api.post<APIResponse<AiReportResponse>>("/ai/weekly-summary", request);
    return response.data.data;
  },

  refineSummary: async (request: AiChatRefineRequest): Promise<string> => {
    const response = await api.post<APIResponse<string>>("/ai/chat-refine", request);
    return response.data.data;
  }
};

export default aiService;
