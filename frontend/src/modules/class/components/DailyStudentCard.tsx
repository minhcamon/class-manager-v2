import { Crown, Check } from "lucide-react";
import type { ClassStudentResponse } from "@/types/studentProfile";

interface DailyStudentCardProps {
  student: ClassStudentResponse;
  isSelected: boolean;
  onToggle: () => void;
}

export default function DailyStudentCard({ student, isSelected, onToggle }: DailyStudentCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${
        isSelected
          ? "bg-primary-light border-primary shadow-sm ring-1 ring-primary/10"
          : "bg-white border-border hover:border-neutral-300"
      }`}
    >
      <div className="space-y-0.5 max-w-[80%]">
        <div className="flex items-center gap-1">
          <p className="font-bold text-neutral-900 text-sm truncate">{student.fullName}</p>
          {student.isLeader && (
            <span title="Tổ trưởng">
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            </span>
          )}
        </div>
        <p className="text-[10px] text-neutral-400 truncate">
          {student.groupName || "Chưa chia tổ"}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
          student.currentPoint > 100 
            ? "bg-success-light text-success-text" 
            : student.currentPoint < 100 
            ? "bg-danger-light text-danger-text" 
            : "bg-primary-light text-primary"
        }`}>
          {student.currentPoint}đ
        </span>
        
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
          isSelected 
            ? "bg-primary border-primary text-white" 
            : "bg-neutral-50 border-neutral-300"
        }`}>
          {isSelected && <Check className="w-3 h-3 stroke-3" />}
        </div>
      </div>
    </div>
  );
}
