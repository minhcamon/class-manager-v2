import { StudentDashboard as StudentDashboardPage } from "@/modules/dashboard";
import StudentLayout from "@/components/common/StudentLayout";

export default function StudentDashboardView() {
  return (
    <StudentLayout>
      <StudentDashboardPage />
    </StudentLayout>
  );
}
