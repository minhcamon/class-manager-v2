import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";
import OnboardingLayout from "@/components/common/OnboardingLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  AlertCircle,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

export default function SelectRolePage() {
  const { user, selectRole, withdrawTeacherRequest } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"TEACHER" | "STUDENT" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  const isTeacherPending = user?.teacherRequestStatus === "PENDING";
  const isTeacherWithdrawn = user?.teacherRequestStatus === "WITHDRAWAL";
  const isTeacherRejected = user?.teacherRequestStatus === "REJECTED";
  const cannotSelectTeacher = isTeacherWithdrawn || isTeacherRejected;

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error("Vui lòng chọn một vai trò trước khi tiếp tục!");
      return;
    }

    if (selectedRole === "TEACHER" && cannotSelectTeacher) {
      toast.error("Bạn đã rút lại yêu cầu hoặc bị từ chối, chỉ có thể chọn vai trò Học sinh.");
      return;
    }

    setIsLoading(true);
    try {
      await selectRole(selectedRole);
      if (selectedRole === "TEACHER") {
        toast.info("Yêu cầu vai trò Giáo viên đã được gửi. Vui lòng chờ Quản trị viên (Admin) phê duyệt.");
      } else {
        toast.success("Lựa chọn vai trò thành công!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await withdrawTeacherRequest();
      setShowWithdrawDialog(false);
      setSelectedRole(null);
      toast.success("Đã rút lại yêu cầu thành công! Hiện tại bạn có thể tiếp tục với vai trò Học sinh.");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Không thể rút lại yêu cầu, vui lòng thử lại!");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Case 1: PENDING - Screen displays pending approval status and withdrawal button
  if (isTeacherPending) {
    return (
      <OnboardingLayout>
        <div className="flex flex-col gap-6 text-center max-w-120 mx-auto py-8">
          {/* Status Icon */}
          <div className="w-16 h-16 rounded-2xl bg-warning-light border border-amber-200 text-warning-text flex items-center justify-center mx-auto shadow-xs">
            <Clock className="w-8 h-8 animate-pulse text-amber-600" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-warning-light border border-amber-200 text-warning-text mb-3">
              <Clock className="w-3.5 h-3.5" />
              Đang Chờ Phê Duyệt
            </span>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Yêu Cầu Giáo Viên Đang Đợi Duyệt
            </h2>
            <p className="text-xs text-neutral-600 mt-2.5 leading-relaxed">
              Bạn đã gửi yêu cầu cấp quyền vai trò <strong className="text-neutral-900">Giáo viên Chủ nhiệm</strong>. Quản trị viên hệ thống (Admin) đang xem xét và xác minh hồ sơ của bạn.
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-neutral-50 border border-border rounded-2xl p-4.5 text-left text-xs text-neutral-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-neutral-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Trạng thái tài khoản:</span>
            </div>
            <p className="text-[11px] text-neutral-500 pl-6">
              • Người dùng: <strong className="text-neutral-800">{user?.fullName || user?.username}</strong>
            </p>
            <p className="text-[11px] text-neutral-500 pl-6">
              • Vai trò yêu cầu: <strong className="text-primary font-bold">TEACHER (Giáo viên)</strong>
            </p>
            <p className="text-[11px] text-neutral-500 pl-6">
              • Bạn có thể rút lại đơn nếu muốn chuyển sang vai trò Học sinh (Learner).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowWithdrawDialog(true)}
              disabled={isWithdrawing}
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Rút lại Yêu cầu (Withdrawal)</span>
            </button>
          </div>
        </div>

        {/* Custom Radix Withdrawal Confirmation Dialog */}
        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogContent className="sm:max-w-md p-6">
            <DialogHeader className="text-left space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-neutral-900">
                  Xác nhận Rút lại Yêu cầu Giáo viên?
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  Bạn có chắc chắn muốn rút đơn đăng ký vai trò <strong>Giáo viên Chủ nhiệm</strong> không?
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="p-3.5 bg-neutral-50 rounded-xl border border-border text-xs text-neutral-600 space-y-1.5 mt-2">
              <p className="font-bold text-neutral-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Lưu ý quan trọng:
              </p>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Sau khi rút đơn, trạng thái hồ sơ sẽ chuyển sang <strong>Đã rút đơn (WITHDRAWAL)</strong>. Bạn sẽ không thể gửi lại yêu cầu Giáo viên và chỉ có thể tiếp tục sử dụng hệ thống với vai trò <strong>Học sinh (Learner)</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowWithdrawDialog(false)}
                disabled={isWithdrawing}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                disabled={isWithdrawing}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isWithdrawing && <RotateCcw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isWithdrawing ? "Đang xử lý..." : "Xác nhận Rút đơn"}</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </OnboardingLayout>
    );
  }

  // Case 2: Role selection page (with TEACHER disabled if user has withdrawn or been rejected)
  return (
    <OnboardingLayout>
      <div className="flex flex-col gap-6">
        {/* Header Block */}
        <div className="flex flex-col gap-2 text-center max-w-120 mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Bạn sử dụng ClassManager với vai trò nào?
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Chọn vai trò phù hợp với bạn để tiếp tục sử dụng hệ thống.
          </p>
        </div>

        {/* Warning Banner if Teacher request was withdrawn or rejected */}
        {isTeacherWithdrawn && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-2xs">
            <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Bạn đã rút lại yêu cầu vai trò Giáo viên</p>
              <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                Yêu cầu giáo viên đã chuyển sang trạng thái <strong>Đã rút đơn (WITHDRAWAL)</strong>. Bạn không thể đăng ký lại vai trò Giáo viên mà chỉ có thể tiếp tục với vai trò <strong>Học sinh (Learner)</strong>.
              </p>
            </div>
          </div>
        )}

        {isTeacherRejected && (
          <div className="p-4 rounded-2xl bg-danger-light border border-red-200 text-danger-text text-xs flex items-start gap-3 shadow-2xs">
            <ShieldAlert className="w-4.5 h-4.5 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Yêu cầu vai trò Giáo viên đã bị từ chối</p>
              <p className="text-[11px] text-danger-text mt-0.5 leading-relaxed">
                Hồ sơ giáo viên của bạn không được phê duyệt. Vui lòng tiếp tục với vai trò <strong>Học sinh (Learner)</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Roles Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: TEACHER (Disabled if withdrawn/rejected) */}
          <button
            type="button"
            onClick={() => {
              if (!cannotSelectTeacher) {
                setSelectedRole("TEACHER");
              }
            }}
            disabled={isLoading || cannotSelectTeacher}
            className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all outline-none ${
              cannotSelectTeacher
                ? "border-border bg-neutral-100/70 opacity-60 cursor-not-allowed"
                : selectedRole === "TEACHER"
                ? "border-primary bg-primary-light/30 shadow-sm scale-[1.01] cursor-pointer"
                : "border-border bg-white hover:border-primary/40 hover:bg-neutral-50/70 hover:scale-[1.01] cursor-pointer"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                cannotSelectTeacher
                  ? "bg-neutral-200 text-neutral-400"
                  : selectedRole === "TEACHER"
                  ? "bg-primary text-white"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              <BookOpen className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-neutral-900 mb-1.5">Giáo Viên Chủ Nhiệm</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Quản lý lớp học, phân tổ học sinh, ghi nhận điểm thi đua hằng ngày và theo dõi báo cáo phân tích.
            </p>

            {cannotSelectTeacher ? (
              <span className="mt-3 inline-flex items-center text-[10px] font-bold text-neutral-600 bg-neutral-200 px-2 py-0.5 rounded-md">
                {isTeacherWithdrawn ? "Đã rút đơn (Không khả dụng)" : "Đã từ chối"}
              </span>
            ) : (
              <span className="mt-3 inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                Cần Admin phê duyệt
              </span>
            )}
          </button>

          {/* Card 2: STUDENT */}
          <button
            type="button"
            onClick={() => setSelectedRole("STUDENT")}
            disabled={isLoading}
            className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all cursor-pointer outline-none ${
              selectedRole === "STUDENT"
                ? "border-primary bg-primary-light/30 shadow-sm scale-[1.01]"
                : "border-border bg-white hover:border-primary/40 hover:bg-neutral-50/70 hover:scale-[1.01]"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                selectedRole === "STUDENT" ? "bg-primary text-white" : "bg-neutral-100 text-neutral-600"
              }`}
            >
              <GraduationCap className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-neutral-900 mb-1.5">Học Sinh (Learner)</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Xem bảng xếp hạng thi đua cá nhân & tổ, tra cứu điểm và cập nhật thông tin hồ sơ học sinh.
            </p>
            <span className="mt-3 inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              Kích hoạt ngay
            </span>
          </button>
        </div>

        {/* Submit button wrapper */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedRole || isLoading}
          className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-neutral-200 text-white disabled:text-neutral-400 text-sm font-bold rounded-xl shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : null}
          {isLoading ? "Đang xử lý..." : "Xác Nhận Vai Trò"}
        </button>
      </div>
    </OnboardingLayout>
  );
}
