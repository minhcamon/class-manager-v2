import { Crown, Settings } from "lucide-react";
import type { ClassStudentResponse } from "@/types/studentProfile";

interface StudentCardProps {
  student: ClassStudentResponse;
  onConfigure: (student: ClassStudentResponse) => void;
}

export default function StudentCard({ student, onConfigure }: StudentCardProps) {
  return (
    <div
      className={`rounded-xl border p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
        student.isLeader
          ? "bg-amber-50/40 border-amber-200 hover:border-amber-300"
          : "bg-white border-border hover:border-primary/20"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-bold text-neutral-900 text-sm leading-tight">{student.fullName}</p>
            {student.isLeader && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <Crown className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                Tổ trưởng
              </span>
            )}
          </div>
          <p className="text-[10px] text-neutral-400 font-mono">@{student.username}</p>
        </div>

        <button
          onClick={() => onConfigure(student)}
          className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-neutral-100">
        <span className="text-[10px] text-neutral-400">{student.phoneNumber || "Không số điện thoại"}</span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
            student.currentPoint > 100
              ? "bg-success-light text-success-text"
              : student.currentPoint < 100
              ? "bg-danger-light text-danger-text"
              : "bg-primary-light text-primary"
          }`}
        >
          {student.currentPoint}đ
        </span>
      </div>
    </div>
  );
}
