import { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Users,
  FileText,
  Settings,
  PanelLeft,
  PlusCircle,
  BookOpen,
  Loader2,
  Award,
} from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";
import classService from "@/services/classService";
import type { Class } from "@/types/class";

interface TeacherLayoutProps {
  children: ReactNode;
}

const SIDEBAR_KEY = "teacher_sidebar_collapsed";

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();

  // ── Sidebar collapse state ──────────────────────────────────────────
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, String(collapsed));
    } catch (err) {
      console.debug("Failed to save sidebar state:", err);
    }
  }, [collapsed]);

  // ── Fetch active class so sidebar always knows the class ────────────
  const [activeClass, setActiveClass] = useState<Class | null>(() => {
    try {
      const cached = sessionStorage.getItem("active_class");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [classLoading, setClassLoading] = useState(() => {
    if (location.pathname === "/teacher/classes/create") {
      return false;
    }
    return !activeClass;
  });

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        const cls = await classService.getActiveClass();
        if (!cancelled) setActiveClass(cls);
      } catch {
        if (!cancelled) setActiveClass(null);
      } finally {
        if (!cancelled) setClassLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

  // ── Derive classId from URL or active class ─────────────────────────
  const classIdMatch = location.pathname.match(/\/teacher\/classes\/([^/]+)/);
  const classIdFromUrl = classIdMatch && !isNaN(Number(classIdMatch[1])) ? classIdMatch[1] : null;
  const classId = classIdFromUrl || (activeClass?.id ? String(activeClass.id) : null);

  // ── Build nav items ─────────────────────────────────────────────────
  const generalItems = [
    {
      label: "Bảng điều khiển",
      path: "/teacher/dashboard",
      icon: BookOpen,
    },
  ];

  const classNavItems = classId
    ? [
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
          label: "Chấm điểm thi đua",
          path: `/teacher/classes/${classId}/daily-canvas`,
          icon: Award,
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
        },
      ]
    : [];

  const isActive = (path: string) => location.pathname === path;

  const initials = user?.fullName
    ? user.fullName.split(" ").pop()?.substring(0, 2).toUpperCase()
    : "GV";

  // ── Render nav link helper ──────────────────────────────────────────
  const renderNavLink = (item: { label: string; path: string; icon: React.ElementType }) => {
    const active = isActive(item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
        title={collapsed ? item.label : undefined}
        className={`group flex items-center gap-3 rounded-xl transition-all duration-150 cursor-pointer select-none
          ${collapsed ? "justify-center px-0 py-3 w-10 h-10 mx-auto" : "px-3 py-2.5 w-full"}
          ${
            active
              ? "bg-primary-light text-primary"
              : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
          }
        `}
      >
        <item.icon
          className={`shrink-0 transition-transform ${
            collapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
          } ${active ? "text-primary" : ""}`}
        />
        {!collapsed && (
          <span className="text-sm font-semibold truncate">{item.label}</span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-left">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`bg-white border-r border-border flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out ${
          collapsed ? "w-[68px]" : "w-64"
        }`}
      >
        {/* Top: Logo + Toggle + Nav */}
        <div className="flex flex-col overflow-hidden">
          {/* Logo area */}
          <div
            className={`flex items-center h-[64px] px-4 border-b border-border shrink-0 ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!collapsed && (
              <Link
                to="/teacher/dashboard"
                className="flex items-center gap-2.5 min-w-0"
              >
                <div className="w-8 h-8 bg-primary rounded-[8px] flex items-center justify-center shrink-0">
                  <span className="text-white font-extrabold text-base">C</span>
                </div>
                <span className="font-extrabold text-neutral-900 tracking-tight text-[17px] truncate">
                  ClassManager
                </span>
              </Link>
            )}

            <button
              onClick={() => setCollapsed((v) => !v)}
              title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
              className={`p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-all active:scale-95 cursor-pointer shrink-0 ${
                collapsed ? "w-10 h-10 flex items-center justify-center" : ""
              }`}
            >
              <PanelLeft className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
            {/* General section */}
            <div className="space-y-1">
              {!collapsed && (
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 px-3">
                  Chung
                </p>
              )}
              {generalItems.map(renderNavLink)}
            </div>

            {/* Class workspace section — always show nav when classId is known */}
            {classNavItems.length > 0 ? (
              <div className="space-y-1">
                {!collapsed && (
                  <div className="flex items-center justify-between px-3 mb-2">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Lớp {activeClass?.className || "học"}
                    </p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                )}
                {collapsed && (
                  <div className="flex justify-center mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                )}
                {classNavItems.map(renderNavLink)}
              </div>
            ) : classLoading ? (
              /* Only show spinner if we have no classId yet and still fetching */
              <div className={`flex items-center ${collapsed ? "justify-center" : "px-3"} py-2`}>
                <Loader2 className="w-4 h-4 animate-spin text-neutral-300" />
                {!collapsed && (
                  <span className="ml-2 text-xs text-neutral-400">Đang tải...</span>
                )}
              </div>
            ) : (
              /* No active class — show create button */
              !collapsed && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 px-3">
                    Lớp học
                  </p>
                  <Link
                    to="/teacher/classes/create"
                    className={`flex items-center gap-3 px-3 py-2.5 w-full text-sm font-semibold rounded-xl transition-all cursor-pointer
                      ${isActive("/teacher/classes/create")
                        ? "bg-primary-light text-primary"
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                      }
                    `}
                  >
                    <PlusCircle className="w-[18px] h-[18px]" />
                    Tạo lớp mới
                  </Link>
                </div>
              )
            )}
          </nav>
        </div>

        {/* Bottom: User info + Logout */}
        <div
          className={`border-t border-border py-3 px-2 flex flex-col gap-2 shrink-0 ${
            collapsed ? "items-center" : ""
          }`}
        >
          {/* User avatar / info */}
          {collapsed ? (
            <div
              title={user?.fullName}
              className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm border border-primary-border/20 cursor-default"
            >
              {initials}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm border border-primary-border/20 shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p
                  className="text-sm font-bold text-neutral-900 truncate"
                  title={user?.fullName}
                >
                  {user?.fullName}
                </p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Giáo Viên
                </p>
              </div>
            </div>
          )}

          {/* Logout */}
          {collapsed ? (
            <LogoutButton
              className="w-10 h-10 flex items-center justify-center rounded-xl text-danger-text bg-danger-light/20 hover:bg-danger-light/50 transition-all cursor-pointer"
              iconSize={18}
              hideLabel
              redirectPath="/"
              title="Đăng xuất"
            />
          ) : (
            <LogoutButton
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-danger-text bg-danger-light/20 hover:bg-danger-light/50 rounded-xl transition-all cursor-pointer"
              iconSize={18}
              redirectPath="/"
            />
          )}
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
