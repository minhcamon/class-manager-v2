import { ProfileTemplateBuilder as ProfileTemplateBuilderPage } from "@/modules/form";
import TeacherLayout from "@/components/common/TeacherLayout";

export default function ProfileTemplateBuilderView() {
  return (
    <TeacherLayout>
      <ProfileTemplateBuilderPage />
    </TeacherLayout>
  );
}
