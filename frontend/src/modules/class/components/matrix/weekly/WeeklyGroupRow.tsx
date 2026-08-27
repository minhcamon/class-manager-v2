import { ChevronDown, ChevronRight, Crown, Trophy, Medal } from "lucide-react";
import type { WeeklyFocusGroup } from "@/types/matrix";

interface WeeklyGroupRowProps {
  group: WeeklyFocusGroup;
  isExpanded: boolean;
  onToggle: () => void;
  nameColWidth: number;
}

export default function WeeklyGroupRow({
  group,
  isExpanded,
  onToggle,
  nameColWidth,
}: WeeklyGroupRowProps) {
  const leaderShortName = group.leaderName
    ? group.leaderName.trim().split(/\s+/).slice(-2).join(" ")
    : null;

  const totalNet = group.totalGroupNet ?? (group.totalGroupPlus + group.totalGroupMinus);
  const netText = totalNet > 0 ? `+${totalNet}` : `${totalNet}`;

  // Net badge color
  const netBadgeClass =
    totalNet > 0
      ? "bg-emerald-100/90 text-emerald-900 border-emerald-300/80"
      : totalNet < 0
      ? "bg-rose-100/90 text-rose-900 border-rose-300/80"
      : "bg-slate-200/80 text-slate-700 border-slate-300";

  // Rank Badge Render helper
  const renderRankBadge = (rank?: number) => {
    if (!rank) return null;
    if (rank === 1) {
      return (
        <span
          title="Hạng 1 tuần này"
          className="inline-flex items-center gap-1 bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-md border border-amber-500 shadow-2xs shrink-0"
        >
          <Trophy className="w-3 h-3 text-amber-950" />
          <span>Hạng 1</span>
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span
          title="Hạng 2 tuần này"
          className="inline-flex items-center gap-1 bg-slate-300 text-slate-900 font-black text-[10px] px-2 py-0.5 rounded-md border border-slate-400 shadow-2xs shrink-0"
        >
          <Medal className="w-3 h-3 text-slate-700" />
          <span>Hạng 2</span>
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span
          title="Hạng 3 tuần này"
          className="inline-flex items-center gap-1 bg-orange-200 text-orange-950 font-black text-[10px] px-2 py-0.5 rounded-md border border-orange-400 shadow-2xs shrink-0"
        >
          <Medal className="w-3 h-3 text-orange-800" />
          <span>Hạng 3</span>
        </span>
      );
    }
    return (
      <span
        title={`Hạng ${rank} tuần này`}
        className="inline-flex items-center text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-300 shrink-0"
      >
        Hạng {rank}
      </span>
    );
  };

  return (
    <tr
      onClick={onToggle}
      className="bg-slate-100/90 hover:bg-slate-200/80 border-y border-slate-200 transition-colors select-none cursor-pointer group"
    >
      {/* Sticky Group Title */}
      <td
        style={{ width: `${nameColWidth}px`, minWidth: `${nameColWidth}px`, maxWidth: `${nameColWidth}px` }}
        className="px-3 py-2.5 sticky left-0 bg-slate-100 group-hover:bg-slate-200/90 z-10 border-r border-slate-200 shadow-xs"
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
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

            {/* Leader Badge */}
            {leaderShortName && (
              <span
                title={`Tổ trưởng: ${group.leaderName}`}
                className="inline-flex items-center gap-0.5 bg-amber-100/80 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300/60 shrink-0 truncate max-w-27.5"
              >
                <Crown className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                <span className="truncate">{leaderShortName}</span>
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Group Hint with Rank Badge placed side-by-side */}
      <td className="px-4 py-2.5 text-left border-r border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2">
          {renderRankBadge(group.rank)}
          <span className="text-[11px] font-medium text-slate-400 italic">
            {group.students.length > 0
              ? isExpanded
                ? "Nhấp để thu gọn tổ"
                : "Nhấp để xem chi tiết học sinh trong tổ"
              : "Chưa có học sinh trong tổ"}
          </span>
        </div>
      </td>

      {/* Group Total Plus */}
      <td className="px-3 py-2.5 text-right w-20 min-w-20 border-r border-slate-200 bg-slate-100/80">
        <span className="text-xs font-bold text-emerald-700">
          +{group.totalGroupPlus}
        </span>
      </td>

      {/* Group Total Minus */}
      <td className="px-3 py-2.5 text-right w-20 min-w-20 border-r border-slate-200 bg-slate-100/80">
        <span className="text-xs font-bold text-rose-700">
          {group.totalGroupMinus}
        </span>
      </td>

      {/* Group Net Total Points */}
      <td className="px-3 py-2.5 text-center w-24 min-w-24 border-r border-slate-200 bg-slate-100/80">
        <span className={`text-xs font-black px-2 py-0.5 rounded-md border inline-block shadow-2xs ${netBadgeClass}`}>
          {netText}đ
        </span>
      </td>

      {/* Empty Action cell */}
      <td className="px-2 py-2.5 text-center w-20 min-w-20 bg-slate-100/80" />
    </tr>
  );
}
