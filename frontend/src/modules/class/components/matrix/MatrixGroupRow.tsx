import { ChevronDown, ChevronRight, Crown } from "lucide-react";
import type { GroupMatrix } from "@/types/matrix";

interface MatrixGroupRowProps {
  group: GroupMatrix;
  isExpanded: boolean;
  onToggle: () => void;
  weekCount: number;
  nameColWidth: number;
}

export default function MatrixGroupRow({
  group,
  isExpanded,
  onToggle,
  weekCount,
  nameColWidth,
}: MatrixGroupRowProps) {
  // Extract leader short name (e.g. "Nguyễn Tuấn Anh" -> "Tuấn Anh" or "Anh")
  const leaderShortName = group.leaderName
    ? group.leaderName.trim().split(/\s+/).slice(-2).join(" ")
    : null;

  return (
    <tr
      onClick={onToggle}
      className="bg-slate-100/90 hover:bg-slate-200/80 border-y border-slate-200 transition-colors select-none cursor-pointer group"
    >
      {/* Sticky Group Title with Dynamic Width */}
      <td
        style={{ width: `${nameColWidth}px`, minWidth: `${nameColWidth}px`, maxWidth: `${nameColWidth}px` }}
        className="px-3 py-2.5 sticky left-0 bg-slate-100 group-hover:bg-slate-200/90 z-10 border-r border-slate-200 shadow-xs"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1 rounded-lg bg-white shadow-2xs text-slate-600 group-hover:text-primary transition-colors shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
            <span className="text-slate-900 font-extrabold text-xs tracking-tight shrink-0">
              {group.groupName}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 bg-white/90 px-1.5 py-0.2 rounded-full border border-slate-200/60 shadow-2xs shrink-0">
              {group.students.length}
            </span>

            {/* Ultra-compact Group Leader Badge */}
            {leaderShortName && (
              <span
                title={`Tổ trưởng: ${group.leaderName}`}
                className="inline-flex items-center gap-0.5 bg-amber-100/80 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300/60 shrink-0 truncate max-w-[110px]"
              >
                <Crown className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                <span className="truncate">{leaderShortName}</span>
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Group Average Score */}
      <td className="px-3 py-2.5 text-center w-28 min-w-28 border-r border-slate-200 bg-slate-100/80">
        <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 inline-block shadow-2xs">
          {group.groupTotalScore}
        </span>
      </td>

      {/* Unified Group Banner span */}
      <td
        colSpan={weekCount}
        className="px-4 py-2.5 text-left border-r border-slate-200 bg-slate-50/50"
      >
        <span className="text-[11px] font-medium text-slate-400 italic">
          {group.students.length > 0
            ? isExpanded
              ? "Nhấp để thu gọn danh sách học sinh"
              : "Nhấp để mở rộng danh sách học sinh"
            : "Chưa có học sinh trong tổ"}
        </span>
      </td>
    </tr>
  );
}

