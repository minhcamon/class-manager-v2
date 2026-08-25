import type { StudentMatrix } from "@/types/matrix";
import MatrixWeekCell from "./MatrixWeekCell";

interface MatrixStudentRowProps {
  student: StudentMatrix;
  selectedStudentId: number | null;
  selectedWeekNumber: number | null;
  onCellClick: (studentId: number, weekNumber: number) => void;
}

export default function MatrixStudentRow({
  student,
  selectedStudentId,
  selectedWeekNumber,
  onCellClick,
}: MatrixStudentRowProps) {
  // Initials for avatar
  const initials = student.studentName
    ? student.studentName.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase()
    : "HS";

  return (
    <tr className="hover:bg-primary/5 transition-colors group bg-white">
      {/* Sticky Student Name with Tree Indentation */}
      <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-slate-50/90 z-10 w-72 min-w-72 border-r border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 pl-5">
          {/* Tree guide point */}
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-primary transition-colors shrink-0" />

          {/* Avatar Initials Badge */}
          <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center border border-slate-200/80 shrink-0 group-hover:border-primary/40 group-hover:text-primary transition-colors shadow-2xs">
            {initials}
          </div>

          <span className="font-bold text-slate-800 text-xs truncate max-w-44 block group-hover:text-slate-900">
            {student.studentName}
          </span>
        </div>
      </td>

      {/* Total Academic Points */}
      <td className="px-3 py-3 text-center w-32 min-w-32 border-r border-slate-200 bg-slate-50/40">
        <span className="font-black text-xs text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg inline-block shadow-2xs">
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
