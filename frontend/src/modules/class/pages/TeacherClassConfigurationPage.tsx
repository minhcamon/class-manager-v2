import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  Settings, 
  ShieldAlert, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Info,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import classService from "@/services/classService";
import type { Class } from "@/types/class";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function TeacherClassConfigurationPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!classId) return;
      setIsLoading(true);
      try {
        const data = await classService.getClassById(parseInt(classId));
        setClassData(data);
      } catch (error) {
        console.error("Failed to fetch class details:", error);
        toast.error("Không thể tải thông tin lớp học.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

  const handleEndClass = async () => {
    if (confirmName !== classData?.className) {
      toast.error("Tên lớp xác nhận không chính xác.");
      return;
    }

    setIsEnding(true);
    try {
      await classService.endClass(classData.id);
      toast.success("Kết thúc lớp học thành công!");
      setIsConfirmOpen(false);
      navigate("/teacher/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết thúc lớp học. Vui lòng thử lại!");
    } finally {
      setIsEnding(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Đã sao chép mã lớp!");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyPasswordToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    toast.success("Đã sao chép mật khẩu lớp!");
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-10 bg-neutral-200 rounded-lg w-1/4"></div>
      <div className="space-y-4">
        <div className="h-32 bg-neutral-100 rounded-xl"></div>
        <div className="h-32 bg-neutral-100 rounded-xl"></div>
        <div className="h-32 bg-neutral-100 rounded-xl"></div>
      </div>
    </div>;
  }

  if (!classData) return <div>Không tìm thấy dữ liệu.</div>;

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
          <Settings className="text-primary w-8 h-8" />
          Cấu hình Lớp học
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Quản lý thông tin, quyền truy cập và các thiết lập quan trọng cho Lớp {classData.className}.
        </p>
      </div>

      {/* Section: Class Information */}
      <section className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border bg-neutral-50/50">
          <h2 className="font-bold text-neutral-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-neutral-400" />
            Thông tin Lớp học
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Tên lớp học</p>
            <p className="text-lg font-bold text-neutral-700">{classData.className}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Trường học</p>
            <p className="text-lg font-bold text-neutral-700">{classData.schoolName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Khối lớp</p>
            <p className="text-lg font-bold text-neutral-700">Khối {classData.grade}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Ngày tạo</p>
            <p className="text-lg font-bold text-neutral-700">{new Date(classData.createdAt).toLocaleDateString("vi-VN")}</p>
          </div>
        </div>
      </section>

      {/* Section: Class Access */}
      <section className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border bg-neutral-50/50">
          <h2 className="font-bold text-neutral-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-neutral-400" />
            Quyền truy cập
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-primary-light/30 border border-primary-border/20 rounded-xl">
            <div>
              <p className="text-sm font-bold text-primary mb-1">Mã lớp học (Class Code)</p>
              <p className="text-xs text-neutral-500">Sử dụng mã này để mời học sinh tham gia lớp.</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-4 py-2 bg-white border border-primary-border/30 rounded-lg font-mono font-bold text-primary text-lg tracking-wider">
                {classData.classCode}
              </code>
              <button 
                onClick={() => copyToClipboard(classData.classCode || "")}
                className="p-2.5 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors shadow-sm cursor-pointer"
              >
                {copied ? <Check className="w-5 h-5 text-success-text" /> : <Copy className="w-5 h-5 text-neutral-500" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border rounded-xl">
            <div>
              <p className="text-sm font-bold text-neutral-700 mb-1">Mật khẩu lớp (Class Password)</p>
              <p className="text-xs text-neutral-500">Mật khẩu bảo mật khi học sinh tham gia lớp học.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  readOnly
                  value={showPassword ? (classData.classPassword || "CM-123456") : "••••••••"}
                  className="pl-4 pr-10 py-2 bg-neutral-50 border border-border rounded-lg font-mono font-bold text-neutral-700 w-40 focus:outline-none"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button 
                onClick={() => copyPasswordToClipboard(classData.classPassword || "CM-123456")}
                className="p-2.5 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors shadow-sm cursor-pointer"
              >
                {copiedPassword ? <Check className="w-5 h-5 text-success-text" /> : <Copy className="w-5 h-5 text-neutral-500" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-danger-light/10 border border-danger/20 rounded-2xl p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-danger-light text-danger-text rounded-xl border border-danger/10">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-neutral-900">Vùng nguy hiểm</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Các hành động tại đây có thể ảnh hưởng vĩnh viễn đến dữ liệu lớp học. Vui lòng cẩn trọng.
            </p>
          </div>
        </div>

        <div className="border-t border-danger/10 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-1 max-w-lg">
            <p className="text-sm font-bold text-neutral-900">Kết thúc lớp học</p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Sau khi kết thúc, tất cả các bảng điểm, mẫu hồ sơ và danh sách học sinh sẽ bị khóa. 
              Bạn không thể hoàn tác hành động này nhưng sẽ có thể tạo một lớp học mới.
            </p>
          </div>
          
          <Button
            variant="destructive"
            onClick={() => setIsConfirmOpen(true)}
            className="w-full sm:w-auto font-bold shadow-sm shadow-danger/10"
          >
            Kết thúc lớp học
          </Button>
        </div>
      </section>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-danger-light/20 p-6 flex items-center gap-4 border-b border-danger/10">
            <div className="p-3 bg-danger-light text-danger-text rounded-2xl border border-danger/10">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-neutral-900">Xác nhận kết thúc?</DialogTitle>
              <p className="text-xs text-danger-text font-semibold uppercase tracking-widest mt-0.5">Hành động không thể hoàn tác</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <DialogDescription className="text-neutral-600 text-sm leading-relaxed">
              Dữ liệu của lớp học <strong>{classData.className}</strong> sẽ bị đóng băng vĩnh viễn. 
              Để xác nhận, vui lòng nhập chính xác tên lớp học vào ô bên dưới.
            </DialogDescription>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Nhập tên lớp học để xác nhận</p>
              <input 
                type="text"
                placeholder={classData.className}
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-border rounded-xl font-bold text-neutral-900 focus:ring-2 focus:ring-danger/20 focus:border-danger transition-all placeholder:text-neutral-300"
                autoComplete="off"
                onPaste={(e) => e.preventDefault()}
              />
            </div>
          </div>

          <div className="p-6 bg-neutral-50 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmOpen(false);
                setConfirmName("");
              }}
              disabled={isEnding}
              className="flex-1 font-bold"
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={handleEndClass}
              isLoading={isEnding}
              disabled={confirmName !== classData.className}
              className="flex-1 font-bold shadow-lg shadow-danger/20"
            >
              Xác nhận kết thúc
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
