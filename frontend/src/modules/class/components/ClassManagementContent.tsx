import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, BookOpen, GraduationCap, Award, Building, Calendar, Info } from "lucide-react";
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

interface ClassManagementContentProps {
  classData: Class;
  onClassEnded: () => void;
}

export default function ClassManagementContent({ classData, onClassEnded }: ClassManagementContentProps) {
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
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col gap-1.5 border-b border-border pb-5">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          <BookOpen className="text-primary w-8 h-8" />
          Quản Lý Lớp Học
        </h1>
        <p className="text-neutral-500 text-sm">
          Thông tin chi tiết và thiết lập cho lớp học chủ nhiệm hiện tại của bạn.
        </p>
      </div>

      {/* Class Details Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Details Card */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-light text-success-text border border-success/15 uppercase tracking-wide">
                  Đang hoạt động
                </span>
                <h2 className="text-4xl font-extrabold text-neutral-900 tracking-tight mt-2.5">
                  Lớp {classData.className}
                </h2>
              </div>
              
              <div className="p-3 bg-primary-light rounded-xl border border-primary-border/40">
                <GraduationCap className="text-primary w-8 h-8" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-t border-border/60 pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg text-neutral-500">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Khối lớp</p>
                  <p className="text-sm font-semibold text-neutral-900">Khối {classData.grade}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg text-neutral-500">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Điểm mặc định tuần</p>
                  <p className="text-sm font-semibold text-neutral-900">{classData.basePoint} điểm</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg text-neutral-500">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Trường học</p>
                  <p className="text-sm font-semibold text-neutral-900 truncate max-w-[200px]" title={classData.schoolName}>
                    {classData.schoolName || "Chưa kết nối"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg text-neutral-500">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Ngày tạo</p>
                  <p className="text-sm font-semibold text-neutral-900">
                    {new Date(classData.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Panel */}
        <div className="bg-primary-light/40 border border-primary-border/30 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-neutral-900 flex items-center gap-2">
              <Info className="text-primary w-5 h-5" />
              Lưu ý vận hành
            </h3>
            <ul className="space-y-3 text-sm text-neutral-600 leading-relaxed list-disc list-inside">
              <li>Mỗi giáo viên chỉ được phép có duy nhất <strong>1 lớp học ACTIVE</strong> tại một thời điểm.</li>
              <li>Điểm mặc định tuần được dùng làm điểm khởi đầu cho thi đua học sinh mỗi tuần mới.</li>
              <li>Bạn có thể cấu hình mẫu sơ yếu lý lịch động để thu thập dữ liệu học sinh trong lớp.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Danger Zone */}
      <div className="bg-danger-light/30 border border-danger/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-danger-light text-danger-text rounded-xl border border-danger/10">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-neutral-900">Vùng nguy hiểm</h3>
            <p className="text-sm text-neutral-600">
              Kết thúc niên khóa hoặc lớp học hiện tại. Hành động này sẽ đóng băng toàn bộ thông tin.
            </p>
          </div>
        </div>

        <div className="border-t border-danger/5 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-xs text-neutral-500 max-w-lg">
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
