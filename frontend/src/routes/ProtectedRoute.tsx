import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Màn hình chờ khi đang checkAuth khôi phục session
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500 animate-pulse">
          Đang tải dữ liệu ClassManager...
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, đá về trang chủ
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Nếu đã đăng nhập nhưng không có Role thích hợp, đá về trang lỗi
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`Từ chối quyền truy cập: Yêu cầu vai trò trong [${allowedRoles}], tài khoản có vai trò: ${user.role}`);
    return <Navigate to="/*" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
