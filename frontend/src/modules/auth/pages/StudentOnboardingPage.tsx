import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import enrollmentService from "@/services/enrollmentService";
import OnboardingLayout from "@/components/common/OnboardingLayout";
import { useAuth } from "@/contexts/AuthContext";

const joinClassSchema = z.object({
  classCode: z.string().min(1, "Vui lòng nhập mã lớp").max(20, "Mã lớp không hợp lệ"),
  classPassword: z.string().optional(),
});

type JoinClassFormData = z.infer<typeof joinClassSchema>;

export default function StudentOnboardingPage() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinClassFormData>({
    resolver: zodResolver(joinClassSchema),
  });

  const onSubmit = async (data: JoinClassFormData) => {
    setIsSubmitting(true);
    try {
      await enrollmentService.joinClass(data);
      toast.success("Tham gia lớp học thành công!");
      // Refresh auth state to get classId in user object
      await checkAuth();
      navigate("/student/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || "Tham gia lớp học thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout>
      <div className="flex flex-col gap-6">
        {/* Header Block */}
        <div className="flex flex-col gap-2 text-center max-w-[400px] mx-auto">
          <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">
            Tham gia lớp học của bạn
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Nhập mã lớp và mật khẩu (nếu có) được giáo viên cung cấp để bắt đầu theo dõi thi đua.
          </p>
        </div>

        {/* Join Class Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="class-code" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
              Mã lớp học
            </label>
            <input
              id="class-code"
              type="text"
              placeholder="Ví dụ: 10A1-2026"
              {...register("classCode")}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-950 outline-none transition-all disabled:opacity-50 ${
                errors.classCode ? "border-pale-red" : "border-[#EAEAEA]"
              }`}
            />
            {errors.classCode && (
              <p className="text-xs text-pale-red-text">{errors.classCode.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="class-password" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
              Mật khẩu lớp (Tùy chọn)
            </label>
            <input
              id="class-password"
              type="password"
              placeholder="Nhập mật khẩu nếu lớp có yêu cầu"
              {...register("classPassword")}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-white border border-[#EAEAEA] rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-950 outline-none transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-2 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {isSubmitting ? "Đang tham gia..." : "Tham Gia Lớp & Tiếp Tục"}
          </button>
        </form>
      </div>
    </OnboardingLayout>
  );
}
