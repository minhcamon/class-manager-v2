import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router";
import { Loader2 } from "lucide-react";

/**
 * StudentDashboard is a redirect-only component.
 * Students always land directly in their class workspace.
 * This route is kept as a fallback for edge cases.
 */
export default function StudentDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (user?.classId) {
    return <Navigate to={`/student/class/${user.classId}`} replace />;
  }

  // Fallback: student has no class yet — shouldn't reach here normally
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-neutral-500 text-sm font-medium">
        Bạn chưa tham gia lớp học nào.
      </p>
      <p className="text-xs text-neutral-400 mt-1">
        Hãy liên hệ giáo viên để nhận mã lớp.
      </p>
    </div>
  );
}
