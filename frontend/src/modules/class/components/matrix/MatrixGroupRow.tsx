import { ChevronDown, ChevronRight } from "lucide-react";
import type { GroupMatrix } from "@/types/matrix";

interface MatrixGroupRowProps {
  group: GroupMatrix;
  isExpanded: boolean;
  onToggle: () => void;
  weekCount: number;
}

export default function MatrixGroupRow({
  group,
  isExpanded,
  onToggle,
  weekCount,
}: MatrixGroupRowProps) {
  return (
    <tr
      onClick={onToggle}
      className="bg-slate-100/90 hover:bg-slate-200/80 border-y border-slate-200 transition-colors select-none cursor-pointer group"
    >
      {/* Sticky Group Title */}
      <td className="px-5 py-3 sticky left-0 bg-slate-100 group-hover:bg-slate-200/90 z-10 w-72 min-w-72 border-r border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-white shadow-2xs text-slate-600 group-hover:text-primary transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-900 font-extrabold text-xs tracking-tight">
              {group.groupName}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 bg-white/90 px-2 py-0.5 rounded-full border border-slate-200/60 shadow-2xs">
              {group.students.length} HS
            </span>
          </div>
        </div>
      </td>

      {/* Group Average Score */}
      <td className="px-3 py-3 text-center w-32 min-w-32 border-r border-slate-200 bg-slate-100/80">
        <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 inline-block shadow-2xs">
          TB: {group.groupAvgScore}đ
        </span>
      </td>

      {/* Unified Group Banner span */}
      <td
        colSpan={weekCount}
        className="px-4 py-3 text-left border-r border-slate-200 bg-slate-50/50"
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
