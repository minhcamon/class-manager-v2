import React, { useEffect, useState } from 'react';
import { UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import type { TeacherRequest, TeacherRequestStatus } from '@/types/admin';
import { AdminLayout } from '../components/AdminLayout';
import { TeacherRequestTable } from '../components/TeacherRequestTable';

export const TeacherRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TeacherRequestStatus | 'ALL'>('PENDING');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTeacherRequests({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page: 0,
        size: 50,
      });
      setRequests(res.content);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách yêu cầu';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    adminService.getTeacherRequests({
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      page: 0,
      size: 50,
    }).then((res) => {
      if (isMounted) {
        setRequests(res.content);
        setLoading(false);
      }
    }).catch((err: unknown) => {
      if (isMounted) {
        const msg = err instanceof Error ? err.message : 'Không thể tải danh sách yêu cầu';
        toast.error(msg);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [statusFilter]);

  const handleApprove = async (id: number) => {
    try {
      await adminService.approveTeacherRequest(id);
      toast.success('Đã phê duyệt yêu cầu cấp vai trò Giáo viên thành công!');
      fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Phê duyệt thất bại';
      toast.error(msg);
    }
  };

  const handleReject = async (id: number, reason: string) => {
    try {
      await adminService.rejectTeacherRequest(id, reason);
      toast.success('Đã từ chối yêu cầu thành công.');
      fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Từ chối thất bại';
      toast.error(msg);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-primary" />
            <span>Phê Duyệt Cấp Quyền Giáo Viên</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Điều phối và kiểm duyệt các yêu cầu vai trò `TEACHER` khi người dùng Onboard theo quy tắc kiểm soát cổng vào.
          </p>
        </div>

        <TeacherRequestTable
          requests={requests}
          loading={loading}
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </AdminLayout>
  );
};
