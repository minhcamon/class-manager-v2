/* eslint-disable react-hooks/set-state-in-effect */
import { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  User,
  Trophy,
  TableProperties,
  PanelLeft,
  Award,
} from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";
import studentProfileService from "@/services/studentProfileService";

interface StudentLayoutProps {
  children: ReactNode;
}

const SIDEBAR_KEY = "student_sidebar_collapsed";

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Track if current user is a group leader for this class
  const [isGroupLeader, setIsGroupLeader] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, String(collapsed));
    } catch (err) {
      console.debug("Failed to save sidebar state:", err);
    }
  }, [collapsed]);

  // Extract classId from URL (handles both /student/class/:classId and /teacher/classes/:classId patterns)
  const classIdMatch =
    location.pathname.match(/\/student\/class\/([^/]+)/) ||
    location.pathname.match(/\/teacher\/classes\/([^/]+)/);
  const classId = classIdMatch ? classIdMatch[1] : user?.classId;

  // Fetch group leader status whenever classId or user changes
  useEffect(() => {
    if (!classId || !user?.id) {
      setIsGroupLeader(false);
      return;
    }
    let cancelled = false;
    studentProfileService.getMyProfile()
      .then((profile) => {
        if (cancelled) return;
        setIsGroupLeader(!!profile.isLeader);
      })
      .catch(() => {
        if (!cancelled) setIsGroupLeader(false);
      });
    return () => {
      cancelled = true;
    };
  }, [classId, user?.id]);

  const baseNavItems = [
    {
      label: "Tổng quan",
      path: `/student/class/${classId}`,
      icon: Home,
      exact: true,
    },
    {
      label: "Bảng điểm",
      path: `/student/class/${classId}?tab=scores`,
      icon: TableProperties,
      exact: false,
    },
    {
      label: "Xếp hạng",
      path: `/student/class/${classId}?tab=leaderboard`,
      icon: Trophy,
      exact: false,
    },
    {
      label: "Hồ sơ của tôi",
      path: `/student/class/${classId}/profile`,
      icon: User,
      exact: false,
    },
  ];

  const leaderNavItem = {
    label: "Chấm điểm thi đua",
    path: `/student/class/${classId}/daily-canvas`,
    icon: Award,
    exact: false,
  };

  const navItems = isGroupLeader ? [...baseNavItems, leaderNavItem] : baseNavItems;

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return location.pathname === item.path.split("?")[0] && !location.search;
    }
    if (item.path.includes("?tab=")) {
      const tab = item.path.split("?tab=")[1];
      return (
        location.pathname === item.path.split("?")[0] &&
        location.search === `?tab=${tab}`
      );
    }
    return location.pathname.startsWith(item.path.split("?")[0]);
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").pop()?.substring(0, 2).toUpperCase()
    : "HS";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-left">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-border flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out ${
          collapsed ? "w-[68px]" : "w-64"
        }`}
      >
        {/* Top: Logo + Toggle */}
        <div className="flex flex-col overflow-hidden">
          {/* Logo area */}
          <div
            className={`flex items-center h-[64px] px-4 border-b border-border shrink-0 ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!collapsed && (
              <Link
                to={`/student/class/${classId}`}
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

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={`group flex items-center gap-3 rounded-xl transition-all duration-150 cursor-pointer select-none
                    ${collapsed ? "justify-center px-0 py-3 w-10 h-10 mx-auto" : "px-3 py-2.5 w-full"}
                    ${
                      active
                        ? item.label === "Chấm điểm thi đua"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-primary-light text-primary"
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                    }
                  `}
                >
                  <item.icon
                    className={`shrink-0 transition-transform ${
                      collapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
                    } ${
                      active
                        ? item.label === "Chấm điểm thi đua"
                          ? "text-amber-600"
                          : "text-primary"
                        : ""
                    }`}
                  />
                  {!collapsed && (
                    <span className="text-sm font-semibold truncate">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
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
              className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-100 cursor-default"
            >
              {initials}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-100 shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p
                  className="text-sm font-bold text-neutral-900 truncate"
                  title={user?.fullName}
                >
                  {user?.fullName}
                </p>
                <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider">
                  {isGroupLeader ? "Tổ Trưởng" : "Học Sinh"}
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

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
