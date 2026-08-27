import { Crown } from "lucide-react";
import type { StudentMatrix } from "@/types/matrix";
import MatrixWeekCell from "./MatrixWeekCell";
import { formatProgressiveStudentName } from "../../utils/nameFormatters";

interface MatrixStudentRowProps {
  student: StudentMatrix;
  selectedStudentId: number | null;
  selectedWeekNumber: number | null;
  nameColWidth: number;
  isDuplicateInGroup: boolean;
  onCellClick: (studentId: number, weekNumber: number) => void;
}

export default function MatrixStudentRow({
  student,
  selectedStudentId,
  selectedWeekNumber,
  nameColWidth,
  isDuplicateInGroup,
  onCellClick,
}: MatrixStudentRowProps) {
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

  return (
    <tr className={`hover:bg-primary/5 transition-colors group ${student.isLeader ? "bg-amber-50/20" : "bg-white"}`}>
      {/* Sticky Student Name with Tree Indentation & Dynamic Resizing */}
      <td
        style={{ width: `${nameColWidth}px`, minWidth: `${nameColWidth}px`, maxWidth: `${nameColWidth}px` }}
        className={`px-3 py-2 sticky left-0 group-hover:bg-slate-50/90 z-10 border-r border-slate-200 shadow-xs ${
          student.isLeader ? "bg-amber-50/30" : "bg-white"
        }`}
      >
        <div className="flex items-center gap-2 pl-3 overflow-hidden" title={tooltipText}>
          {/* Tree guide point */}
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
            student.isLeader ? "bg-amber-400" : "bg-slate-300 group-hover:bg-primary"
          }`} />

          {/* Avatar Initials Badge */}
          <div className={`w-6 h-6 rounded-lg font-bold text-[10px] flex items-center justify-center border shrink-0 transition-colors shadow-2xs ${
            student.isLeader
              ? "bg-amber-100/80 text-amber-900 border-amber-300/80"
              : "bg-slate-100 text-slate-600 border-slate-200/80 group-hover:border-primary/40 group-hover:text-primary"
          }`}>
            {initials}
          </div>

          {/* Student Name */}
          <span className="font-bold text-slate-800 text-xs truncate min-w-0 flex-1 block group-hover:text-slate-900">
            {displayName}
          </span>

          {/* Ultra-compact Leader Mini Icon */}
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

      {/* Total Academic Points */}
      <td className="px-3 py-2 text-center w-28 min-w-28 border-r border-slate-200 bg-slate-50/40">
        <span className="font-black text-xs text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md inline-block shadow-2xs">
          {student.totalAcademicPoints}đ
        </span>
      </td>

      {/* Week Cells */}
      {student.weekCells.map((cell) => {
        const isSelected =
          selectedStudentId === student.studentId &&
          selectedWeekNumber === cell.weekNumber;

        return (
          <MatrixWeekCell
            key={cell.weekNumber}
            cell={cell}
            isSelected={isSelected}
            onClick={() => onCellClick(student.studentId, cell.weekNumber)}
          />
        );
      })}
    </tr>
  );
}

