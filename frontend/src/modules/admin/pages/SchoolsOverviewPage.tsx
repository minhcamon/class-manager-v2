import React, { useEffect, useState } from 'react';
import { School } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import type { AdminSchoolSummary } from '@/types/admin';
import { AdminLayout } from '../components/AdminLayout';
import { SchoolsSummaryTable } from '../components/SchoolsSummaryTable';

export const SchoolsOverviewPage: React.FC = () => {
  const [schools, setSchools] = useState<AdminSchoolSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    adminService.getSchoolsSummary().then((data) => {
      if (isMounted) {
        setSchools(data);
        setLoading(false);
      }
    }).catch((err: unknown) => {
      if (isMounted) {
        const msg = err instanceof Error ? err.message : 'Không thể tải danh sách trường học';
        toast.error(msg);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5">
            <School className="w-6 h-6 text-primary" />
            <span>Tổng Quan Trường Học & Lớp Học</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Theo dõi thống kê số lượng giáo viên, lớp học và sĩ số trực tiếp theo từng trường học trên toàn hệ thống.
          </p>
        </div>

        <SchoolsSummaryTable
          schools={schools}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
};

export default SchoolsOverviewPage;
