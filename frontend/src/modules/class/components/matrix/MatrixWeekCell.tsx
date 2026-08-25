import type { WeekCell } from "@/types/matrix";

interface MatrixWeekCellProps {
  cell: WeekCell;
  isSelected: boolean;
  onClick: () => void;
}

export default function MatrixWeekCell({ cell, isSelected, onClick }: MatrixWeekCellProps) {
  const hasLogs = cell.logCount > 0;
  const isPositive = cell.netScore > 0;
  const isNegative = cell.netScore < 0;

  return (
    <td
      onClick={onClick}
      className={`px-2 py-2 text-center border-r border-slate-200/80 min-w-28 cursor-pointer transition-all select-none ${
        isSelected
          ? "ring-2 ring-primary bg-primary/5 z-10"
          : "hover:bg-slate-50"
      }`}
      title={`Tuần ${cell.weekNumber}: ${cell.netScore}đ (+${cell.posScore} / ${cell.negScore}) • Nhấp để xem chi tiết`}
    >
      <div
        className={`py-1.5 px-2 rounded-xl border transition-all ${
          isSelected
            ? "border-primary bg-white shadow-xs"
            : hasLogs
            ? isPositive
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-700"
              : isNegative
              ? "bg-rose-50/80 border-rose-200 text-rose-700"
              : "bg-slate-50 border-slate-200 text-slate-700"
            : "bg-slate-50/40 border-slate-100 hover:border-slate-300"
        }`}
      >
        {/* Tier 1: Net Score (14px font-black) */}
        <span
          className={`text-xs font-black block tracking-tight ${
            hasLogs
              ? isPositive
                ? "text-emerald-700"
                : isNegative
                ? "text-rose-600"
                : "text-slate-700"
              : "text-slate-400 font-semibold"
          }`}
        >
          {cell.netScore > 0 ? `+${cell.netScore}` : cell.netScore}
        </span>

        {/* Tier 2: Sub-score (+Pos | -Neg) (10px font-medium) */}
        {hasLogs && (cell.posScore > 0 || cell.negScore < 0) ? (
          <span className="text-[10px] font-semibold block tracking-tight mt-0.5">
            <span className="text-emerald-600">+{cell.posScore}</span>
            <span className="text-slate-300 mx-1">|</span>
            <span className="text-rose-500">{cell.negScore}</span>
          </span>
        ) : (
          <span className="text-[10px] text-slate-300 font-medium block mt-0.5">-</span>
        )}
      </div>
    </td>
  );
}
