import React from 'react';
import {
    User,
    Server,
    Shield,
    Clock,
    Globe,
    FileText,
    ArrowRight,
    Plus,
    Minus,
    Layers,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import type { AuditLog } from '@/types/audit';
import AuditActionBadge from './AuditActionBadge';

interface AuditDetailModalProps {
    log: AuditLog | null;
    onClose: () => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({ log, onClose }) => {
    const formatDate = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleString('vi-VN', {
                year: 'numeric',
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

    const isSystem = log?.actorType === 'SYSTEM';

    // Helper to compute keys diff
    const oldObj = log?.oldValue || {};
    const newObj = log?.newValue || {};
    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));

    const renderValue = (val: unknown): string => {
        if (val === null || val === undefined) return 'null';
        if (typeof val === 'object') return JSON.stringify(val, null, 2);
        return String(val);
    };

    return (
        <Dialog open={Boolean(log)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden text-left gap-0">
                {log && (
                    <>
                        {/* Header */}
                        <DialogHeader className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary-light text-primary border border-primary-border/30">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <DialogTitle className="font-bold text-neutral-900 text-base">
                                            Chi Tiết Bản Ghi Kiểm Toán #{log.id}
                                        </DialogTitle>
                                        <AuditActionBadge action={log.action} />
                                    </div>
                                    <DialogDescription className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                                        <span>{formatDate(log.createdAt)}</span>
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
                            {/* Actor & Target Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Actor Box */}
                                <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs space-y-2.5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                        {isSystem ? (
                                            <Server className="w-4 h-4 text-purple-600" />
                                        ) : (
                                            <User className="w-4 h-4 text-primary" />
                                        )}
                                        <span>Người thực hiện (Actor)</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-neutral-900 text-sm">
                                            {log.actorName || (isSystem ? 'Hệ thống tự động' : 'Ẩn danh')}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-semibold text-neutral-700">
                                                {log.actorRole || 'SYSTEM'}
                                            </span>
                                            {log.actorId && (
                                                <span className="text-neutral-400">ID: #{log.actorId}</span>
                                            )}
                                            <span className="text-neutral-300">•</span>
                                            <span className="capitalize font-medium text-neutral-600">
                                                Loại: {log.actorType}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Target Box */}
                                <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs space-y-2.5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                        <Layers className="w-4 h-4 text-amber-600" />
                                        <span>Đối tượng tác động (Target)</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs">
                                                {log.targetEntity}
                                            </span>
                                            {log.targetId && (
                                                <span className="font-semibold text-neutral-700 text-xs">
                                                    ID: <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-900">{log.targetId}</code>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-neutral-500 truncate" title={log.description || ''}>
                                            {log.description || 'Không có mô tả bổ sung'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Network Details */}
                            {(log.ipAddress || log.userAgent) && (
                                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-600 space-y-1">
                                    <div className="flex items-center gap-2 font-semibold text-neutral-700">
                                        <Globe className="w-3.5 h-3.5 text-neutral-400" />
                                        <span>Thông tin môi trường mạng (Client Context):</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5 text-neutral-500">
                                        <div>
                                            <span className="font-medium text-neutral-700">Địa chỉ IP: </span>
                                            <code>{log.ipAddress || 'N/A'}</code>
                                        </div>
                                        <div className="truncate" title={log.userAgent || ''}>
                                            <span className="font-medium text-neutral-700">Trình duyệt / Thiết bị: </span>
                                            <code>{log.userAgent || 'N/A'}</code>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Snapshot Diff Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                                        <FileText className="w-4 h-4 text-neutral-400" />
                                        Thay đổi dữ liệu (Snapshot Diff)
                                    </h4>
                                </div>

                                {allKeys.length === 0 ? (
                                    <div className="p-6 rounded-xl border border-dashed border-neutral-200 text-center text-neutral-400 text-xs">
                                        Bản ghi này là sự kiện xác thực/hành động không có thay đổi trực tiếp trên thuộc tính dữ liệu.
                                    </div>
                                ) : (
                                    <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-2xs divide-y divide-neutral-100 bg-white">
                                        <div className="grid grid-cols-12 bg-neutral-50/80 px-4 py-2.5 text-xs font-bold text-neutral-600 border-b border-neutral-200">
                                            <div className="col-span-4">Trường dữ liệu (Field)</div>
                                            <div className="col-span-4">Giá trị trước đó (Old)</div>
                                            <div className="col-span-4">Giá trị sau khi đổi (New)</div>
                                        </div>

                                        {allKeys.map((key) => {
                                            const oldVal = oldObj[key];
                                            const newVal = newObj[key];
                                            const isAdded = oldVal === undefined && newVal !== undefined;
                                            const isRemoved = oldVal !== undefined && newVal === undefined;
                                            const isChanged = oldVal !== undefined && newVal !== undefined && JSON.stringify(oldVal) !== JSON.stringify(newVal);

                                            return (
                                                <div
                                                    key={key}
                                                    className={`grid grid-cols-12 px-4 py-2.5 text-xs transition-colors items-center gap-2 ${isAdded
                                                        ? 'bg-emerald-50/40'
                                                        : isRemoved
                                                            ? 'bg-rose-50/40'
                                                            : isChanged
                                                                ? 'bg-amber-50/30'
                                                                : ''
                                                        }`}
                                                >
                                                    <div className="col-span-4 font-mono font-bold text-neutral-800 flex items-center gap-1.5 truncate">
                                                        {isAdded && <Plus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                                        {isRemoved && <Minus className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                                                        {isChanged && <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                                                        <span title={key}>{key}</span>
                                                    </div>

                                                    <div className="col-span-4 font-mono text-neutral-600 break-all">
                                                        {oldVal !== undefined ? (
                                                            <span className={`${isChanged || isRemoved ? 'text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded line-through' : ''}`}>
                                                                {renderValue(oldVal)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-neutral-300 italic">—</span>
                                                        )}
                                                    </div>

                                                    <div className="col-span-4 font-mono text-neutral-900 break-all">
                                                        {newVal !== undefined ? (
                                                            <span className={`${isChanged || isAdded ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold' : ''}`}>
                                                                {renderValue(newVal)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-neutral-300 italic">—</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3.5 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl text-neutral-700 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                            >
                                Đóng
                            </button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AuditDetailModal;
