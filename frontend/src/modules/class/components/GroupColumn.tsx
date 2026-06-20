import { Users } from "lucide-react";
import type { Group } from "@/types/group";
import type { ClassStudentResponse } from "@/types/studentProfile";
import StudentCard from "./StudentCard";

interface GroupColumnProps {
  title: string;
  students: ClassStudentResponse[];
  group?: Group;
  onConfigureStudent: (student: ClassStudentResponse) => void;
}

export default function GroupColumn({
  title,
  students,
  group,
  onConfigureStudent,
}: GroupColumnProps) {
  const isUnassigned = !group;
  const hasLeader = group && group.leaderStudentId !== null;

  return (
    <div
      className={`w-76 sm:w-80 shrink-0 rounded-2xl border p-4 shadow-sm flex flex-col max-h-[600px] transition-shadow ${
        isUnassigned
          ? "bg-neutral-50 border-border/80"
          : "bg-white border-border hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start mb-2 pb-2 border-b border-border">
        <div className="space-y-0.5">
          <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
            {isUnassigned ? (
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-400 shrink-0"></div>
            ) : (
              <Users className="w-4 h-4 text-primary shrink-0" />
            )}
            {title}
          </h3>
          {!isUnassigned && (
            <p className="text-[10px] text-neutral-400">
              {hasLeader ? `Tổ trưởng: ${group.leaderName}` : "Chưa có tổ trưởng"}
            </p>
          )}
        </div>
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
            isUnassigned ? "bg-neutral-200 text-neutral-600" : "bg-primary-light text-primary"
          }`}
        >
          {students.length}
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[100px] mt-2">
        {students.length === 0 ? (
          <div className="text-center py-10 text-neutral-400 text-xs italic">
            {isUnassigned ? "Không còn học sinh tự do" : "Không có học sinh trong Tổ"}
          </div>
        ) : (
          students.map((student) => (
            <StudentCard
              key={student.studentProfileId}
              student={student}
              onConfigure={onConfigureStudent}
            />
          ))
        )}
      </div>
    </div>
  );
}
