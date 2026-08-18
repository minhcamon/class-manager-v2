import React from 'react';
import {
  Search,
  User,
  School,
  Mail,
  Phone,
  Eye,
  KeyRound,
  ChevronRight,
  Shield,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import type { AdminUser, Role } from '@/types/admin';

interface UserInspectorTableProps {
  users: AdminUser[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRole: Role | 'ALL';
  onRoleChange: (r: Role | 'ALL') => void;
  onSelectUser: (user: AdminUser) => void;
  onOpenSupport: (user: AdminUser) => void;
  onViewAs: (user: AdminUser) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export const UserInspectorTable: React.FC<UserInspectorTableProps> = ({
  users,
  loading,
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  onSelectUser,
  onOpenSupport,
  onViewAs,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const roleBadges: Record<string, { label: string; bg: string; text: string; icon: React.FC<{ className?: string }> }> = {
    ADMIN: {
      label: 'Admin',
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      icon: Shield,
    },
    TEACHER: {
      label: 'Giáo viên',
      bg: 'bg-primary-light border-primary-border',
      text: 'text-primary',
      icon: BookOpen,
    },
    STUDENT: {
      label: 'Học sinh',
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      icon: GraduationCap,
    },
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, username, email, số điện thoại..."
            className="w-full bg-white border border-border rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition shadow-xs"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-semibold">Vai trò:</span>
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value as Role | 'ALL')}
            className="bg-white border border-border rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition cursor-pointer shadow-xs"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="TEACHER">Giáo viên (TEACHER)</option>
            <option value="STUDENT">Học sinh (STUDENT)</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-border text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-5">Người dùng</th>
                <th className="py-3.5 px-4">Liên hệ</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4">Trường học</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span>Đang tìm kiếm người dùng...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    Không tìm thấy người dùng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const badge = u.role ? roleBadges[u.role] : null;
                  const RoleIcon = badge ? badge.icon : User;

                  return (
                    <tr key={u.id} className="hover:bg-neutral-50/70 transition">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary-border/20">
                            {u.fullName?.charAt(0) || <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <button
                              onClick={() => onSelectUser(u)}
                              className="font-bold text-neutral-900 hover:text-primary transition text-left cursor-pointer"
                            >
                              {u.fullName || 'Chưa đặt tên'}
                            </button>
                            <p className="text-[11px] text-neutral-400">@{u.username || `id_${u.id}`}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          {u.googleEmail && (
                            <p className="flex items-center gap-1.5 text-neutral-700">
                              <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                              <span className="truncate max-w-40">{u.googleEmail}</span>
                            </p>
                          )}
                          {u.phoneNumber && (
                            <p className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                              <span>{u.phoneNumber}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {badge ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold ${badge.bg} ${badge.text}`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            {badge.label}
                          </span>
                        ) : u.teacherRequestStatus === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border bg-warning-light border-amber-200 text-warning-text text-[10px] font-bold">
                            Chờ duyệt GV
                          </span>
                        ) : (
                          <span className="text-[11px] text-neutral-400 italic">Chưa chọn role</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-neutral-700">
                          <School className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate max-w-37.5 font-medium">
                            {u.role === 'ADMIN'
                              ? 'Toàn hệ thống (Admin)'
                              : u.schoolName || 'Chưa có trường'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-neutral-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onSelectUser(u)}
                            className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs transition cursor-pointer"
                            title="Xem chi tiết hồ sơ"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenSupport(u)}
                            className="px-3 py-1.5 bg-primary-light hover:bg-primary/10 text-primary border border-primary-border/40 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Hành động hỗ trợ (Reset pass, đổi role...)"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Hỗ trợ</span>
                          </button>
                          <button
                            onClick={() => onViewAs(u)}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Quan sát tài khoản (View-As Read-only)"
                          >
                            <Eye className="w-3 h-3 text-amber-600" />
                            <span>Xem</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-border flex items-center justify-between text-xs text-neutral-500 bg-neutral-50/50">
            <span>
              Trang {currentPage + 1} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1.5 rounded-xl bg-white border border-border text-neutral-700 hover:bg-neutral-50 transition disabled:opacity-40 cursor-pointer shadow-xs"
              >
                Trước
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1.5 rounded-xl bg-white border border-border text-neutral-700 hover:bg-neutral-50 transition disabled:opacity-40 cursor-pointer shadow-xs"
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
