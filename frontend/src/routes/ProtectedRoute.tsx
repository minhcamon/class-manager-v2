import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Màn hình chờ khi đang checkAuth khôi phục session
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
        <div className="text-sm font-medium text-zinc-400 animate-pulse font-sans">
          Đang tải dữ liệu ClassManager...
        </div>
      </div>
    );
  }

  // 1. Nếu chưa đăng nhập, chuyển hướng sang trang đăng nhập
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const path = location.pathname;

  // 2. Nếu đã đăng nhập nhưng chưa chọn vai trò (role == null)
  if (user.role === null) {
    if (path !== "/onboarding/select-role") {
      return <Navigate to="/onboarding/select-role" replace />;
    }
    return <Outlet />;
  }

  // 3. Nếu là giáo viên (TEACHER) nhưng chưa liên kết trường
  if (user.role === "TEACHER" && !user.schoolName) {
    if (!path.startsWith("/onboarding/teacher")) {
      return <Navigate to="/onboarding/teacher" replace />;
    }
    return <Outlet />;
  }

  // 4. Nếu là học sinh (STUDENT) nhưng chưa vào lớp
  if (user.role === "STUDENT" && !user.classId) {
    if (path !== "/onboarding/student") {
      return <Navigate to="/onboarding/student" replace />;
    }
    return <Outlet />;
  }

  // 5. Ngăn chặn truy cập lại các trang onboarding khi đã hoàn tất
  const isOnboardingPath = path.startsWith("/onboarding");
  if (isOnboardingPath) {
    if (user.role === "TEACHER" && user.schoolName) {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    if (user.role === "STUDENT" && user.classId) {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  // 6. Kiểm tra quyền truy cập theo vai trò
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
