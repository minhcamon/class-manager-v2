import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import type { Class } from "@/types/class";
import classService from "@/services/classService";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DangerZoneCardProps {
  classData: Class;
  onClassEnded: () => void;
}

export default function DangerZoneCard({ classData, onClassEnded }: DangerZoneCardProps) {
  const [isEnding, setIsEnding] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleEndClass = async () => {
    setIsEnding(true);
    try {
      await classService.endClass(classData.id);
      toast.success("Kết thúc lớp học thành công!");
      setIsConfirmOpen(false);
      onClassEnded();
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết thúc lớp học. Vui lòng thử lại!");
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <div className="md:col-span-3 bg-danger-light/30 border border-danger/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-danger-light text-danger-text rounded-xl border border-danger/10 shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-neutral-900">Vùng nguy hiểm</h3>
          <p className="text-sm text-neutral-600 font-sans">
            Kết thúc niên khóa hoặc lớp học hiện tại. Hành động này sẽ đóng băng toàn bộ thông tin.
          </p>
        </div>
      </div>

      <div className="border-t border-danger/5 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-xs text-neutral-500 max-w-lg leading-relaxed">
          Sau khi lớp học kết thúc (ENDED), tất cả các bảng điểm thi đua, mẫu sơ yếu lý lịch và danh sách học sinh
          sẽ bị khóa dưới dạng chỉ đọc. Bạn sẽ không thể sửa đổi thông tin nhưng có thể tạo một lớp học mới.
        </p>

        <Button
          variant="destructive"
          onClick={() => setIsConfirmOpen(true)}
          className="w-full sm:w-auto font-semibold cursor-pointer shadow-sm"
        >
          Kết thúc lớp học
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger-text">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              Xác nhận kết thúc lớp học?
            </DialogTitle>
            <DialogDescription className="text-neutral-500 text-sm mt-2">
              Bạn có chắc chắn muốn kết thúc lớp học <strong>{classData.className}</strong>?
              Hành động này sẽ khóa toàn bộ dữ liệu hiện tại và <strong>không thể hoàn tác</strong>.
              Bạn sẽ có thể bắt đầu tạo một lớp học mới ngay sau đó.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex sm:justify-end gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isEnding}
              className="cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={handleEndClass}
              isLoading={isEnding}
              className="cursor-pointer"
            >
              Xác nhận kết thúc
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
