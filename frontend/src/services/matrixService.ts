import api from "@/lib/axios";
import type { APIResponse } from "./authService";
import type { MatrixBoardResponse, WeeklyFocusResponse } from "@/types/matrix";

export interface MatrixBoardParams {
  academicYear?: number;
  semester?: number;
  fromWeek?: number;
  toWeek?: number;
}

export interface WeeklyFocusParams {
  academicYear?: number;
  weekNumber: number;
}

const matrixService = {
  getMatrixBoard: async (classId: number, params?: MatrixBoardParams): Promise<MatrixBoardResponse> => {
    const response = await api.get<APIResponse<MatrixBoardResponse>>(
      `/classes/${classId}/matrix-board`,
      { params }
    );
    return response.data.data;
  },

  getWeeklyFocusBoard: async (classId: number, params: WeeklyFocusParams): Promise<WeeklyFocusResponse> => {
    const response = await api.get<APIResponse<WeeklyFocusResponse>>(
      `/classes/${classId}/matrix-board/weekly-focus`,
      { params }
    );
    return response.data.data;
  },
};

export default matrixService;

