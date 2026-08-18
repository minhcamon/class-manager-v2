import React from 'react';
import { type AuditAction, ACTION_METADATA_MAP, type ActionCategory } from '@/types/audit';

interface AuditActionBadgeProps {
    action: AuditAction;
    showCategory?: boolean;
    className?: string;
}

const CATEGORY_STYLES: Record<ActionCategory, { bg: string; text: string; border: string; dot: string; label: string }> = {
    SECURITY: {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        label: 'Bảo mật',
    },
    BUSINESS: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        label: 'Nghiệp vụ',
    },
    SYSTEM: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
        label: 'Hệ thống',
    },
    DATA: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        label: 'Dữ liệu',
    },
    AUTH: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Xác thực',
    },
};

export const AuditActionBadge: React.FC<AuditActionBadgeProps> = ({
    action,
    showCategory = false,
    className = '',
}) => {
    const meta = ACTION_METADATA_MAP[action] || {
        label: action,
        category: 'BUSINESS' as ActionCategory,
        description: '',
    };

    const style = CATEGORY_STYLES[meta.category] || CATEGORY_STYLES.BUSINESS;

    return (
        <div className={`inline-flex items-center gap-1.5 ${className}`}>
            <span
                title={meta.description || meta.label}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${style.bg} ${style.text} ${style.border} transition-colors shadow-2xs select-none`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
                <span>{meta.label}</span>
            </span>

            {showCategory && (
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    ({style.label})
                </span>
            )}
        </div>
    );
};

export default AuditActionBadge;
