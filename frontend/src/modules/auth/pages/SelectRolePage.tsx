import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";
import OnboardingLayout from "@/components/common/OnboardingLayout";

export default function SelectRolePage() {
  const { selectRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"TEACHER" | "STUDENT" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error("Vui lòng chọn một vai trò trước khi tiếp tục!");
      return;
    }

    setIsLoading(true);
    try {
      await selectRole(selectedRole);
      toast.success("Lựa chọn vai trò thành công!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingLayout>
      <div className="flex flex-col gap-8">
        {/* Header Block */}
        <div className="flex flex-col gap-2 text-center max-w-[480px] mx-auto">
          <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">
            Bạn sử dụng ClassManager với vai trò nào?
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Chọn tài khoản phù hợp với nhiệm vụ của bạn. Lựa chọn này không thể thay đổi sau khi xác nhận.
          </p>
        </div>

        {/* Roles Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: TEACHER */}
          <button
            type="button"
            onClick={() => setSelectedRole("TEACHER")}
            disabled={isLoading}
            className={`flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 ${
              selectedRole === "TEACHER"
                ? "border-zinc-950 bg-zinc-50/50 scale-[1.01]"
                : "border-[#EAEAEA] bg-white opacity-80 hover:opacity-100 hover:border-zinc-300 hover:scale-[1.01]"
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${
              selectedRole === "TEACHER" ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600"
            }`}>
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <h3 className="text-base font-bold text-zinc-950 mb-1.5">Giáo Viên Chủ Nhiệm</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Quản lý danh sách, chấm điểm thi đua tổ học sinh và cấu hình các biểu mẫu đánh giá tự động.
            </p>
          </button>

          {/* Card 2: STUDENT */}
          <button
            type="button"
            onClick={() => setSelectedRole("STUDENT")}
            disabled={isLoading}
            className={`flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 ${
              selectedRole === "STUDENT"
                ? "border-zinc-950 bg-zinc-50/50 scale-[1.01]"
                : "border-[#EAEAEA] bg-white opacity-80 hover:opacity-100 hover:border-zinc-300 hover:scale-[1.01]"
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${
              selectedRole === "STUDENT" ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600"
            }`}>
              <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            
            <h3 className="text-base font-bold text-zinc-950 mb-1.5">Học Sinh</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Xem bảng xếp hạng thi đua cá nhân & tổ, cập nhật điểm hoạt động phong trào của bản thân.
            </p>
          </button>
        </div>

        {/* Submit button wrapper */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedRole || isLoading}
          className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-100 text-white disabled:text-zinc-400 text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : null}
          {isLoading ? "Đang lưu..." : "Xác Nhận Vai Trò"}
        </button>

      </div>
    </OnboardingLayout>
  );
}
