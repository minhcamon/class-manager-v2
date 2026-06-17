import { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Settings, 
  Users,
  LayoutDashboard
} from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";

interface TeacherLayoutProps {
  children: ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      label: "Bảng điều khiển",
      path: "/teacher/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Lớp học của tôi",
      path: "/teacher/classes",
      icon: BookOpen,
    }
  ];

  // If we are in a specific class workspace, we might want different menu items
  // but for now let's stick to the main ones or handle sub-menus.
  const isClassWorkspace = location.pathname.startsWith("/teacher/classes/") && 
                          location.pathname !== "/teacher/classes" &&
                          location.pathname !== "/teacher/classes/create";
  
  const classIdMatch = location.pathname.match(/\/teacher\/classes\/([^/]+)/);
  const classId = classIdMatch ? classIdMatch[1] : null;

  const classMenuItems = isClassWorkspace ? [
    {
      label: "Tổng quan",
      path: `/teacher/classes/${classId}`,
      icon: Home,
    },
    {
      label: "Quản lý học sinh",
      path: `/teacher/classes/${classId}/management`,
      icon: Users,
    },
    {
      label: "Mẫu sơ yếu",
      path: `/teacher/classes/${classId}/profile-template`,
      icon: FileText,
    },
    {
      label: "Cấu hình lớp",
      path: `/teacher/classes/${classId}/configuration`,
      icon: Settings,
    }
  ] : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-left">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-border flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Logo */}
          <Link to="/teacher/dashboard" className="flex items-center gap-3">
            <div className="p-2 bg-primary text-white rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-neutral-900 tracking-tight text-xl">
              ClassManager
            </span>
          </Link>

          {/* Nav Menu */}
          <nav className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 px-4">
                Chung
              </p>
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                      location.pathname === item.path
                        ? "bg-primary-light text-primary"
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                    }`}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {isClassWorkspace && (
              <div className="animate-in slide-in-from-left-2 duration-300">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 px-4">
                  Lớp học hiện tại
                </p>
                <div className="space-y-1">
                  {classMenuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                        location.pathname === item.path
                          ? "bg-primary-light text-primary"
                          : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                      }`}
                    >
                      <item.icon className="w-[18px] h-[18px]" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* User Profile Footer & Logout */}
        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm border border-primary-border/20 shrink-0">
              {user?.fullName ? user.fullName.split(" ").pop()?.substring(0, 2).toUpperCase() : "GV"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-neutral-900 truncate" title={user?.fullName}>
                {user?.fullName}
              </p>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Giáo Viên
              </p>
            </div>
          </div>

          <LogoutButton
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-danger-text bg-danger-light/20 hover:bg-danger-light/50 rounded-xl transition-all cursor-pointer"
            iconSize={18}
            redirectPath="/"
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
