import { useState } from "react";
import { Crown, Pencil } from "lucide-react";
import type { WeeklyFocusStudent } from "@/types/matrix";
import { formatProgressiveStudentName } from "../../../utils/nameFormatters";
import WeeklyBehaviorChips from "./WeeklyBehaviorChips";
import InlineQuickScoringPopover from "./InlineQuickScoringPopover";

interface WeeklyStudentRowProps {
  student: WeeklyFocusStudent;
  index: number;
  nameColWidth: number;
  isDuplicateInGroup: boolean;
  isGlobalExpanded: boolean;
  weekStartDate: string;
  isLocked: boolean;
  onOpenDrawer: (studentId: number) => void;
  onRefresh: () => void;
}

export default function WeeklyStudentRow({
  student,
  nameColWidth,
  isDuplicateInGroup,
  isGlobalExpanded,
  weekStartDate,
  isLocked,
  onOpenDrawer,
  onRefresh,
}: WeeklyStudentRowProps) {
  const [rowExpanded, setRowExpanded] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Initials for avatar
  const initials = student.studentName
    ? student.studentName.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase()
    : "HS";

  // Formatted progressive student name
  const displayName = formatProgressiveStudentName(
    student.studentName,
    nameColWidth,
    isDuplicateInGroup
  );

  const tooltipText = student.isLeader
    ? `${student.studentName} (👑 Tổ trưởng) • #${student.studentId}`
    : `${student.studentName} • #${student.studentId}`;

  // Net score visual styling
  const netBadgeClass =
    student.netScore > 0
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : student.netScore < 0
      ? "bg-rose-100 text-rose-800 border-rose-300"
      : "bg-slate-100 text-slate-600 border-slate-200";

  const netText =
    student.netScore > 0 ? `+${student.netScore}` : `${student.netScore}`;

  const isItemExpanded = isGlobalExpanded || rowExpanded;

  return (
    <tr
      onDoubleClick={() => onOpenDrawer(student.studentId)}
      className={`hover:bg-primary/5 transition-colors group relative ${
        student.isLeader ? "bg-amber-50/20" : "bg-white"
      }`}
    >
      {/* Sticky Student Name with Resizing & Leader Badge */}
      <td
        style={{ width: `${nameColWidth}px`, minWidth: `${nameColWidth}px`, maxWidth: `${nameColWidth}px` }}
        className={`px-3 py-2 sticky left-0 group-hover:bg-slate-50/90 z-10 border-r border-slate-200 shadow-xs ${
          student.isLeader ? "bg-amber-50/30" : "bg-white"
        }`}
      >
        <div className="flex items-center gap-2 pl-3 overflow-hidden" title={tooltipText}>
          {/* Tree guide point */}
          <div
            className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
              student.isLeader ? "bg-amber-400" : "bg-slate-300 group-hover:bg-primary"
            }`}
          />

          {/* Avatar Badge */}
          <div
            className={`w-6 h-6 rounded-lg font-bold text-[10px] flex items-center justify-center border shrink-0 transition-colors shadow-2xs ${
              student.isLeader
                ? "bg-amber-100/80 text-amber-900 border-amber-300/80"
                : "bg-slate-100 text-slate-600 border-slate-200/80 group-hover:border-primary/40 group-hover:text-primary"
            }`}
          >
            {initials}
          </div>

          {/* Name */}
          <span className="font-bold text-slate-800 text-xs truncate min-w-0 flex-1 block group-hover:text-slate-900">
            {displayName}
          </span>

          {/* Leader Crown */}
          {student.isLeader && (
            <span
              title="Tổ trưởng"
              className="p-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300/60 shrink-0"
            >
              <Crown className="w-2.5 h-2.5" />
            </span>
          )}
        </div>
      </td>

      {/* Behavioral Chips & Inline Popover Cell */}
      <td className="px-4 py-2 border-r border-slate-200 relative">
        <WeeklyBehaviorChips
          logs={student.logs}
          isExpanded={isItemExpanded}
          onToggleExpand={() => setRowExpanded((prev) => !prev)}
          onQuickAdd={() => setShowQuickAdd(true)}
          disabled={isLocked}
        />

        {/* Inline Quick Scoring Popover */}
        {showQuickAdd && (
          <InlineQuickScoringPopover
            studentId={student.studentId}
            studentName={student.studentName}
            weekStartDate={weekStartDate}
            onClose={() => setShowQuickAdd(false)}
            onSuccess={() => {
              setShowQuickAdd(false);
              onRefresh();
            }}
          />
        )}
      </td>

      {/* Total Plus (+) */}
      <td className="px-3 py-2 text-right w-20 min-w-20 border-r border-slate-200">
        <span className="text-xs font-bold text-emerald-600">
          {student.totalPlus > 0 ? `+${student.totalPlus}` : "0"}
        </span>
      </td>

      {/* Total Minus (-) */}
      <td className="px-3 py-2 text-right w-20 min-w-20 border-r border-slate-200">
        <span className="text-xs font-bold text-rose-600">
          {student.totalMinus < 0 ? student.totalMinus : "0"}
        </span>
      </td>

      {/* Net Score Badge */}
      <td className="px-3 py-2 text-center w-24 min-w-24 border-r border-slate-200">
        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-black border shadow-2xs ${netBadgeClass}`}>
          {netText}
        </span>
      </td>

      {/* Actions */}
      <td className="px-2 py-2 text-center w-20 min-w-20">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDrawer(student.studentId);
            }}
            title="Xem & Chỉnh sửa chi tiết (Mở Drawer)"
            className="p-1 rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
