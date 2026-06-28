/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import pointService from "@/services/pointService";
import weeklyReportService from "@/services/weeklyReportService";
import type { Class } from "@/types/class";
import type { PointLog } from "@/types/pointLog";
import type { WeeklyHistory } from "@/services/weeklyReportService";

type ScorePeriod = "week" | "month" | "semester" | "year";

const PERIOD_LABELS: Record<ScorePeriod, string> = {
  week: "Tuần này",
  month: "Tháng này",
  semester: "Học kì",
  year: "Năm học",
};

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

interface StudentScoreTabProps {
  classData: Class;
  studentProfileId?: number;
}

export default function StudentScoreTab({ classData, studentProfileId }: StudentScoreTabProps) {
  const [period, setPeriod] = useState<ScorePeriod>("week");
  const [allLogs, setAllLogs] = useState<PointLog[]>([]);
  const [history, setHistory] = useState<WeeklyHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentProfileId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    Promise.all([
      pointService.getPointLogs(studentProfileId),
      weeklyReportService.getMyHistory(classData.id)
    ])
      .then(([logs, historyData]) => {
        setAllLogs(logs);
        setHistory(historyData);
      })
      .catch((e) => {
        console.error("Failed to load student scores/history details", e);
      })
      .finally(() => setIsLoading(false));
  }, [studentProfileId, classData.id]);

  // Filter logs based on selected period
  const now = new Date();
  const filteredLogs = allLogs.filter((log) => {
    const logDate = new Date(log.weekStartDate);
    if (period === "week") {
      // Same week as now (Monday-based)
      const startOfWeek = new Date(now);
      const day = now.getDay();
      startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return logDate >= startOfWeek && logDate <= endOfWeek;
    } else if (period === "month") {
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    } else if (period === "semester") {
      const currentMonth = now.getMonth();
      const semesterStart = currentMonth < 6 ? 0 : 6; // Jan-Jun or Jul-Dec
      return logDate.getFullYear() === now.getFullYear() && logDate.getMonth() >= semesterStart && logDate.getMonth() < semesterStart + 6;
    } else {
      return logDate.getFullYear() === now.getFullYear();
    }
  });

  const basePoint = period === "year" ? classData.basePoint : 0;
  const totalDelta = filteredLogs.reduce((acc, log) => acc + log.pointValue, 0);

  return (
    <div className="space-y-6">
      {/* Period filter */}
      <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl w-fit">
        {(Object.keys(PERIOD_LABELS) as ScorePeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              period === p
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5 text-center">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Điểm cơ sở
          </p>
          <p className="text-3xl font-black text-neutral-900">{basePoint}</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5 text-center">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Điều chỉnh
          </p>
          <p className={`text-3xl font-black ${totalDelta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {totalDelta >= 0 ? `+${totalDelta}` : totalDelta}
          </p>
        </div>
        <div className="bg-primary rounded-2xl p-5 text-center">
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">
            Tổng điểm
          </p>
          <p className="text-3xl font-black text-white">{basePoint + totalDelta}</p>
        </div>
      </div>

      {/* Score table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary w-6 h-6" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Chưa có dữ liệu điểm"
            subtitle={`Chưa có điểm thi đua nào được ghi nhận cho ${PERIOD_LABELS[period].toLowerCase()}.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-border">
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest w-8">STT</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Lý do</th>
                  <th className="text-center px-4 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Điểm</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Ghi bởi</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-neutral-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-neutral-400 font-medium">{i + 1}</td>
                    <td className="px-5 py-3.5 font-semibold text-neutral-800">{log.reason}</td>
                    <td className={`px-4 py-3.5 text-center font-bold ${log.pointValue >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {log.pointValue >= 0 ? `+${log.pointValue}` : log.pointValue}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500 text-xs">{log.createdByName}</td>
                    <td className="px-5 py-3.5 text-neutral-400 text-xs">{log.weekStartDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Weekly performance history section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Lịch sử chốt tuần thi đua
        </h3>
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary w-6 h-6" />
            </div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-neutral-400 text-xs font-semibold">Chưa có tuần thi đua nào được chốt sổ.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-border">
                    <th className="text-left px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Tuần bắt đầu</th>
                    <th className="text-center px-4 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Hạng Lớp</th>
                    <th className="text-center px-4 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Hạng Tổ</th>
                    <th className="text-center px-4 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Điểm chốt</th>
                    <th className="text-center px-4 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Tổng cộng</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.weekStartDate} className="border-b border-border/50 hover:bg-neutral-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-neutral-700 font-bold">{h.weekStartDate}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-neutral-800">
                        {h.classRank !== null ? `#${h.classRank}` : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-neutral-500">
                        {h.groupRank !== null ? `#${h.groupRank}` : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-center font-black text-primary">{h.finalPoint}đ</td>
                      <td className="px-4 py-3.5 text-center text-xs space-x-1.5">
                        <span className="text-success font-bold">+{h.totalBonus}</span>
                        <span className="text-error font-bold">{h.totalPenalty}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
