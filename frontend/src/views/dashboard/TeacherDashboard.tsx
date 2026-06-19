import { TeacherDashboard as TeacherDashboardPage } from "@/modules/dashboard";
import TeacherLayout from "@/components/common/TeacherLayout";

export default function TeacherDashboardView() {
  return (
    <TeacherLayout>
      <TeacherDashboardPage />
    </TeacherLayout>
  );
}
