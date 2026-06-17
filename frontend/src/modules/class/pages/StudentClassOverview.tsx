import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  User, 
  Bell, 
  Clock, 
  ArrowRight,
  Building,
  Info
} from "lucide-react";
import { toast } from "sonner";
import classService from "@/services/classService";
import type { Class } from "@/types/class";
import Button from "@/components/ui/Button";

export default function StudentClassOverview() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!classId) return;
      setIsLoading(true);
      try {
        const data = await classService.getClassById(parseInt(classId));
        setClassData(data);
      } catch (error) {
        console.error("Failed to fetch class details:", error);
        toast.error("Không thể tải thông tin lớp học.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-neutral-200 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-neutral-100 rounded-2xl"></div>
            <div className="h-64 bg-neutral-100 rounded-2xl"></div>
          </div>
          <div className="h-96 bg-neutral-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Không tìm thấy thông tin lớp học.</p>
        <Button variant="outline" onClick={() => navigate("/student/dashboard")} className="mt-4">
          Quay lại bảng điều khiển
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-border p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest w-fit mb-3 border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Đang hoạt động
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Chào mừng bạn đến với Lớp {classData.className}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Nơi theo dõi hành trình học tập và rèn luyện của bạn.
          </p>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Khối lớp</p>
          <div className="text-2xl font-black text-primary">Khối {classData.grade}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Class Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-primary-light text-primary rounded-xl shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Giáo viên chủ nhiệm</p>
                <p className="text-base font-bold text-neutral-900 mt-0.5 truncate">{classData.teacherName}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-success-light text-success-text rounded-xl shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Trường học</p>
                <p className="text-base font-bold text-neutral-900 mt-0.5 truncate">{classData.schoolName}</p>
              </div>
            </div>
          </div>

          {/* Announcements Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Thông báo mới
              </h2>
            </div>
            <div className="bg-white rounded-2xl border border-border p-8 shadow-sm text-center">
              <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-6 h-6 text-neutral-300" />
              </div>
              <p className="text-neutral-500 font-medium text-sm">Hiện tại chưa có thông báo nào mới.</p>
              <p className="text-xs text-neutral-400 mt-1">Các thông báo từ giáo viên sẽ xuất hiện tại đây.</p>
            </div>
          </div>

          {/* Recent Activities Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Hoạt động gần đây
              </h2>
              <button className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-border p-1 shadow-sm">
              <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                <div className="w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-neutral-300" />
                </div>
                <p className="text-neutral-500 text-sm font-medium">Chưa có hoạt động nào được ghi nhận.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="bg-primary text-white rounded-2xl p-6 shadow-lg shadow-primary/20 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Điểm thi đua hiện tại</p>
              <h3 className="text-4xl font-black tracking-tighter italic">---</h3>
            </div>
            
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Hạng trong lớp</span>
                <span className="font-bold">--</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Hạng trong tổ</span>
                <span className="font-bold">--</span>
              </div>
            </div>

            <Button 
              className="w-full bg-white text-primary hover:bg-white/90 font-bold py-3 rounded-xl border-none"
              onClick={() => navigate(`/student/class/${classId}/profile`)}
            >
              Xem hồ sơ cá nhân
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
            <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Lưu ý
            </h4>
            <ul className="space-y-3 text-xs text-neutral-500 list-disc list-inside leading-relaxed">
              <li>Điểm thi đua được cập nhật hàng tuần.</li>
              <li>Bạn có thể cập nhật thông tin cá nhân tại phần <strong>Hồ sơ của tôi</strong>.</li>
              <li>Mọi thắc mắc vui lòng liên hệ trực tiếp với giáo viên chủ nhiệm.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
