import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import classService from "@/services/classService";
import Button from "@/components/ui/Button";

const classSchema = z.object({
  className: z.string().min(1, "Tên lớp học là bắt buộc").max(10, "Tên lớp học quá dài (tối đa 10 ký tự)"),
  grade: z.number().min(10, "Khối phải từ 10 đến 12").max(12, "Khối phải từ 10 đến 12"),
  basePoint: z.number().min(0, "Điểm khởi đầu phải là số dương"),
});

type ClassFormData = z.infer<typeof classSchema>;

export default function CreateClassPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkActiveClass = async () => {
      try {
        const activeClass = await classService.getActiveClass();
        if (activeClass) {
          toast.warning("Bạn đã có lớp học hoạt động! Không thể tạo thêm lớp mới.");
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Failed to check active class status:", err);
      }
    };
    checkActiveClass();
  }, [navigate]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      grade: 10,
      basePoint: 100,
    },
  });

  const onSubmit = async (data: ClassFormData) => {
    setIsSubmitting(true);
    try {
      await classService.createClass(data);
      toast.success("Tạo lớp học thành công!");
      navigate("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      const apiError = axiosError.response?.data;
      if (apiError?.error === "DUPLICATE_CLASS_NAME") {
        setError("className", {
          type: "manual",
          message: apiError.message || "Tên lớp học này đã tồn tại trong trường của bạn."
        });
      } else {
        toast.error(apiError?.message || "Tạo lớp học thất bại");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-border font-sans">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Tạo lớp học của bạn</h1>
      <p className="text-sm text-gray-600 mb-6">
        Với tư cách là Giáo viên, bạn cần tạo lớp học để bắt đầu quản lý học sinh và các hoạt động thi đua.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Tên lớp học (ví dụ: 10A1)
          </label>
          <input
            {...register("className")}
            className={`w-full p-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none ${
              errors.className ? "border-pale-red" : "border-border"
            }`}
            placeholder="10A1"
          />
          {errors.className && (
            <p className="text-xs text-pale-red-text mt-1">{errors.className.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Khối lớp
          </label>
          <select
            {...register("grade", { valueAsNumber: true })}
            className={`w-full p-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none ${
              errors.grade ? "border-pale-red" : "border-border"
            }`}
          >
            <option value={10}>Khối 10</option>
            <option value={11}>Khối 11</option>
            <option value={12}>Khối 12</option>
          </select>
          {errors.grade && (
            <p className="text-xs text-pale-red-text mt-1">{errors.grade.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Điểm khởi đầu (Điểm mặc định tuần)
          </label>
          <input
            type="number"
            {...register("basePoint", { valueAsNumber: true })}
            className={`w-full p-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none ${
              errors.basePoint ? "border-pale-red" : "border-border"
            }`}
          />
          {errors.basePoint && (
            <p className="text-xs text-pale-red-text mt-1">{errors.basePoint.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4"
        >
          {isSubmitting ? "Đang tạo..." : "Tạo lớp học"}
        </Button>
      </form>
    </div>
  );
}
