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
      console.log("Chưa chọn vai trò. Chuyển hướng sang select-role...");
      return <Navigate to="/onboarding/select-role" replace />;
    }
    return <Outlet />;
  }

  // 3. Nếu là giáo viên (TEACHER) nhưng chưa liên kết trường (schoolName == null)
  if (user.role === "TEACHER" && user.schoolName === null) {
    if (path !== "/onboarding/create-school") {
      console.log("Giáo viên chưa tạo trường. Chuyển hướng sang create-school...");
      return <Navigate to="/onboarding/create-school" replace />;
    }
    return <Outlet />;
  }

  // 4. Nếu đã hoàn tất onboarding mà vẫn truy cập các trang onboarding, chuyển sang /dashboard
  if (path === "/onboarding/select-role" || path === "/onboarding/create-school") {
    console.log("Đã hoàn tất onboarding. Chuyển hướng sang dashboard...");
    return <Navigate to="/dashboard" replace />;
  }

  // 5. Nếu đã đăng nhập nhưng không có Role thích hợp cho route cụ thể
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`Từ chối quyền truy cập: Yêu cầu vai trò trong [${allowedRoles}], tài khoản có vai trò: ${user.role}`);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
