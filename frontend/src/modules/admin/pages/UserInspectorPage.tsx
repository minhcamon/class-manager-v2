import React, { useEffect, useState, useCallback } from 'react';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import type { AdminUser, AdminUserDetail, Role, SupportActionPayload } from '@/types/admin';
import { getTokens, setTokens } from '@/utils/utils';
import { AdminLayout } from '../components/AdminLayout';
import { UserInspectorTable } from '../components/UserInspectorTable';
import { UserDetailModal } from '../components/UserDetailModal';
import { SupportActionModal } from '../components/SupportActionModal';

export const UserInspectorPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [supportModalUser, setSupportModalUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.searchUsers({
        query: searchQuery.trim() || undefined,
        role: selectedRole === 'ALL' ? undefined : selectedRole,
        page: currentPage,
        size: 15,
      });
      setUsers(res.content);
      setTotalPages(res.totalPages || 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tìm kiếm người dùng';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedRole, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleSelectUser = async (user: AdminUser) => {
    setSelectedUser(user);
    setDetailLoading(true);
    try {
      const detail = await adminService.getUserDetail(user.id);
      setUserDetail(detail);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải chi tiết hồ sơ';
      toast.error(msg);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSupportAction = async (payload: SupportActionPayload) => {
    try {
      const updatedDetail = await adminService.executeSupportAction(payload);
      toast.success('Thực thi hành động hỗ trợ thành công!');
      setUserDetail(updatedDetail);
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Hành động hỗ trợ thất bại';
      toast.error(msg);
      throw err;
    }
  };

  const handleViewAs = async (user: AdminUser) => {
    if (!window.confirm(`Kích hoạt chế độ Quan sát (Read-Only) cho tài khoản ${user.fullName} (${user.role})?`)) {
      return;
    }

    try {
      const session = await adminService.viewAsUser(user.id);
      const currentToken = getTokens();
      if (currentToken) {
        localStorage.setItem('admin_master_token', currentToken);
      }
      setTokens(session.accessToken);
      toast.info(`Đã vào chế độ Quan sát (Read-Only) cho tài khoản ${user.fullName}`);

      if (session.targetRole === 'TEACHER') {
        window.location.href = '/teacher/dashboard';
      } else if (session.targetRole === 'STUDENT') {
        window.location.href = '/student/dashboard';
      } else {
        window.location.href = '/';
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tạo phiên quan sát View-As';
      toast.error(msg);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-primary" />
            <span>Tra Cứu & Hỗ Trợ Người Dùng</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Tìm kiếm tài khoản trên toàn hệ thống, xem timeline hồ sơ, đặt lại mật khẩu, và quan sát View-As chế độ chỉ đọc.
          </p>
        </div>

        <UserInspectorTable
          users={users}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(0);
          }}
          selectedRole={selectedRole}
          onRoleChange={(r) => {
            setSelectedRole(r);
            setCurrentPage(0);
          }}
          onSelectUser={handleSelectUser}
          onOpenSupport={(u) => setSupportModalUser(u)}
          onViewAs={handleViewAs}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* User Detail Dossier Modal */}
        <UserDetailModal
          isOpen={Boolean(selectedUser)}
          onClose={() => {
            setSelectedUser(null);
            setUserDetail(null);
          }}
          userDetail={userDetail}
          loading={detailLoading}
          onOpenSupport={() => {
            if (selectedUser) {
              setSupportModalUser(selectedUser);
            }
          }}
          onViewAs={() => {
            if (selectedUser) {
              handleViewAs(selectedUser);
            }
          }}
        />

        {/* Support Action Dialog */}
        <SupportActionModal
          isOpen={Boolean(supportModalUser)}
          onClose={() => setSupportModalUser(null)}
          targetUser={supportModalUser}
          onSubmit={handleSupportAction}
        />
      </div>
    </AdminLayout>
  );
};
