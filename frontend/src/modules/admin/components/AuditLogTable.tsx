import React from 'react';
import {
    Clock,
    Server,
    Eye,
    ChevronLeft,
    ChevronRight,
    Layers,
    FileText,
} from 'lucide-react';
import type { AuditLog } from '@/types/audit';
import AuditActionBadge from './AuditActionBadge';

interface AuditLogTableProps {
    logs: AuditLog[];
    loading: boolean;
    page: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    onPageChange: (newPage: number) => void;
    onSelectLog: (log: AuditLog) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
    logs,
    loading,
    page,
    totalPages,
    totalElements,
    pageSize,
    onPageChange,
    onSelectLog,
}) => {
    const formatDate = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleString('vi-VN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch {
            return isoString;
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden text-left flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[11px]">
                            <th className="py-3 px-4 w-[160px]">Thời gian</th>
                            <th className="py-3 px-4 min-w-[180px]">Người thực hiện (Actor)</th>
                            <th className="py-3 px-4 min-w-[200px]">Hành động (Action)</th>
                            <th className="py-3 px-4 min-w-[160px]">Đối tượng (Target)</th>
                            <th className="py-3 px-4 min-w-[220px]">Mô tả nghiệp vụ</th>
                            <th className="py-3 px-4 w-[100px] text-right">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {loading ? (
                            Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, idx) => (
                                <tr key={idx} className="animate-pulse">
                                    <td className="py-4 px-4">
                                        <div className="h-4 bg-neutral-100 rounded-md w-24" />
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 bg-neutral-100 rounded-full shrink-0" />
                                            <div className="space-y-1 w-full">
                                                <div className="h-3.5 bg-neutral-100 rounded-md w-28" />
                                                <div className="h-2.5 bg-neutral-100 rounded-md w-16" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="h-6 bg-neutral-100 rounded-md w-36" />
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="h-5 bg-neutral-100 rounded-md w-24" />
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="h-3.5 bg-neutral-100 rounded-md w-44" />
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="h-7 bg-neutral-100 rounded-lg w-16 ml-auto" />
                                    </td>
                                </tr>
                            ))
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center text-neutral-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 border border-neutral-200/60">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <p className="font-semibold text-neutral-700 text-sm">
                                            Không tìm thấy nhật ký kiểm toán nào
                                        </p>
                                        <p className="text-xs text-neutral-400 max-w-sm">
                                            Hãy thử thay đổi điều kiện trong bộ lọc để tra cứu lại lịch sử hệ thống.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => {
                                const isSystem = log.actorType === 'SYSTEM';
                                const initials = log.actorName
                                    ? log.actorName.split(' ').pop()?.substring(0, 2).toUpperCase()
                                    : isSystem
                                        ? 'SY'
                                        : 'US';

                                const hasDiff = log.oldValue !== null || log.newValue !== null;

                                return (
                                    <tr
                                        key={log.id}
                                        onClick={() => onSelectLog(log)}
                                        className="hover:bg-neutral-50/80 transition cursor-pointer group"
                                    >
                                        {/* 1. Timestamp */}
                                        <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                                            <div className="flex items-center gap-1.5" title={log.createdAt}>
                                                <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                                <span>{formatDate(log.createdAt)}</span>
                                            </div>
                                        </td>

                                        {/* 2. Actor */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2.5">
                                                {isSystem ? (
                                                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200 shadow-2xs">
                                                        <Server className="w-3.5 h-3.5" />
                                                    </div>
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-primary-light text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary-border/20 shadow-2xs">
                                                        {initials}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-bold text-neutral-900 truncate">
                                                        {log.actorName || (isSystem ? 'Hệ thống tự động' : 'Ẩn danh')}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                                                        <span className="font-semibold text-neutral-600">
                                                            {log.actorRole || log.actorType}
                                                        </span>
                                                        {log.actorId && (
                                                            <span>• ID: #{log.actorId}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 3. Action */}
                                        <td className="py-3.5 px-4">
                                            <AuditActionBadge action={log.action} />
                                        </td>

                                        {/* 4. Target */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-semibold text-neutral-700 text-[11px] border border-neutral-200/60 flex items-center gap-1">
                                                    <Layers className="w-3 h-3 text-neutral-400" />
                                                    {log.targetEntity}
                                                </span>
                                                {log.targetId && (
                                                    <code className="text-[10px] bg-neutral-50 px-1 py-0.5 rounded border border-neutral-200 text-neutral-600 font-mono">
                                                        #{log.targetId}
                                                    </code>
                                                )}
                                            </div>
                                        </td>

                                        {/* 5. Description */}
                                        <td className="py-3.5 px-4 text-neutral-600 max-w-[280px]">
                                            <p className="truncate text-xs font-medium" title={log.description || ''}>
                                                {log.description || '—'}
                                            </p>
                                            {hasDiff && (
                                                <span className="text-[10px] text-primary font-semibold flex items-center gap-1 mt-0.5">
                                                    • Có bản ghi thay đổi dữ liệu
                                                </span>
                                            )}
                                        </td>

                                        {/* 6. Action Button */}
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectLog(log);
                                                }}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-primary-light hover:text-primary text-neutral-700 font-semibold text-xs transition cursor-pointer shadow-2xs group-hover:border-primary/30"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Xem</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-neutral-200 bg-neutral-50/50 gap-3 text-xs text-neutral-500">
                <div>
                    Hiển thị <span className="font-bold text-neutral-800">{logs.length}</span> /{' '}
                    <span className="font-bold text-neutral-800">{totalElements}</span> bản ghi (Trang{' '}
                    <span className="font-bold text-neutral-800">{totalPages > 0 ? page + 1 : 0}</span> / {totalPages})
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 0 || loading}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:pointer-events-none text-neutral-700 font-semibold transition cursor-pointer shadow-2xs"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                    </button>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages - 1 || loading}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:pointer-events-none text-neutral-700 font-semibold transition cursor-pointer shadow-2xs"
                    >
                        Sau
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditLogTable;
