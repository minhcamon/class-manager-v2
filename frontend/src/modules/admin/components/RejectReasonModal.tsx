import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  targetName: string;
}

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  targetName,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do từ chối (bắt buộc theo BR-ADMIN-08).');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(reason.trim());
      setReason('');
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-border rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-danger-text font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-danger" />
            <span>Từ chối Yêu cầu Giáo viên</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-neutral-600 leading-relaxed">
            Bạn đang từ chối yêu cầu cấp vai trò Giáo viên của người dùng{' '}
            <strong className="text-neutral-900">{targetName}</strong>. Vui lòng nêu rõ lý do để lưu vết vào hồ sơ.
          </p>

          {error && (
            <div className="p-3 bg-danger-light border border-danger-light/80 rounded-xl text-xs text-danger-text">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Lý do từ chối <span className="text-danger">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="VD: Không thuộc danh sách biên chế giáo viên của trường năm học này..."
              className="w-full bg-neutral-50 border border-border rounded-xl px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-light transition resize-none"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-danger hover:bg-red-700 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận Từ chối'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
