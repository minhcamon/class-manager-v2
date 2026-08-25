import { X, Calendar } from "lucide-react";

interface DrawerHeaderProps {
  studentName?: string;
  groupName?: string;
  academicYear: number;
  weekNumber: number;
  onClose: () => void;
}

export default function DrawerHeader({
  studentName = "Chi tiết học sinh",
  groupName = "Chưa phân tổ",
  academicYear,
  weekNumber,
  onClose,
}: DrawerHeaderProps) {
  return (
    <div className="p-6 border-b border-border bg-neutral-50/80 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
            {studentName}
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-200/80 text-neutral-700">
            {groupName}
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Tuần {weekNumber} • Năm học {academicYear}
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-2 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-200/60 transition-colors cursor-pointer"
        title="Đóng"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
