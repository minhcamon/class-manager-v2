import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Users,
  BookOpen,
  School,
  Clock,
  ArrowUpRight,
  Shield,
  Activity,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import type { AdminDashboardOverview } from '@/types/admin';
import { AdminLayout } from '../components/AdminLayout';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    adminService.getDashboardOverview().then((data) => {
      if (isMounted) {
        setOverview(data);
        setLoading(false);
      }
    }).catch((err: unknown) => {
      if (isMounted) {
        const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu tổng quan';
        toast.error(msg);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = [
    {
      label: 'Tổng Người dùng',
      value: overview?.totalUsers ?? 0,
      sub: `${overview?.totalTeachers ?? 0} GV • ${overview?.totalStudents ?? 0} HS`,
      icon: Users,
      iconBg: 'bg-primary-light text-primary',
      action: () => navigate('/admin/users'),
    },
    {
      label: 'Yêu cầu GV Chờ duyệt',
      value: overview?.pendingTeacherRequests ?? 0,
      sub: (overview?.pendingTeacherRequests ?? 0) > 0 ? 'Cần xử lý ngay' : 'Không có yêu cầu tồn',
      icon: Clock,
      iconBg: (overview?.pendingTeacherRequests ?? 0) > 0
        ? 'bg-amber-100 text-amber-700'
        : 'bg-neutral-100 text-neutral-500',
      highlight: (overview?.pendingTeacherRequests ?? 0) > 0,
      action: () => navigate('/admin/teacher-requests'),
    },
    {
      label: 'Tổng Trường học',
      value: overview?.totalSchools ?? 0,
      sub: 'Đơn vị trường trong hệ thống',
      icon: School,
      iconBg: 'bg-emerald-50 text-emerald-700',
      action: () => navigate('/admin/schools'),
    },
    {
      label: 'Tổng Lớp học',
      value: overview?.totalClasses ?? 0,
      sub: 'Lớp học đang quản lý',
      icon: BookOpen,
      iconBg: 'bg-purple-50 text-purple-700',
      action: () => navigate('/admin/schools'),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Trung Tâm Điều Hành Hệ Thống
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Giám sát toàn diện người dùng, phê duyệt giáo viên và kiểm tra hiệu năng kỹ thuật.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Hệ thống: {overview?.quickHealth?.dbStatus || 'ONLINE'}</span>
          </div>
        </div>

        {/* 4 Primary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={card.action}
                className={`bg-white border rounded-2xl p-6 transition-all duration-200 hover:shadow-md cursor-pointer group flex flex-col justify-between ${
                  card.highlight
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg} transition-transform group-hover:scale-110`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-3xl font-extrabold text-neutral-900">
                    {loading ? '...' : card.value}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
                    <span>{card.sub}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Operations & Server Health Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Operations (2 cols) */}
          <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">Tác vụ Quản trị Cốt lõi</h2>
              <span className="text-xs text-neutral-400">BR-ADMIN Policy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div
                onClick={() => navigate('/admin/teacher-requests')}
                className="p-4 rounded-xl border border-border bg-neutral-50 hover:bg-white hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-warning-light text-warning-text flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-neutral-900 group-hover:text-primary transition">
                      Duyệt cấp quyền Giáo viên
                    </h3>
                    <p className="text-[11px] text-neutral-500">Phê duyệt hoặc từ chối kèm lý do bắt buộc</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/admin/users')}
                className="p-4 rounded-xl border border-border bg-neutral-50 hover:bg-white hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-neutral-900 group-hover:text-primary transition">
                      Hỗ trợ & Đặt lại Mật khẩu
                    </h3>
                    <p className="text-[11px] text-neutral-500">Thao tác can thiệp tài khoản có lưu vết audit</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/admin/users')}
                className="p-4 rounded-xl border border-border bg-neutral-50 hover:bg-white hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-neutral-900 group-hover:text-primary transition">
                      Quan sát View-As
                    </h3>
                    <p className="text-[11px] text-neutral-500">Truy cập giao diện chế độ chỉ đọc (Read-only)</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate('/admin/schools')}
                className="p-4 rounded-xl border border-border bg-neutral-50 hover:bg-white hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <School className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-neutral-900 group-hover:text-primary transition">
                      Trường học & Lớp học
                    </h3>
                    <p className="text-[11px] text-neutral-500">Xem tóm tắt sĩ số và phân công giáo viên</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Technical Health (1 col) */}
          <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span>Sức Khỏe Kỹ Thuật</span>
                </h2>
                <button
                  onClick={() => navigate('/admin/system-health')}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Chi tiết
                </button>
              </div>

              <div className="space-y-3 mt-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-border">
                  <span className="text-neutral-500">Kết nối HikariCP:</span>
                  <span className="font-bold text-neutral-900">
                    {overview?.quickHealth?.activeDbConnections ?? 0} / {overview?.quickHealth?.maxDbConnections ?? 10}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-border">
                  <span className="text-neutral-500">Mức sử dụng RAM (JVM):</span>
                  <span className="font-bold text-neutral-900">
                    {overview?.quickHealth?.jvmMemoryUsagePercent ?? 0}% ({overview?.quickHealth?.jvmUsedMemoryMb ?? 0} MB)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-border">
                  <span className="text-neutral-500">Dung lượng ổ cứng:</span>
                  <span className="font-bold text-neutral-900">
                    {overview?.quickHealth?.diskFreeSpaceGb ?? 0} GB trống
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/system-health')}
              className="w-full py-2.5 bg-neutral-50 hover:bg-neutral-100 border border-border text-neutral-700 font-semibold rounded-xl text-xs transition cursor-pointer"
            >
              Mở Bảng Giám Sát Kỹ Thuật
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
