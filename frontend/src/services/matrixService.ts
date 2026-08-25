import api from "@/lib/axios";
import type { APIResponse } from "./authService";
import type { MatrixBoardResponse } from "@/types/matrix";

export interface MatrixBoardParams {
  academicYear?: number;
  semester?: number;
  fromWeek?: number;
  toWeek?: number;
}

const matrixService = {
  getMatrixBoard: async (classId: number, params?: MatrixBoardParams): Promise<MatrixBoardResponse> => {
    const response = await api.get<APIResponse<MatrixBoardResponse>>(
      `/classes/${classId}/matrix-board`,
      { params }
    );
    return response.data.data;
  },
};

export default matrixService;
