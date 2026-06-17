import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import classService from "@/services/classService";
import Button from "@/components/ui/Button";

const classSchema = z.object({
  className: z.string().min(1, "Class name is required").max(10, "Class name too long"),
  grade: z.coerce.number().min(10, "Grade must be between 10 and 12").max(12, "Grade must be between 10 and 12"),
  basePoint: z.coerce.number().min(0, "Base point must be positive").default(100),
});

type ClassFormData = z.infer<typeof classSchema>;

export default function CreateClassPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      basePoint: 100,
    },
  });

  const onSubmit = async (data: ClassFormData) => {
    setIsSubmitting(true);
    try {
      await classService.createClass(data);
      toast.success("Class created successfully!");
      navigate("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to create class");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-border">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Create Your Class</h1>
      <p className="text-sm text-gray-600 mb-6">
        As a Teacher, you need to create a class to start managing your students and their performance.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Class Name (e.g., 10A1)
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
            Grade
          </label>
          <select
            {...register("grade")}
            className={`w-full p-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none ${
              errors.grade ? "border-pale-red" : "border-border"
            }`}
          >
            <option value={10}>Grade 10</option>
            <option value={11}>Grade 11</option>
            <option value={12}>Grade 12</option>
          </select>
          {errors.grade && (
            <p className="text-xs text-pale-red-text mt-1">{errors.grade.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Base Point (Weekly starting points)
          </label>
          <input
            type="number"
            {...register("basePoint")}
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
          {isSubmitting ? "Creating..." : "Create Class"}
        </Button>
      </form>
    </div>
  );
}
