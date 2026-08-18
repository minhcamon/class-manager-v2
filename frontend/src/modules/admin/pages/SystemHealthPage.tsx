import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import type { ApiMetricsData, SystemHealthData } from '@/types/admin';
import { AdminLayout } from '../components/AdminLayout';
import { SystemHealthGauges } from '../components/SystemHealthGauges';

export const SystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [metrics, setMetrics] = useState<ApiMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const [h, m] = await Promise.all([
        adminService.getSystemHealth(),
        adminService.getApiMetrics(),
      ]);
      setHealth(h);
      setMetrics(m);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu sức khỏe hệ thống';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      adminService.getSystemHealth(),
      adminService.getApiMetrics(),
    ]).then(([h, m]) => {
      if (isMounted) {
        setHealth(h);
        setMetrics(m);
        setLoading(false);
      }
    }).catch((err: unknown) => {
      if (isMounted) {
        const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu sức khỏe hệ thống';
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-primary" />
              <span>Sức Khỏe Kỹ Thuật & Giám Sát API</span>
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Theo dõi kết nối CSDL HikariCP, hiệu suất bộ nhớ JVM Runtime, dung lượng ổ đĩa và thông số API theo thời gian thực.
            </p>
          </div>

          <button
            onClick={fetchHealthData}
            disabled={loading}
            className="px-4 py-2 bg-white hover:bg-neutral-50 border border-border text-neutral-700 rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới chỉ số</span>
          </button>
        </div>

        <SystemHealthGauges
          health={health}
          metrics={metrics}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
};
