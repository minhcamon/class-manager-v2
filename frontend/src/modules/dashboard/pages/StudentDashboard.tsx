import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap } from "lucide-react";
import { useNavigate } from "react-router";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
          Chào {user?.fullName?.split(" ").pop()}!
        </h1>
        <p className="text-neutral-500 text-base mt-2">
          Hôm nay là một ngày tuyệt vời để học tập. Hãy kiểm tra các hoạt động mới nhất của lớp bạn.
        </p>
      </div>

      {/* Class Overview Card */}
      <div className="max-w-md">
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900">Lớp 10A1</h3>
              <p className="text-sm text-neutral-500">GVCN: Thầy Nguyễn Thành Nhân</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400 font-medium">Trường học:</span>
              <span className="text-neutral-900 font-bold">THPT Lê Hồng Phong</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400 font-medium">Trạng thái:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">Đã tham gia</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/student/class/1")} // Mock ID
            className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            Vào lớp học
          </button>
        </div>
      </div>
    </div>
  );
}
