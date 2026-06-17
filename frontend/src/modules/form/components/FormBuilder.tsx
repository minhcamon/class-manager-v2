import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type { FormTemplateCreateRequest } from "@/types/form";
import formService from "@/services/formService";
import Button from "@/components/ui/Button";

const fieldSchema = z.object({
  fieldName: z.string().min(1, "Field ID is required").regex(/^[a-z][a-zA-Z0-9]*$/, "Must be camelCase"),
  label: z.string().min(1, "Label is required"),
  type: z.enum(["text", "number", "boolean", "select", "date", "textarea"]),
  required: z.boolean().default(false),
  options: z.string().optional().transform(val => val ? val.split(",").map(s => s.trim()) : undefined),
});

const formTemplateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  structure: z.array(fieldSchema).min(1, "At least one field is required"),
});

type FormBuilderData = z.infer<typeof formTemplateSchema>;

interface FormBuilderProps {
  classId: number;
  onSuccess?: () => void;
}

export default function FormBuilder({ classId, onSuccess }: FormBuilderProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormBuilderData>({
    resolver: zodResolver(formTemplateSchema),
    defaultValues: {
      title: "Student Dossier Form",
      structure: [{ fieldName: "fullName", label: "Full Name", type: "text", required: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "structure",
  });

  const onSubmit = async (data: FormBuilderData) => {
    setIsSubmitting(true);
    try {
      // Cast to FormTemplateCreateRequest to avoid any
      await formService.createForm(classId, data as unknown as FormTemplateCreateRequest);
      toast.success("New form version published!");
      if (onSuccess) onSuccess();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to publish form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-border">
      <h2 className="text-xl font-bold mb-4">Form Builder</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Form Title</label>
          <input
            {...register("title")}
            className="w-full p-2 border border-border rounded-md bg-background"
            placeholder="e.g., Student Info 2026"
          />
          {errors.title && <p className="text-xs text-pale-red-text">{errors.title.message}</p>}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Fields</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ fieldName: "", label: "", type: "text", required: false })}
            >
              Add Field
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border border-border rounded-md space-y-3 bg-card">
              <div className="flex justify-between">
                <span className="text-sm font-bold text-gray-500">Field #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-pale-red-text text-xs hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Label</label>
                  <input
                    {...register(`structure.${index}.label`)}
                    className="w-full p-1.5 border border-border rounded-md text-sm bg-background"
                    placeholder="e.g., Date of Birth"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Field ID (camelCase)</label>
                  <input
                    {...register(`structure.${index}.fieldName`)}
                    className="w-full p-1.5 border border-border rounded-md text-sm bg-background"
                    placeholder="e.g., dob"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium mb-1">Type</label>
                  <select
                    {...register(`structure.${index}.type`)}
                    className="w-full p-1.5 border border-border rounded-md text-sm bg-background"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="select">Select</option>
                    <option value="date">Date</option>
                    <option value="textarea">TextArea</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 pb-2">
                  <input
                    type="checkbox"
                    {...register(`structure.${index}.required`)}
                    id={`req-${index}`}
                  />
                  <label htmlFor={`req-${index}`} className="text-xs font-medium">Required</label>
                </div>
                <div>
                  {/* Show options only for select type */}
                </div>
              </div>

              {/* Conditional rendering for Select options using watch or useWatch if needed, 
                  but for simplicity here we just show it if type is select in schema logic */}
              <div className="mt-2">
                <label className="block text-xs font-medium mb-1 text-gray-400">
                  Options (comma separated, for 'Select' type only)
                </label>
                <input
                  {...register(`structure.${index}.options`)}
                  className="w-full p-1.5 border border-border rounded-md text-sm bg-background"
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            </div>
          ))}
          {errors.structure && <p className="text-xs text-pale-red-text">{errors.structure.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Publishing..." : "Publish Form Version"}
        </Button>
      </form>
    </div>
  );
}
