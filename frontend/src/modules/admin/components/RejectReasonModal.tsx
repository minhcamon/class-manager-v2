import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6 text-left">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-danger-text text-base font-bold">
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            <span>Từ chối Yêu cầu Giáo viên</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-600 leading-relaxed pt-1">
            Bạn đang từ chối yêu cầu cấp vai trò Giáo viên của người dùng{' '}
            <strong className="text-neutral-900">{targetName}</strong>. Vui lòng nêu rõ lý do để lưu vết vào hồ sơ.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
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
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-light transition resize-none"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
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
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-danger hover:bg-red-700 text-white shadow-xs transition disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận Từ chối'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RejectReasonModal;
