import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import {
    type AuditAction,
    type AuditActorType,
    type AuditTargetEntity,
    type AuditLogFilterParams,
    ACTION_METADATA_MAP,
} from '@/types/audit';

interface AuditLogFilterBarProps {
    filters: AuditLogFilterParams;
    onFilterChange: (filters: AuditLogFilterParams) => void;
    onReset: () => void;
}

const TARGET_ENTITIES: AuditTargetEntity[] = [
    'USER',
    'SCHOOL',
    'CLASS',
    'GROUP',
    'FORM_TEMPLATE',
    'STUDENT_PROFILE',
    'POINT_LOG',
    'WEEKLY_REPORT',
    'TEACHER_REQUEST',
    'SYSTEM',
];

export const AuditLogFilterBar: React.FC<AuditLogFilterBarProps> = ({
    filters,
    onFilterChange,
    onReset,
}) => {
    const handleFieldChange = (field: keyof AuditLogFilterParams, value: unknown) => {
        onFilterChange({
            ...filters,
            [field]: value === '' ? undefined : value,
            page: 0, // Reset to first page on filter change
        });
    };

    const hasActiveFilters = Boolean(
        filters.actorType ||
        filters.action ||
        filters.targetEntity ||
        filters.targetId ||
        filters.actorId ||
        filters.fromDate ||
        filters.toDate
    );

    return (
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4 text-left">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-800">
                    <Filter className="w-4 h-4 text-primary" />
                    <span>Bộ Lọc Nhật Ký Kiểm Toán</span>
                </div>

                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-danger-text transition cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Đặt lại bộ lọc
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* 1. Loại Actor */}
                <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                        Loại Người thực hiện
                    </label>
                    <select
                        value={filters.actorType || ''}
                        onChange={(e) => handleFieldChange('actorType', e.target.value as AuditActorType)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 text-xs font-medium focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-hidden transition"
                    >
                        <option value="">Tất cả (User & System)</option>
                        <option value="USER">Người dùng (USER)</option>
                        <option value="SYSTEM">Hệ thống tự động (SYSTEM)</option>
                    </select>
                </div>

                {/* 2. Loại Action */}
                <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                        Hành động (Action)
                    </label>
                    <select
                        value={filters.action || ''}
                        onChange={(e) => handleFieldChange('action', e.target.value as AuditAction)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 text-xs font-medium focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-hidden transition truncate"
                    >
                        <option value="">Tất cả hành động</option>
                        {Object.entries(ACTION_METADATA_MAP).map(([key, meta]) => (
                            <option key={key} value={key}>
                                [{meta.category}] {meta.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 3. Đối tượng Target Entity */}
                <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                        Đối tượng tác động
                    </label>
                    <select
                        value={filters.targetEntity || ''}
                        onChange={(e) => handleFieldChange('targetEntity', e.target.value as AuditTargetEntity)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 text-xs font-medium focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-hidden transition"
                    >
                        <option value="">Tất cả đối tượng</option>
                        {TARGET_ENTITIES.map((entity) => (
                            <option key={entity} value={entity}>
                                {entity}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 4. Target ID */}
                <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                        ID Đối tượng
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Ví dụ: 10, batch-5..."
                            value={filters.targetId || ''}
                            onChange={(e) => handleFieldChange('targetId', e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 text-xs font-medium focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-hidden transition"
                        />
                        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {/* 5. Date From */}
                <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                        Từ ngày
                    </label>
                    <input
                        type="datetime-local"
                        value={filters.fromDate ? filters.fromDate.substring(0, 16) : ''}
                        onChange={(e) => handleFieldChange('fromDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 text-xs font-medium focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-hidden transition"
                    />
                </div>

                {/* 6. Date To */}
                <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                        Đến ngày
                    </label>
                    <input
                        type="datetime-local"
                        value={filters.toDate ? filters.toDate.substring(0, 16) : ''}
                        onChange={(e) => handleFieldChange('toDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 text-xs font-medium focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-hidden transition"
                    />
                </div>

                {/* 7. Actor ID */}
                <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                        ID Người thực hiện
                    </label>
                    <input
                        type="number"
                        placeholder="ID người dùng..."
                        value={filters.actorId || ''}
                        onChange={(e) => handleFieldChange('actorId', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 text-xs font-medium focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-hidden transition"
                    />
                </div>
            </div>
        </div>
    );
};

export default AuditLogFilterBar;
