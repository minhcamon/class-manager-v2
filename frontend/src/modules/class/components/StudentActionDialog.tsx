import { Crown, UserMinus, UserCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Group } from "@/types/group";
import type { ClassStudentResponse } from "@/types/studentProfile";

interface StudentActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: ClassStudentResponse | null;
  groups: Group[];
  onAssignLeader: (groupId: number, studentProfileId: number) => Promise<void>;
  onMoveGroup: (studentProfileId: number, groupId: number | null) => Promise<void>;
  isUpdating: boolean;
}

export default function StudentActionDialog({
  isOpen,
  onOpenChange,
  student,
  groups,
  onAssignLeader,
  onMoveGroup,
  isUpdating,
}: StudentActionDialogProps) {
  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Thiết Lập Thành Viên
          </DialogTitle>
          <DialogDescription className="text-neutral-500 text-sm">
            Cập nhật phân Tổ và chức vụ cho học sinh <strong>{student.fullName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Current Info */}
          <div className="bg-neutral-50 rounded-xl p-3 border border-border text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-neutral-400 font-bold uppercase tracking-wider font-sans">
                Học sinh:
              </span>
              <span className="font-bold text-neutral-800">
                {student.fullName} (@{student.username})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 font-bold uppercase tracking-wider font-sans">
                Tổ hiện tại:
              </span>
              <span className="font-semibold text-neutral-800">{student.groupName || "Chưa phân tổ"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 font-bold uppercase tracking-wider font-sans">
                Chức vụ:
              </span>
              <span className="font-semibold text-neutral-800">
                {student.isLeader ? "Tổ trưởng" : "Thành viên thường"}
              </span>
            </div>
          </div>

          {/* Section 1: Assign Leader (Crown) */}
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block font-sans">
              Bổ nhiệm chức vụ
            </span>
            {student.groupId === null ? (
              <p className="text-xs text-neutral-400 italic">
                Cần đưa học sinh vào một Tổ trước khi bổ nhiệm làm Tổ trưởng.
              </p>
            ) : student.isLeader ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <Crown className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                Học sinh đã là Tổ trưởng của {student.groupName}.
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => onAssignLeader(student.groupId!, student.studentProfileId)}
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-2 border-amber-200 text-amber-800 hover:bg-amber-50 hover:border-amber-300 font-semibold cursor-pointer"
                size="sm"
              >
                <Crown className="w-4 h-4 text-amber-600 fill-amber-100" />
                Bổ nhiệm làm Tổ trưởng
              </Button>
            )}
          </div>

          {/* Section 2: Shift Group */}
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block font-sans">
              Phân Tổ thi đua
            </span>

            <div className="grid grid-cols-2 gap-2">
              {groups.map((g) => {
                const isCurrent = student.groupId === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => !isCurrent && onMoveGroup(student.studentProfileId, g.id)}
                    disabled={isUpdating || isCurrent}
                    className={`p-2.5 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-primary-light border-primary/20 text-primary pointer-events-none"
                        : "bg-white border-border hover:border-primary/20 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="truncate">{g.groupName}</span>
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>}
                  </button>
                );
              })}
            </div>

            {student.groupId !== null && (
              <Button
                variant="outline"
                onClick={() => onMoveGroup(student.studentProfileId, null)}
                disabled={isUpdating}
                className="w-full mt-2 flex items-center justify-center gap-2 border-danger/25 text-danger-text hover:bg-danger-light/50 font-semibold cursor-pointer"
                size="sm"
              >
                <UserMinus className="w-4 h-4" />
                Rút khỏi Tổ ({student.groupName})
              </Button>
            )}
          </div>

          <div className="flex justify-end border-t border-border pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
              className="cursor-pointer"
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
