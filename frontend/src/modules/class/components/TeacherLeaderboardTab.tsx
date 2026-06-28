/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  ListOrdered, 
  RefreshCw 
} from "lucide-react";
import weeklyReportService from "@/services/weeklyReportService";
import type { AcademicLeaderboard, WeeklyLeaderboard } from "@/services/weeklyReportService";

interface TeacherLeaderboardTabProps {
  classId: string;
  refreshTrigger?: number;
}

export default function TeacherLeaderboardTab({ classId, refreshTrigger }: TeacherLeaderboardTabProps) {
  const [leaderboardType, setLeaderboardType] = useState<"academic" | "weekly">("weekly");
  const [academicData, setAcademicData] = useState<AcademicLeaderboard | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyLeaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboards = useCallback(async () => {
    if (!classId) return;
    setIsLoading(true);
    try {
      const classIdInt = parseInt(classId);
      const [academic, weekly] = await Promise.all([
        weeklyReportService.getAcademicLeaderboard(classIdInt),
        weeklyReportService.getWeeklyLeaderboard(classIdInt)
      ]);
      setAcademicData(academic);
      setWeeklyData(weekly);
    } catch (e) {
      console.error("Failed to fetch leaderboards", e);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchLeaderboards();
  }, [fetchLeaderboards, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
        <span className="ml-2 text-sm text-neutral-500">Đang tải bảng xếp hạng...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Leaderboard toggle */}
      <div className="flex justify-between items-center bg-neutral-50 p-2 rounded-xl border border-border">
        <div className="flex gap-1">
          <button
            onClick={() => setLeaderboardType("weekly")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              leaderboardType === "weekly"
                ? "bg-white text-primary shadow-sm border border-border"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" />
            Điểm tuần hiện tại
          </button>
          <button
            onClick={() => setLeaderboardType("academic")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              leaderboardType === "academic"
                ? "bg-white text-primary shadow-sm border border-border"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 inline mr-1.5" />
            Tổng điểm năm học
          </button>
        </div>

        <button
          onClick={fetchLeaderboards}
          className="p-2 text-neutral-400 hover:text-neutral-700 cursor-pointer rounded-lg hover:bg-neutral-100 transition-colors"
          title="Làm mới bảng xếp hạng"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student standings (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-neutral-50/50">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2 text-base">
                <Users className="w-4 h-4 text-primary" />
                Thành tích học sinh
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-6">Thứ hạng</th>
                    <th className="py-3 px-6">Học sinh</th>
                    <th className="py-3 px-6">Tổ</th>
                    <th className="py-3 px-6 text-right">Điểm thi đua</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardType === "weekly" ? (
                    weeklyData?.students && weeklyData.students.length > 0 ? (
                      weeklyData.students.map((student) => (
                        <tr key={student.studentId} className="border-b border-border hover:bg-neutral-50/50">
                          <td className="py-4.5 px-6 font-medium">
                            {student.rank === 1 && <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 border border-amber-500/20">🥇 Hạng 1</span>}
                            {student.rank === 2 && <span className="px-2 py-0.5 rounded-full text-xs font-black bg-slate-400/10 text-slate-500 border border-slate-400/20">🥈 Hạng 2</span>}
                            {student.rank === 3 && <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-700/10 text-amber-800 border border-amber-700/20">🥉 Hạng 3</span>}
                            {student.rank > 3 && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-500">#{student.rank}</span>}
                          </td>
                          <td className="py-4.5 px-6 font-bold text-neutral-800">{student.name}</td>
                          <td className="py-4.5 px-6 text-neutral-500 font-medium">{student.groupName}</td>
                          <td className={`py-4.5 px-6 text-right font-black ${student.score > 0 ? "text-success-text" : student.score < 0 ? "text-error" : "text-neutral-500"}`}>
                            {student.score > 0 ? `+${student.score}` : student.score}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-neutral-400 font-medium">Không có dữ liệu thi đua tuần này.</td>
                      </tr>
                    )
                  ) : (
                    academicData?.students && academicData.students.length > 0 ? (
                      academicData.students.map((student) => (
                        <tr key={student.studentId} className="border-b border-border hover:bg-neutral-50/50">
                          <td className="py-4.5 px-6 font-medium">
                            {student.rank === 1 && <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 border border-amber-500/20">🥇 Hạng 1</span>}
                            {student.rank === 2 && <span className="px-2 py-0.5 rounded-full text-xs font-black bg-slate-400/10 text-slate-500 border border-slate-400/20">🥈 Hạng 2</span>}
                            {student.rank === 3 && <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-700/10 text-amber-800 border border-amber-700/20">🥉 Hạng 3</span>}
                            {student.rank > 3 && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-500">#{student.rank}</span>}
                          </td>
                          <td className="py-4.5 px-6 font-bold text-neutral-800">{student.name}</td>
                          <td className="py-4.5 px-6 text-neutral-500 font-medium">{student.groupName}</td>
                          <td className="py-4.5 px-6 text-right font-black text-primary">{student.score}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-neutral-400 font-medium">Không có dữ liệu tổng kết niên khóa.</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Group standings (Span 1) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-neutral-50/50">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2 text-base">
                <GraduationCap className="w-4 h-4 text-primary" />
                Xếp hạng Tổ
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-6">Hạng</th>
                    <th className="py-3 px-6">Tổ</th>
                    <th className="py-3 px-6 text-right">Điểm TB</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardType === "weekly" ? (
                    weeklyData?.groups && weeklyData.groups.length > 0 ? (
                      weeklyData.groups.map((group) => (
                        <tr key={group.groupId} className="border-b border-border hover:bg-neutral-50/50">
                          <td className="py-4.5 px-6 font-bold">
                            {group.rank === 1 && <span className="text-amber-500">🏆 1</span>}
                            {group.rank > 1 && `#${group.rank}`}
                          </td>
                          <td className="py-4.5 px-6 font-bold text-neutral-800">{group.name}</td>
                          <td className={`py-4.5 px-6 text-right font-black ${group.score > 0 ? "text-success-text" : group.score < 0 ? "text-error" : "text-neutral-500"}`}>
                            {group.score > 0 ? `+${group.score}` : group.score}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-neutral-400 font-medium">Không có dữ liệu tổ.</td>
                      </tr>
                    )
                  ) : (
                    academicData?.groups && academicData.groups.length > 0 ? (
                      academicData.groups.map((group) => (
                        <tr key={group.groupId} className="border-b border-border hover:bg-neutral-50/50">
                          <td className="py-4.5 px-6 font-bold">
                            {group.rank === 1 && <span className="text-amber-500">🏆 1</span>}
                            {group.rank > 1 && `#${group.rank}`}
                          </td>
                          <td className="py-4.5 px-6 font-bold text-neutral-800">{group.name}</td>
                          <td className="py-4.5 px-6 text-right font-black text-primary">{group.score}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-neutral-400 font-medium">Không có dữ liệu tổ.</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
