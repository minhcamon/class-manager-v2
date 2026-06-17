import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // This is a simplified version of the logic from the old Dashboard.tsx
  // In a real scenario, we'd check if they have an active class.
  // For now, let's just show a welcome message or redirect to class creation if none.

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-border p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Xin chào, Thầy/Cô {user?.fullName?.split(" ").pop()}!
          </h1>
          <p className="text-neutral-500 text-base mt-2">
            Chào mừng bạn quay trở lại. Hãy chọn một lớp học để bắt đầu làm việc.
          </p>
        </div>

        <button
          onClick={() => navigate("/teacher/classes/create")}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-md shadow-primary/20"
        >
          <PlusCircle className="w-5 h-5" />
          Tạo lớp mới
        </button>
      </div>

      {/* Stats or Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mock Class Card */}
        <div 
          onClick={() => navigate("/teacher/classes/1")} // Mock ID
          className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary-light text-primary rounded-xl group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-success-text bg-success-light px-2 py-1 rounded-full uppercase">
              Đang hoạt động
            </span>
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-1">Lớp 10A1</h3>
          <p className="text-sm text-neutral-500 mb-4">Trường THPT Lê Hồng Phong</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-border/50 text-sm">
            <div className="flex flex-col">
              <span className="text-neutral-400 text-[10px] uppercase font-bold">Học sinh</span>
              <span className="font-bold text-neutral-700">42</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-neutral-400 text-[10px] uppercase font-bold">Ngày tạo</span>
              <span className="font-bold text-neutral-700">18/06/2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
