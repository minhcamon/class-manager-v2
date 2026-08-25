/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from 'react';
import {
    ShieldCheck,
    RefreshCw,
    Activity,
    Lock,
    Database,
    Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { auditService } from '@/services/auditService';
import type {
    AuditLog,
    AuditLogFilterParams,
    AuditActionSummary,
} from '@/types/audit';
import AdminLayout from '../components/AdminLayout';
import AuditLogFilterBar from '../components/AuditLogFilterBar';
import AuditLogTable from '../components/AuditLogTable';
import AuditDetailModal from '../components/AuditDetailModal';

export const AuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [actionSummary, setActionSummary] = useState<AuditActionSummary[]>([]);

    const [filters, setFilters] = useState<AuditLogFilterParams>({
        page: 0,
        size: 15,
    });

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await auditService.getAuditLogs(filters);
            setLogs(res.content || []);
            setTotalPages(res.totalPages || 0);
            setTotalElements(res.totalElements || 0);
        } catch (err: unknown) {
            console.error('Failed to fetch audit logs:', err);
            toast.error('Không thể tải danh sách nhật ký kiểm toán');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const fetchSummary = async () => {
        try {
            const summary = await auditService.getActionsSummary();
            setActionSummary(summary || []);
        } catch (err) {
            console.debug('Failed to fetch actions summary:', err);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        fetchSummary();
    }, []);

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
    };

    const handleResetFilters = () => {
        setFilters({ page: 0, size: 15 });
    };

    // Calculate quick stats
    const totalRecordedLogs = actionSummary.reduce((acc, curr) => acc + Number(curr.count), 0);

    return (
        <AdminLayout>
            <div className="space-y-6 text-left">
                {/* Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2.5 rounded-xl bg-primary text-white shadow-sm shadow-primary/30">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                                    Nhật Ký Kiểm Toán (Audit Logs)
                                </h1>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    Truy vết toàn bộ lịch sử thao tác quản trị, bảo mật và thay đổi dữ liệu nghiệp vụ
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            fetchLogs();
                            fetchSummary();
                            toast.success('Đã làm mới dữ liệu kiểm toán');
                        }}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-700 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Làm mới</span>
                    </button>
                </div>

                {/* KPI / Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-neutral-400">
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                Tổng Sự Kiện Ghi Nhận
                            </span>
                            <Activity className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-2xl font-black text-neutral-900">
                            {totalRecordedLogs > 0 ? totalRecordedLogs.toLocaleString('vi-VN') : totalElements}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                            Lịch sử toàn hệ thống (append-only)
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-neutral-400">
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                Hành Động Bảo Mật
                            </span>
                            <Lock className="w-4 h-4 text-rose-500" />
                        </div>
                        <p className="text-2xl font-black text-rose-600">
                            {actionSummary
                                .filter((a) =>
                                    [
                                        'APPROVE_TEACHER_REQUEST',
                                        'REJECT_TEACHER_REQUEST',
                                        'SUPPORT_RESET_PASSWORD',
                                        'SUPPORT_CHANGE_ROLE',
                                        'SUPPORT_UNLOCK_USER',
                                        'ADMIN_START_VIEW_AS',
                                        'ADMIN_END_VIEW_AS',
                                    ].includes(a.action)
                                )
                                .reduce((acc, curr) => acc + Number(curr.count), 0)}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                            Reset pass, View-As, Phê duyệt
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-neutral-400">
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                Thay Đổi Nghiệp Vụ
                            </span>
                            <Database className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-black text-blue-600">
                            {actionSummary
                                .filter((a) =>
                                    [
                                        'CREATE_SCHOOL',
                                        'CREATE_CLASS',
                                        'END_CLASS',
                                        'CREATE_GROUP',
                                        'ASSIGN_GROUP_LEADER',
                                        'CREATE_POINT_LOG',
                                        'BATCH_POINT_EVALUATION',
                                        'TRIGGER_MANUAL_WEEK_LOCK',
                                    ].includes(a.action)
                                )
                                .reduce((acc, curr) => acc + Number(curr.count), 0)}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                            Lớp học, Tổ, Sổ điểm
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-1">
                        <div className="flex items-center justify-between text-neutral-400">
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                Hệ Thống Tự Động
                            </span>
                            <Zap className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-2xl font-black text-purple-600">
                            {actionSummary
                                .filter((a) => a.action === 'EXECUTE_WEEKLY_LOCK')
                                .reduce((acc, curr) => acc + Number(curr.count), 0)}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                            Cron tự động chốt tuần
                        </p>
                    </div>
                </div>

                {/* Filter Bar */}
                <AuditLogFilterBar
                    filters={filters}
                    onFilterChange={setFilters}
                    onReset={handleResetFilters}
                />

                {/* Data Table */}
                <AuditLogTable
                    logs={logs}
                    loading={loading}
                    page={filters.page || 0}
                    pageSize={filters.size || 15}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    onPageChange={handlePageChange}
                    onSelectLog={(log) => setSelectedLog(log)}
                />

                {/* Detail & Diff Modal */}
                <AuditDetailModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            </div>
        </AdminLayout>
    );
};

export default AuditLogsPage;
