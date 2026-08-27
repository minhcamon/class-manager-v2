import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import type { WeeklyStudentLog } from "@/types/matrix";

interface WeeklyBehaviorChipsProps {
  logs: WeeklyStudentLog[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onQuickAdd?: () => void;
  disabled?: boolean;
}

export default function WeeklyBehaviorChips({
  logs,
  isExpanded,
  onToggleExpand,
  onQuickAdd,
  disabled = false,
}: WeeklyBehaviorChipsProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="flex items-center justify-between gap-2 py-1">
        <span className="text-xs text-slate-400 italic">Chưa có ghi nhận trong tuần</span>
        {!disabled && onQuickAdd && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd();
            }}
            title="Thêm điểm / vi phạm nhanh"
            className="p-1 rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  const visibleLogs = isExpanded ? logs : logs.slice(0, 2);
  const hiddenCount = logs.length - 2;

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-0.5 min-h-[30px]">
      {visibleLogs.map((log) => {
        const isBonus = log.pointValue > 0;
        const badgeClass = isBonus
          ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70"
          : "bg-rose-50 text-rose-800 border-rose-200/80 hover:bg-rose-100/70";

        const pointText = isBonus ? `+${log.pointValue}` : `${log.pointValue}`;

        return (
          <span
            key={log.id}
            title={`${log.reason} (${pointText}đ) • ${log.createdByName || "GV"}`}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border shadow-2xs transition-all max-w-[260px] truncate select-none ${badgeClass}`}
          >
            {log.dayOfWeek && (
              <span className="font-bold text-[10px] opacity-75 shrink-0">
                [{log.dayOfWeek}]
              </span>
            )}
            <span className="truncate">{log.reason}</span>
            <span className="font-extrabold text-[10px] ml-0.5 shrink-0">
              ({pointText})
            </span>
          </span>
        );
      })}

      {/* Accordion badge for hidden items */}
      {!isExpanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <span>+{hiddenCount} mục khác</span>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </button>
      )}

      {/* Collapse button when expanded */}
      {isExpanded && logs.length > 2 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span>Thu gọn</span>
          <ChevronUp className="w-3 h-3" />
        </button>
      )}

      {/* Quick Add Inline Button */}
      {!disabled && onQuickAdd && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd();
          }}
          title="Thêm điểm / vi phạm nhanh"
          className="p-1 rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
