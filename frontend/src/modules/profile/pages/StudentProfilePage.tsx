import { useState, useEffect } from "react";
import type { FormTemplate } from "@/types/form";
import type { StudentProfile } from "@/types/studentProfile";
import formService from "@/services/formService";
import studentProfileService from "@/services/studentProfileService";
import DynamicProfileForm from "../components/DynamicProfileForm";

export default function StudentProfilePage({ classId }: { classId: number }) {
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [templateData, profileData] = await Promise.allSettled([
          formService.getActiveForm(classId),
          studentProfileService.getMyProfile()
        ]);

        if (templateData.status === "fulfilled") {
          setTemplate(templateData.value);
        } else {
          setError("No active form found for this class. Please wait for your teacher to publish a form.");
        }

        if (profileData.status === "fulfilled") {
          setProfile(profileData.value);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg border border-border"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center bg-pale-blue rounded-lg border border-pale-blue-text/20">
        <p className="text-pale-blue-text font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Student Dossier</h1>
        <p className="text-gray-600">Keep your information up to date for your homeroom teacher.</p>
      </header>

      {template && (
        <DynamicProfileForm 
          template={template} 
          initialData={profile || undefined} 
          onSuccess={() => {
            // Refetch data after success
            const fetchData = async () => {
              try {
                const profileData = await studentProfileService.getMyProfile();
                setProfile(profileData);
              } catch (e) {
                console.error("Refetch failed", e);
              }
            };
            fetchData();
          }}
        />
      )}
    </div>
  );
}
