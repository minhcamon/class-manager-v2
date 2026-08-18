import { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/common/Logo";
import {
    LayoutDashboard,
    UserCheck,
    Users,
    School,
    Activity,
    PanelLeft,
    Eye,
    ArrowLeft,
} from "lucide-react";
import LogoutButton from "@/components/ui/LogoutButton";
import { clearTokens, setTokens } from "@/utils/utils";

interface AdminLayoutProps {
    children: ReactNode;
}

const SIDEBAR_KEY = "admin_sidebar_collapsed";

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Sidebar collapse state matching TeacherLayout/StudentLayout
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
            console.debug("Failed to save admin sidebar state:", err);
        }
    }, [collapsed]);

    const isReadOnly = Boolean(user?.readOnly);

    const handleExitViewAs = () => {
        const adminToken = localStorage.getItem("admin_master_token");
        if (adminToken) {
            setTokens(adminToken);
            localStorage.removeItem("admin_master_token");
            window.location.href = "/admin/dashboard";
        } else {
            clearTokens();
            logout();
            navigate("/login");
        }
    };

    const generalItems = [
        {
            label: "Bảng điều khiển",
            path: "/admin/dashboard",
            icon: LayoutDashboard,
        },
    ];

    const managementItems = [
        {
            label: "Duyệt Giáo viên",
            path: "/admin/teacher-requests",
            icon: UserCheck,
        },
        {
            label: "Tra cứu Người dùng",
            path: "/admin/users",
            icon: Users,
        },
        {
            label: "Trường & Lớp học",
            path: "/admin/schools",
            icon: School,
        },
    ];

    const systemItems = [
        {
            label: "Sức khỏe Hệ thống",
            path: "/admin/system-health",
            icon: Activity,
        },
    ];

    const isActive = (path: string) => location.pathname === path;

    const initials = user?.fullName
        ? user.fullName.split(" ").pop()?.substring(0, 2).toUpperCase()
        : "AD";

    const renderNavLink = (item: { label: string; path: string; icon: React.ElementType }) => {
        const active = isActive(item.path);
        return (
            <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center gap-3 rounded-xl transition-all duration-150 cursor-pointer select-none
          ${collapsed ? "justify-center px-0 py-3 w-10 h-10 mx-auto" : "px-3 py-2.5 w-full"}
          ${active
                        ? "bg-primary-light text-primary"
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                    }
        `}
            >
                <item.icon
                    className={`shrink-0 transition-transform ${collapsed ? "w-5 h-5" : "w-[18px] h-[18px]"
                        } ${active ? "text-primary" : ""}`}
                />
                {!collapsed && (
                    <span className="text-sm font-semibold truncate">{item.label}</span>
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-left">
            {/* View-As Mode Warning Banner */}
            {isReadOnly && (
                <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-6 py-2.5 text-xs sm:text-sm flex items-center justify-between sticky top-0 z-50 shadow-xs">
                    <div className="flex items-center gap-2 font-medium">
                        <Eye className="w-4 h-4 text-amber-600 animate-pulse" />
                        <span>
                            <strong>Chế độ Quan sát (Read-Only)</strong> đang kích hoạt cho tài khoản:{" "}
                            <span className="font-bold text-amber-950 underline">{user?.fullName || user?.username}</span> ({user?.role}). Mọi thao tác chỉnh sửa đều bị khóa.
                        </span>
                    </div>
                    <button
                        onClick={handleExitViewAs}
                        className="flex items-center gap-1.5 px-3 py-1 bg-amber-200/60 hover:bg-amber-200 border border-amber-300 rounded-lg text-amber-950 text-xs font-semibold transition cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Thoát Chế độ Xem
                    </button>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside
                    className={`bg-white border-r border-border flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out ${collapsed ? "w-[68px]" : "w-64"
                        }`}
                >
                    {/* Top: Logo + Toggle + Nav */}
                    <div className="flex flex-col overflow-hidden">
                        {/* Logo area */}
                        <div
                            className={`flex items-center h-[64px] px-4 border-b border-border shrink-0 ${collapsed ? "justify-center" : "justify-between"
                                }`}
                        >
                            {!collapsed && (
                                <Logo imgSize="w-6 h-6" to="/admin/dashboard" />
                            )}

                            <button
                                onClick={() => setCollapsed((v) => !v)}
                                title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                                className={`p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-all active:scale-95 cursor-pointer shrink-0 ${collapsed ? "w-10 h-10 flex items-center justify-center" : ""
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
                                        Tổng Quan
                                    </p>
                                )}
                                {generalItems.map(renderNavLink)}
                            </div>

                            {/* Management section */}
                            <div className="space-y-1">
                                {!collapsed && (
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 px-3">
                                        Quản Trị
                                    </p>
                                )}
                                {managementItems.map(renderNavLink)}
                            </div>

                            {/* Technical Monitoring section */}
                            <div className="space-y-1">
                                {!collapsed && (
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 px-3">
                                        Hệ Thống
                                    </p>
                                )}
                                {systemItems.map(renderNavLink)}
                            </div>
                        </nav>
                    </div>

                    {/* Bottom: User info + Logout */}
                    <div
                        className={`border-t border-border py-3 px-2 flex flex-col gap-2 shrink-0 ${collapsed ? "items-center" : ""
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
                                        title={user?.fullName || user?.username}
                                    >
                                        {user?.fullName || user?.username || "Admin"}
                                    </p>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                        Quản Trị Viên
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

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 overflow-y-auto p-8 lg:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
