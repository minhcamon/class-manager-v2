import api from "@/lib/axios";
import type { APIResponse } from "./authService";

export interface StudentRanking {
  rank: number;
  studentId: number;
  name: string;
  groupName: string;
  score: number;
}

export interface GroupRanking {
  rank: number;
  groupId: number;
  name: string;
  score: number;
}

export interface AcademicLeaderboard {
  students: StudentRanking[];
  groups: GroupRanking[];
}

export interface StudentWeeklyRanking {
  rank: number;
  studentId: number;
  name: string;
  groupName: string;
  score: number;
}

export interface GroupWeeklyRanking {
  rank: number;
  groupId: number;
  name: string;
  score: number;
}

export interface WeeklyLeaderboard {
  students: StudentWeeklyRanking[];
  groups: GroupWeeklyRanking[];
}

export interface WeeklyReportEntry {
  studentId: number;
  name: string;
  groupName: string;
  finalPoint: number;
  totalBonus: number;
  totalPenalty: number;
  classRank: number;
  groupRank: number;
}

export interface WeeklyReportDetail {
  weekStartDate: string;
  weekEndDate: string;
  lockedAt: string;
  lockedBy: string;
  entries: WeeklyReportEntry[];
}

export interface WeeklyHistory {
  weekStartDate: string;
  finalPoint: number;
  totalBonus: number;
  totalPenalty: number;
  classRank: number;
  groupRank: number;
}

const weeklyReportService = {
  getAcademicLeaderboard: async (classId: number): Promise<AcademicLeaderboard> => {
    const response = await api.get<APIResponse<AcademicLeaderboard>>("/leaderboard/academic", {
      params: { classId }
    });
    return response.data.data;
  },

  getWeeklyLeaderboard: async (classId: number): Promise<WeeklyLeaderboard> => {
    const response = await api.get<APIResponse<WeeklyLeaderboard>>("/leaderboard/weekly", {
      params: { classId }
    });
    return response.data.data;
  },

  getLockedWeeks: async (classId: number): Promise<string[]> => {
    const response = await api.get<APIResponse<string[]>>("/reports/weeks", {
      params: { classId }
    });
    return response.data.data;
  },

  getWeeklyReport: async (classId: number, week: string): Promise<WeeklyReportDetail> => {
    const response = await api.get<APIResponse<WeeklyReportDetail>>(`/reports/weeks/${week}`, {
      params: { classId }
    });
    return response.data.data;
  },

  getMyHistory: async (classId: number): Promise<WeeklyHistory[]> => {
    const response = await api.get<APIResponse<WeeklyHistory[]>>("/me/history", {
      params: { classId }
    });
    return response.data.data;
  },

  closeWeek: async (classId: number, weekStartDate: string): Promise<void> => {
    await api.post<APIResponse<void>>("/weeks/close", {
      classId,
      weekStartDate
    });
  }
};

export default weeklyReportService;
