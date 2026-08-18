import React, { useState } from 'react';
import { KeyRound, UserCog, Unlock, ShieldAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { AdminUser, Role, SupportActionPayload } from '@/types/admin';

interface SupportActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: AdminUser | null;
  onSubmit: (payload: SupportActionPayload) => Promise<void>;
}

export const SupportActionModal: React.FC<SupportActionModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onSubmit,
}) => {
  const [actionType, setActionType] = useState<'RESET_PASSWORD' | 'CHANGE_ROLE' | 'UNLOCK_USER'>('RESET_PASSWORD');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<Role>('STUDENT');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;

    if (!reason.trim()) {
      setError('Lý do thực hiện là bắt buộc (theo quy tắc BR-ADMIN-02).');
      return;
    }
    if (actionType === 'RESET_PASSWORD' && newPassword.trim().length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onSubmit({
        targetUserId: targetUser.id,
        actionType,
        newPassword: actionType === 'RESET_PASSWORD' ? newPassword.trim() : undefined,
        newRole: actionType === 'CHANGE_ROLE' ? newRole : undefined,
        reason: reason.trim(),
      });
      setNewPassword('');
      setReason('');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thao tác hỗ trợ thất bại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen && Boolean(targetUser)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-6 text-left">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary font-bold text-base">
            <ShieldAlert className="w-5 h-5" />
            <span>Thao tác Hỗ trợ Kỹ thuật</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Thực hiện can thiệp tài khoản hỗ trợ theo thẩm quyền Quản trị viên
          </DialogDescription>
        </DialogHeader>

        {targetUser && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-light text-primary font-bold flex items-center justify-center text-sm shrink-0 border border-primary-border/20">
                {targetUser.fullName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-900 truncate">{targetUser.fullName}</p>
                <p className="text-[11px] text-neutral-500 truncate">
                  @{targetUser.username || `user_${targetUser.id}`} • Vai trò:{' '}
                  <span className="font-bold text-primary">{targetUser.role || 'Chưa chọn role'}</span>
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-danger-light border border-danger-light/80 rounded-xl text-xs text-danger-text">
                {error}
              </div>
            )}

            {/* Action Tabs */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Loại hành động hỗ trợ</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('RESET_PASSWORD')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    actionType === 'RESET_PASSWORD'
                      ? 'bg-primary-light border-primary text-primary shadow-xs'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Đặt lại MK</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('CHANGE_ROLE')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    actionType === 'CHANGE_ROLE'
                      ? 'bg-primary-light border-primary text-primary shadow-xs'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <UserCog className="w-4 h-4" />
                  <span>Đổi Vai trò</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('UNLOCK_USER')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    actionType === 'UNLOCK_USER'
                      ? 'bg-primary-light border-primary text-primary shadow-xs'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <Unlock className="w-4 h-4" />
                  <span>Mở khóa TK</span>
                </button>
              </div>
            </div>

            {/* Conditional Field: Password */}
            {actionType === 'RESET_PASSWORD' && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Mật khẩu mới <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-light transition"
                  disabled={loading}
                />
              </div>
            )}

            {/* Conditional Field: Role */}
            {actionType === 'CHANGE_ROLE' && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Vai trò mới <span className="text-danger">*</span>
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-hidden focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-light transition cursor-pointer"
                  disabled={loading}
                >
                  <option value="TEACHER">TEACHER (Giáo viên chủ nhiệm)</option>
                  <option value="STUDENT">STUDENT (Học sinh)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
                </select>
              </div>
            )}

            {/* Mandatory Reason */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                Lý do thực hiện hỗ trợ <span className="text-danger">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="VD: Người dùng gửi yêu cầu qua email hỗ trợ do quên mật khẩu..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary-light transition resize-none"
                disabled={loading}
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
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs transition disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {loading ? 'Đang thực thi...' : 'Thực thi Hành động'}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SupportActionModal;
