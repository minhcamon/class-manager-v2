import { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  User, 
  GraduationCap, 
  LayoutDashboard,
  Bell
} from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      label: "Bảng điều khiển",
      path: "/student/dashboard",
      icon: LayoutDashboard,
    }
  ];

  const isClassWorkspace = location.pathname.startsWith("/student/class/");
  const classIdMatch = location.pathname.match(/\/student\/class\/([^/]+)/);
  const classId = classIdMatch ? classIdMatch[1] : null;

  const classMenuItems = isClassWorkspace ? [
    {
      label: "Trang chủ lớp",
      path: `/student/class/${classId}`,
      icon: Home,
    },
    {
      label: "Hồ sơ của tôi",
      path: `/student/class/${classId}/profile`,
      icon: User,
    },
    {
      label: "Thông báo",
      path: `/student/class/${classId}/announcements`,
      icon: Bell,
      disabled: true,
    }
  ] : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-left">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-border flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Logo */}
          <Link to="/student/dashboard" className="flex items-center gap-3">
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
                    item.disabled ? (
                      <div
                        key={item.path}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl text-neutral-300 cursor-not-allowed group"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-[18px] h-[18px]" />
                          {item.label}
                        </div>
                        <span className="text-[8px] bg-neutral-100 px-1.5 py-0.5 rounded uppercase">Sắp có</span>
                      </div>
                    ) : (
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
                    )
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* User Profile Footer & Logout */}
        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-100 shrink-0">
              {user?.fullName ? user.fullName.split(" ").pop()?.substring(0, 2).toUpperCase() : "HS"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-neutral-900 truncate" title={user?.fullName}>
                {user?.fullName}
              </p>
              <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider">
                Học Sinh
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
