import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  School,
  Mail,
  Phone,
  User,
  ShieldCheck,
} from 'lucide-react';
import type { TeacherRequest, TeacherRequestStatus } from '@/types/admin';
import { RejectReasonModal } from './RejectReasonModal';

interface TeacherRequestTableProps {
  requests: TeacherRequest[];
  loading: boolean;
  selectedStatus: TeacherRequestStatus | 'ALL';
  onStatusChange: (status: TeacherRequestStatus | 'ALL') => void;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number, reason: string) => Promise<void>;
}

export const TeacherRequestTable: React.FC<TeacherRequestTableProps> = ({
  requests,
  loading,
  selectedStatus,
  onStatusChange,
  onApprove,
  onReject,
}) => {
  const [rejectingTarget, setRejectingTarget] = useState<TeacherRequest | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleApprove = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn phê duyệt yêu cầu cấp vai trò Giáo viên này?')) {
      return;
    }
    setProcessingId(id);
    try {
      await onApprove(id);
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadges: Record<TeacherRequestStatus, { label: string; bg: string; text: string; icon: React.FC<{ className?: string }> }> = {
    PENDING: {
      label: 'Chờ duyệt',
      bg: 'bg-warning-light border-amber-200',
      text: 'text-warning-text',
      icon: Clock,
    },
    APPROVED: {
      label: 'Đã duyệt',
      bg: 'bg-success-light border-emerald-200',
      text: 'text-success-text',
      icon: CheckCircle,
    },
    REJECTED: {
      label: 'Đã từ chối',
      bg: 'bg-danger-light border-red-200',
      text: 'text-danger-text',
      icon: XCircle,
    },
  };

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
          <button
            key={st}
            onClick={() => onStatusChange(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none ${
              selectedStatus === st
                ? 'bg-primary text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {st === 'ALL' && 'Tất cả'}
            {st === 'PENDING' && 'Chờ duyệt'}
            {st === 'APPROVED' && 'Đã duyệt'}
            {st === 'REJECTED' && 'Đã từ chối'}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-border text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-5">Người yêu cầu</th>
                <th className="py-3.5 px-4">Thông tin liên hệ</th>
                <th className="py-3.5 px-4">Trường học</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span>Đang tải danh sách yêu cầu...</span>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    Không có yêu cầu duyệt giáo viên nào trong danh mục này.
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const badge = statusBadges[req.status];
                  const StatusIcon = badge.icon;
                  const isProcessing = processingId === req.id;

                  return (
                    <tr key={req.id} className="hover:bg-neutral-50/70 transition">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary-border/20">
                            {req.fullName?.charAt(0) || <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900">{req.fullName || 'Chưa đặt tên'}</p>
                            <p className="text-[11px] text-neutral-400">@{req.username || `user_${req.userId}`}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          {req.googleEmail && (
                            <p className="flex items-center gap-1.5 text-neutral-700">
                              <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                              <span className="truncate max-w-45">{req.googleEmail}</span>
                            </p>
                          )}
                          {req.phoneNumber && (
                            <p className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                              <span>{req.phoneNumber}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-neutral-700">
                          <School className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate max-w-40 font-medium">{req.schoolName || 'Chưa liên kết'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-neutral-500 text-[11px]">
                        <div className="font-medium text-neutral-700">{new Date(req.requestedAt).toLocaleDateString('vi-VN')}</div>
                        <div className="text-[10px] text-neutral-400">
                          {new Date(req.requestedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${badge.bg} ${badge.text}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                        {req.status === 'REJECTED' && req.rejectReason && (
                          <p className="text-[11px] text-danger mt-1 max-w-45 truncate" title={req.rejectReason}>
                            Lý do: {req.rejectReason}
                          </p>
                        )}
                        {req.status === 'APPROVED' && req.reviewedByName && (
                          <p className="text-[10px] text-neutral-400 mt-0.5">Duyệt bởi: {req.reviewedByName}</p>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        {req.status === 'PENDING' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-success-light hover:bg-emerald-100 text-success-text border border-emerald-200 rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Duyệt
                            </button>
                            <button
                              onClick={() => setRejectingTarget(req)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-danger-light hover:bg-red-100 text-danger-text border border-red-200 rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-neutral-400 italic">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingTarget && (
        <RejectReasonModal
          isOpen={Boolean(rejectingTarget)}
          onClose={() => setRejectingTarget(null)}
          onSubmit={async (reason) => {
            if (rejectingTarget) {
              await onReject(rejectingTarget.id, reason);
            }
          }}
          targetName={rejectingTarget.fullName || rejectingTarget.username || 'Người dùng'}
        />
      )}
    </div>
  );
};
