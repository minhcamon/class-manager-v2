import { useEffect, useState } from "react";
import { Medal, Trophy, Loader2 } from "lucide-react";
import weeklyReportService from "@/services/weeklyReportService";
import type { AcademicLeaderboard, WeeklyLeaderboard } from "@/services/weeklyReportService";

interface StudentLeaderboardTabProps {
  classId: number;
  myStudentProfileId?: number;
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center mb-4 border border-border">
        <Icon className="w-7 h-7 text-neutral-300" />
      </div>
      <p className="text-sm font-semibold text-neutral-600">{title}</p>
      <p className="text-xs text-neutral-400 mt-1 max-w-xs">{subtitle}</p>
    </div>
  );
}

export default function StudentLeaderboardTab({ classId, myStudentProfileId }: StudentLeaderboardTabProps) {
  const [leaderboardType, setLeaderboardType] = useState<"weekly" | "academic">("weekly");
  const [academicData, setAcademicData] = useState<AcademicLeaderboard | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyLeaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setIsLoading(true);
      try {
        const [academic, weekly] = await Promise.all([
          weeklyReportService.getAcademicLeaderboard(classId),
          weeklyReportService.getWeeklyLeaderboard(classId)
        ]);
        setAcademicData(academic);
        setWeeklyData(weekly);
      } catch (e) {
        console.error("Failed to fetch leaderboards on student view", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboards();
  }, [classId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-primary w-6 h-6" />
      </div>
    );
  }

  const entries = leaderboardType === "weekly" 
    ? (weeklyData?.students || []) 
    : (academicData?.students || []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = ["h-20", "h-28", "h-14"];
  const podiumColors = ["bg-[#E2E8F0] text-slate-700", "bg-[#FCD34D] text-amber-950", "bg-[#FDBA74] text-orange-950"];
  const medalColors = ["text-slate-400", "text-amber-500", "text-orange-400"];

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="flex justify-between items-center bg-neutral-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setLeaderboardType("weekly")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            leaderboardType === "weekly"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Bảng thi đua tuần này
        </button>
        <button
          onClick={() => setLeaderboardType("academic")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            leaderboardType === "academic"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Bảng điểm năm học
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border shadow-sm">
          <EmptyState
            icon={Trophy}
            title="Bảng xếp hạng chưa có dữ liệu"
            subtitle="Xếp hạng của lớp sẽ được hiển thị sau khi hệ thống có điểm thi đua."
          />
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6 text-center">
                Top 3 xuất sắc nhất
              </p>
              <div className="flex items-end justify-center gap-4">
                {podiumOrder.map((entry, i) => {
                  if (!entry) return null;
                  const isCurrent = entry.studentId === myStudentProfileId;
                  const podiumIndex = top3.length >= 3 ? (i === 0 ? 1 : i === 1 ? 0 : 2) : i;
                  return (
                    <div key={entry.studentId} className="flex flex-col items-center gap-2">
                      <Medal className={`w-5 h-5 ${medalColors[podiumIndex]}`} />
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                          isCurrent
                            ? "bg-primary text-white border-primary"
                            : "bg-neutral-100 text-neutral-600 border-neutral-200"
                        }`}
                      >
                        {entry.name.split(" ").pop()?.substring(0, 2).toUpperCase()}
                      </div>
                      <p className={`text-xs font-bold max-w-[70px] text-center truncate ${isCurrent ? "text-primary" : "text-neutral-700"}`}>
                        {entry.name.split(" ").pop()}
                      </p>
                      <div className={`${podiumHeights[podiumIndex]} ${podiumColors[podiumIndex]} w-20 rounded-t-xl flex flex-col items-center justify-center gap-1`}>
                        <span className="text-lg font-black">#{entry.rank}</span>
                        <span className="text-xs font-bold opacity-80">{entry.score}đ</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Table */}
          {rest.length > 0 && (
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-border">
                    <th className="text-center px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest w-16">Hạng</th>
                    <th className="text-left px-4 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Học sinh</th>
                    <th className="text-left px-4 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Tổ</th>
                    <th className="text-center px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((entry) => {
                    const isCurrent = entry.studentId === myStudentProfileId;
                    return (
                      <tr
                        key={entry.studentId}
                        className={`border-b border-border/50 transition-colors ${
                          isCurrent ? "bg-primary-light/60 hover:bg-primary-light" : "hover:bg-neutral-50/60"
                        }`}
                      >
                        <td className="px-5 py-3.5 text-center font-black text-neutral-500">#{entry.rank}</td>
                        <td className="px-4 py-3.5">
                          <span className={`font-semibold ${isCurrent ? "text-primary" : "text-neutral-800"}`}>
                            {entry.name}
                            {isCurrent && (
                              <span className="ml-2 text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">Bạn</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-neutral-500 font-medium">{entry.groupName}</td>
                        <td className="px-5 py-3.5 text-center font-black text-neutral-900">{entry.score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
