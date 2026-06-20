import { DailyCanvasPage } from "@/modules/class";
import TeacherLayout from "@/components/common/TeacherLayout";
import StudentLayout from "@/components/common/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function DailyCanvasView() {
  const { user } = useAuth();

  if (user?.role === "TEACHER") {
    return (
      <TeacherLayout>
        <DailyCanvasPage />
      </TeacherLayout>
    );
  }

  return (
    <StudentLayout>
      <DailyCanvasPage />
    </StudentLayout>
  );
}
