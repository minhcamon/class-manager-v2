import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import type { StudentProfile } from "@/types/studentProfile";
import studentProfileService from "@/services/studentProfileService";

interface StudentDossierViewProps {
  classId: number;
  studentId: number;
}

export default function StudentDossierView({ classId, studentId }: StudentDossierViewProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await studentProfileService.getStudentProfile(classId, studentId);
        setProfile(data);
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message || "Failed to load student profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [classId, studentId]);

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div><div className="h-40 bg-gray-100 rounded"></div></div>;
  if (error) return <div className="p-4 bg-pale-red text-pale-red-text rounded-md">{error}</div>;
  if (!profile) return <div>No profile data found.</div>;

  const template = profile.formVersion;

  return (
    <div className="bg-white p-6 rounded-lg border border-border space-y-6">
      <div className="border-b border-border pb-2">
        <h3 className="text-lg font-bold">Student Dossier</h3>
        <p className="text-xs text-gray-500">
          Form Version: v{template?.version} — Submitted on: {new Date(profile.updatedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {template?.structure.map((field) => {
          const value = profile.data[field.fieldName];
          return (
            <div key={field.fieldName} className={`p-3 rounded-md border border-border/50 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                {field.label}
              </label>
              <div className="text-sm font-medium text-foreground">
                {field.type === "boolean" ? (
                  <span className={`px-2 py-0.5 rounded text-[10px] ${value ? 'bg-pale-green text-pale-green-text' : 'bg-pale-red text-pale-red-text'}`}>
                    {value ? "YES" : "NO"}
                  </span>
                ) : (
                  value?.toString() || <span className="text-gray-300 italic">Not provided</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
