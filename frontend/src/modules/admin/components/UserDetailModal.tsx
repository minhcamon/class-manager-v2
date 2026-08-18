import React from 'react';
import {
  User,
  Mail,
  Phone,
  School,
  Calendar,
  KeyRound,
  Eye,
  BookOpen,
  GraduationCap,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { AdminUserDetail } from '@/types/admin';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userDetail: AdminUserDetail | null;
  loading: boolean;
  onOpenSupport: () => void;
  onViewAs: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  userDetail,
  loading,
  onOpenSupport,
  onViewAs,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden text-left gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-neutral-900 font-bold text-base">
            <User className="w-5 h-5 text-primary" />
            <span>Hồ sơ Chi tiết Người dùng</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Thông tin định danh tài khoản, trường lớp và lịch sử yêu cầu
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {loading || !userDetail ? (
            <div className="py-12 text-center text-neutral-400">
              <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-2" />
              <span>Đang tải thông tin hồ sơ...</span>
            </div>
          ) : (
            <>
              {/* Profile Card */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-lg border border-primary-border/20 shrink-0">
                    {userDetail.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">{userDetail.fullName}</h3>
                    <p className="text-neutral-500">@{userDetail.username || `id_${userDetail.id}`}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-primary-light text-primary border border-primary-border font-bold text-[10px]">
                        {userDetail.role || 'CHƯA CÓ VAI TRÒ'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={onOpenSupport}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-primary" />
                    Hỗ trợ
                  </button>
                  <button
                    onClick={onViewAs}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    Quan sát (View-As)
                  </button>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-white border border-neutral-200 rounded-xl flex items-center gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="truncate min-w-0">
                    <p className="text-[10px] text-neutral-400 uppercase font-bold">Email Google</p>
                    <p className="text-neutral-900 font-medium truncate">{userDetail.googleEmail || 'Chưa liên kết'}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-neutral-200 rounded-xl flex items-center gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="truncate min-w-0">
                    <p className="text-[10px] text-neutral-400 uppercase font-bold">Số điện thoại</p>
                    <p className="text-neutral-900 font-medium">{userDetail.phoneNumber || 'Chưa có'}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-neutral-200 rounded-xl flex items-center gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                    <School className="w-4 h-4" />
                  </div>
                  <div className="truncate min-w-0">
                    <p className="text-[10px] text-neutral-400 uppercase font-bold">Trường học</p>
                    <p className="text-neutral-900 font-medium truncate">
                      {userDetail.role === 'ADMIN'
                        ? 'Toàn hệ thống (Admin)'
                        : userDetail.schoolName || 'Chưa có trường'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-neutral-200 rounded-xl flex items-center gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase font-bold">Ngày tham gia</p>
                    <p className="text-neutral-900 font-medium">
                      {new Date(userDetail.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Managed Classes (if Teacher) */}
              {userDetail.role === 'TEACHER' && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>Lớp học Quản lý ({userDetail.managedClasses.length})</span>
                  </div>
                  {userDetail.managedClasses.length === 0 ? (
                    <p className="text-neutral-400 italic p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                      Chưa khởi tạo lớp học nào.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userDetail.managedClasses.map((cls) => (
                        <div key={cls.id} className="p-3.5 bg-white border border-neutral-200 rounded-xl flex items-center justify-between shadow-2xs">
                          <div>
                            <p className="font-bold text-neutral-900">Lớp {cls.className} (Khối {cls.grade})</p>
                            <p className="text-[10px] text-neutral-500">Mã lớp: {cls.classCode}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-success-light border border-emerald-200 text-success-text font-bold text-[10px]">
                            {cls.studentCount} HS
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Enrolled Classes (if Student) */}
              {userDetail.role === 'STUDENT' && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span>Lớp học Đang tham gia</span>
                  </div>
                  {userDetail.enrolledClasses.length === 0 ? (
                    <p className="text-neutral-400 italic p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                      Chưa ghi danh vào lớp học nào.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {userDetail.enrolledClasses.map((enc) => (
                        <div key={enc.classId} className="p-3.5 bg-white border border-neutral-200 rounded-xl flex items-center justify-between shadow-2xs">
                          <div>
                            <p className="font-bold text-neutral-900">Lớp {enc.className} • {enc.groupName}</p>
                            <p className="text-[10px] text-neutral-500">GVCN: {enc.teacherName}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-primary-light border border-primary-border text-primary font-bold text-[10px]">
                            {enc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Teacher Requests History */}
              {userDetail.teacherRequests.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Lịch sử Yêu cầu Cấp quyền Giáo viên</span>
                  </div>
                  <div className="space-y-2">
                    {userDetail.teacherRequests.map((req) => (
                      <div key={req.id} className="p-3.5 bg-white border border-neutral-200 rounded-xl space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900">
                            Yêu cầu #{req.id} • {new Date(req.requestedAt).toLocaleString('vi-VN')}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-neutral-100 border-neutral-200 text-neutral-700">
                            {req.status}
                          </span>
                        </div>
                        {req.rejectReason && (
                          <p className="text-danger text-[11px]">Lý do từ chối: {req.rejectReason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
