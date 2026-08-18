import api from '../lib/axios';
import type { PageResponse } from '../types/admin';
import type {
    AuditLog,
    AuditLogFilterParams,
    AuditActionSummary,
} from '../types/audit';

export const auditService = {
    getAuditLogs: async (params?: AuditLogFilterParams): Promise<PageResponse<AuditLog>> => {
        const res = await api.get<PageResponse<AuditLog>>('/admin/audit-logs', { params });
        return res.data;
    },

    getAuditLogById: async (id: number): Promise<AuditLog> => {
        const res = await api.get<AuditLog>(`/admin/audit-logs/${id}`);
        return res.data;
    },

    getActionsSummary: async (): Promise<AuditActionSummary[]> => {
        const res = await api.get<AuditActionSummary[]>('/admin/audit-logs/actions-summary');
        return res.data;
    },

    exitViewAsSession: async (targetUserId: number): Promise<void> => {
        await api.post(`/admin/view-as/exit/${targetUserId}`);
    },
};

export default auditService;
