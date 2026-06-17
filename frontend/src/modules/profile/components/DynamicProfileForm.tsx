import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type { FormTemplate, FormField } from "@/types/form";
import type { StudentProfile, StudentProfileUpdateRequest } from "@/types/studentProfile";
import studentProfileService from "@/services/studentProfileService";
import Button from "@/components/ui/Button";

interface DynamicProfileFormProps {
  template: FormTemplate;
  initialData?: StudentProfile;
  onSuccess?: () => void;
}

export default function DynamicProfileForm({ template, initialData, onSuccess }: DynamicProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Record<string, string | number | boolean | null>>({
    defaultValues: (initialData?.data as Record<string, string | number | boolean | null>) || {},
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData.data as Record<string, string | number | boolean | null>);
    }
  }, [initialData, reset]);

  const onSubmit = async (data: Record<string, string | number | boolean | null>) => {
    setIsSubmitting(true);
    try {
      await studentProfileService.updateMyProfile({ data } as StudentProfileUpdateRequest);
      toast.success("Profile updated successfully!");
      if (onSuccess) onSuccess();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      ...register(field.fieldName, { required: field.required ? `${field.label} is required` : false }),
      className: `w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none ${
        errors[field.fieldName] ? "border-pale-red" : ""
      }`,
    };

    switch (field.type) {
      case "textarea":
        return <textarea {...commonProps} rows={3} />;
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <input type="checkbox" {...register(field.fieldName)} id={field.fieldName} className="w-4 h-4" />
            <label htmlFor={field.fieldName} className="text-sm">{field.label}</label>
          </div>
        );
      case "select":
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case "number":
        return <input type="number" {...commonProps} />;
      case "date":
        return <input type="date" {...commonProps} />;
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg border border-border">
      <div className="border-b border-border pb-4 mb-4">
        <h2 className="text-xl font-bold">{template.title}</h2>
        <p className="text-sm text-gray-500">Please complete all required fields below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {template.structure.map((field) => (
          <div key={field.fieldName} className={field.type === "textarea" ? "md:col-span-2" : ""}>
            {field.type !== "boolean" && (
              <label className="block text-sm font-medium mb-1">
                {field.label} {field.required && <span className="text-pale-red-text">*</span>}
              </label>
            )}
            {renderField(field)}
            {errors[field.fieldName] && (
              <p className="text-xs text-pale-red-text mt-1">{errors[field.fieldName]?.message}</p>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-10">
          {isSubmitting ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
