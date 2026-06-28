import { useNavigate } from "react-router";
import { Clock, Users, FileText } from "lucide-react";

interface TeacherActivitiesTabProps {
  classId: string;
}

export default function TeacherActivitiesTab({ classId }: TeacherActivitiesTabProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-2xl border border-border p-1 shadow-sm">
          <div className="py-12 flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-neutral-300" />
            </div>
            <p className="text-neutral-500 font-medium">Chưa có hoạt động nào được ghi nhận.</p>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs">
              Các hành động như chấm điểm, duyệt học sinh, thay đổi cấu hình sẽ xuất hiện tại đây.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">Thao tác nhanh</h2>
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/teacher/classes/${classId}/management`)}
            className="w-full p-4 bg-white border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all flex items-center gap-4 group text-left cursor-pointer"
          >
            <div className="p-2 bg-neutral-50 text-neutral-500 group-hover:bg-primary-light group-hover:text-primary rounded-lg transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-neutral-900 text-sm">Quản lý học sinh</p>
              <p className="text-[10px] text-neutral-400">Xem danh sách và duyệt thành viên</p>
            </div>
          </button>

          <button
            onClick={() => navigate(`/teacher/classes/${classId}/profile-template`)}
            className="w-full p-4 bg-white border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all flex items-center gap-4 group text-left cursor-pointer"
          >
            <div className="p-2 bg-neutral-50 text-neutral-500 group-hover:bg-primary-light group-hover:text-primary rounded-lg transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-neutral-900 text-sm">Thiết lập mẫu hồ sơ</p>
              <p className="text-[10px] text-neutral-400">Tùy chỉnh thông tin cần thu thập</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
