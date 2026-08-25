import { TrendingUp, TrendingDown, Award } from "lucide-react";

interface WeekSummaryMetricsProps {
  netScore: number;
  totalBonus: number;
  totalPenalty: number;
  totalAcademicPoints: number;
}

export default function WeekSummaryMetrics({
  netScore,
  totalBonus,
  totalPenalty,
  totalAcademicPoints,
}: WeekSummaryMetricsProps) {
  return (
    <div className="space-y-3">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Net score */}
        <div className="bg-neutral-50 border border-border rounded-2xl p-3.5 text-center shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Điểm tuần
          </span>
          <span
            className={`text-xl font-black ${
              netScore > 0
                ? "text-emerald-600"
                : netScore < 0
                ? "text-rose-600"
                : "text-neutral-500"
            }`}
          >
            {netScore > 0 ? `+${netScore}` : netScore}
          </span>
        </div>

        {/* Bonus */}
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 text-center shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3" /> Điểm cộng
          </span>
          <span className="text-xl font-black text-emerald-700">
            +{totalBonus}
          </span>
        </div>

        {/* Penalty */}
        <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3.5 text-center shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center justify-center gap-1 mb-1">
            <TrendingDown className="w-3 h-3" /> Điểm trừ
          </span>
          <span className="text-xl font-black text-rose-700">
            {totalPenalty}
          </span>
        </div>
      </div>

      {/* Cumulative Academic Points Bar */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-primary-dark">
        <span className="font-semibold flex items-center gap-1.5 text-neutral-700">
          <Award className="w-4 h-4 text-primary" />
          Tổng điểm tích lũy năm học:
        </span>
        <span className="font-extrabold text-sm text-neutral-900">
          {totalAcademicPoints}đ
        </span>
      </div>
    </div>
  );
}
