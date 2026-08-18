import React from 'react';
import {
  Database,
  Cpu,
  HardDrive,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Zap,
} from 'lucide-react';
import type { SystemHealthData, ApiMetricsData } from '@/types/admin';

interface SystemHealthGaugesProps {
  health: SystemHealthData | null;
  metrics: ApiMetricsData | null;
  loading: boolean;
}

export const SystemHealthGauges: React.FC<SystemHealthGaugesProps> = ({
  health,
  metrics,
  loading,
}) => {
  if (loading || !health) {
    return (
      <div className="py-16 text-center text-neutral-400 bg-white border border-border rounded-2xl">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-2" />
        <span>Đang thu thập dữ liệu hiệu năng máy chủ...</span>
      </div>
    );
  }

  const poolPercentage = health.maxDbConnections > 0
    ? Math.round((health.activeDbConnections / health.maxDbConnections) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Pool Warning Banner (BR-ADMIN-05) */}
      {health.poolWarning && (
        <div className="p-4 bg-warning-light border border-amber-300 rounded-2xl flex items-center gap-3 text-warning-text shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Cảnh báo Quá tải Kết nối CSDL (HikariCP Pool Warning)</p>
            <p className="text-amber-800">
              Số lượng kết nối CSDL đang hoạt động ({health.activeDbConnections}/{health.maxDbConnections}) vượt ngưỡng an toàn 80%.
            </p>
          </div>
        </div>
      )}

      {/* Grid of Main Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Database Connections */}
        <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">CSDL HikariCP</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              health.poolWarning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-neutral-900">{health.activeDbConnections}</span>
              <span className="text-xs text-neutral-500">/ {health.maxDbConnections} pool</span>
            </div>
            <div className="mt-3 w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  health.poolWarning ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(poolPercentage, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-100">
            <span>Trạng thái: <strong className="text-emerald-700 font-bold">{health.dbStatus}</strong></span>
            <span>{poolPercentage}% sử dụng</span>
          </div>
        </div>

        {/* 2. JVM Memory */}
        <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Bộ nhớ JVM</span>
            <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-neutral-900">{health.jvmUsedMemoryMb}</span>
              <span className="text-xs text-neutral-500">/ {health.jvmMaxMemoryMb} MB</span>
            </div>
            <div className="mt-3 w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min(health.jvmMemoryUsagePercent, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-100">
            <span>Mức dùng RAM</span>
            <span className="text-primary font-bold">{health.jvmMemoryUsagePercent}%</span>
          </div>
        </div>

        {/* 3. Disk Storage */}
        <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Dung lượng Đĩa</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-neutral-900">{health.diskFreeSpaceGb}</span>
              <span className="text-xs text-neutral-500">GB trống</span>
            </div>
            <div className="mt-3 w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${Math.max(10, 100 - (health.diskFreeSpaceGb / (health.diskTotalSpaceGb || 1)) * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-100">
            <span>Tổng dung lượng</span>
            <span>{health.diskTotalSpaceGb} GB</span>
          </div>
        </div>

        {/* 4. Cron Scheduler */}
        <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Khóa sổ Tuần</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Đang kích hoạt</span>
            </p>
            <p className="text-xs text-neutral-500 mt-1">23:59 Chủ Nhật hàng tuần</p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-100">
            <span>Múi giờ:</span>
            <span className="font-bold text-purple-700">{health.serverTimezone}</span>
          </div>
        </div>
      </div>

      {/* API Performance Overview */}
      {metrics && (
        <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-neutral-900">Chỉ số Hiệu năng API</h2>
            </div>
            <span className="text-xs text-neutral-400">Thu thập theo thời gian thực</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-neutral-50 border border-border rounded-xl">
              <p className="text-[10px] uppercase font-bold text-neutral-500">Tổng Request</p>
              <p className="text-2xl font-extrabold text-neutral-900 mt-1">{metrics.totalRequests24h}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Yêu cầu được ghi nhận</p>
            </div>

            <div className="p-4 bg-neutral-50 border border-border rounded-xl">
              <p className="text-[10px] uppercase font-bold text-neutral-500">Độ trễ trung bình</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-neutral-900">{metrics.avgResponseTimeMs}</span>
                <span className="text-xs text-neutral-500">ms</span>
              </div>
              <p className="text-[11px] text-emerald-600 mt-0.5 flex items-center gap-1 font-medium">
                <Zap className="w-3 h-3" />
                <span>Phản hồi ổn định</span>
              </p>
            </div>

            <div className="p-4 bg-neutral-50 border border-border rounded-xl">
              <p className="text-[10px] uppercase font-bold text-neutral-500">Tỷ lệ Lỗi (Error Rate)</p>
              <p className="text-2xl font-extrabold text-neutral-900 mt-1">{metrics.errorRatePercent}%</p>
              <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-0.5 font-medium">
                <span className="text-emerald-700">2xx: {metrics.count2xx}</span>
                <span className="text-amber-700">4xx: {metrics.count4xx}</span>
                <span className="text-red-700">5xx: {metrics.count5xx}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
