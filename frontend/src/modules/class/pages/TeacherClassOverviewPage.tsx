import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  BookOpen, 
  Users, 
  Copy, 
  Check, 
  GraduationCap, 
  Building, 
  Calendar,
  Settings,
  FileText,
  LayoutDashboard,
  Clock,
  Eye,
  EyeOff,
  Trophy, 
  CalendarDays
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import classService from "@/services/classService";
import type { Class } from "@/types/class";
import Button from "@/components/ui/Button";

// Subcomponents
import TeacherLeaderboardTab from "../components/TeacherLeaderboardTab";
import TeacherReportsTab from "../components/TeacherReportsTab";
import TeacherActivitiesTab from "../components/TeacherActivitiesTab";

export default function TeacherClassOverviewPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Tab & refresh trigger state
  const [activeTab, setActiveTab] = useState<"leaderboard" | "reports" | "activities">("leaderboard");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerLeaderboardRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!classId) return;
      setIsLoading(true);
      try {
        const data = await classService.getClassById(parseInt(classId));
        setClassData(data);
      } catch (error) {
        console.error("Failed to fetch class details:", error);
        if (isAxiosError(error) && error.response?.status === 404) {
          sessionStorage.removeItem("active_class");
          toast.error("Lớp học không tồn tại hoặc đã bị xóa.");
          navigate("/teacher/dashboard");
        } else {
          toast.error("Không thể tải thông tin lớp học.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId, navigate]);

  const copyToClipboard = (text: string, type: "code" | "password") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      toast.success("Đã sao chép mã lớp!");
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedPassword(true);
      toast.success("Đã sao chép mật khẩu lớp!");
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-neutral-200 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-neutral-100 rounded-2xl md:col-span-2"></div>
          <div className="h-40 bg-neutral-100 rounded-2xl"></div>
        </div>
        <div className="h-64 bg-neutral-100 rounded-2xl"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Không tìm thấy thông tin lớp học.</p>
        <Button variant="outline" onClick={() => navigate("/teacher/dashboard")} className="mt-4">
          Quay lại bảng điều khiển
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Tổng quan Lớp {classData.className}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Xem tóm tắt hoạt động và thông tin quản lý lớp học.
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/teacher/classes/${classId}/profile-template`)}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Mẫu sơ yếu
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/teacher/classes/${classId}/configuration`)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Cấu hình
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-light text-primary rounded-xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Thông tin cơ bản</h3>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Niên khóa đang hoạt động</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-success-light text-success-text border border-success/15 uppercase">
              {classData.status === "ACTIVE" ? "Đang hoạt động" : "Đã kết thúc"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-50 rounded-lg text-neutral-400">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Trường học</p>
                <p className="text-sm font-bold text-neutral-700 truncate max-w-[150px]">{classData.schoolName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-50 rounded-lg text-neutral-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Học sinh</p>
                <p className="text-sm font-bold text-neutral-700">{classData.studentCount} thành viên</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-50 rounded-lg text-neutral-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Giáo viên</p>
                <p className="text-sm font-bold text-neutral-700 truncate max-w-[150px]">{classData.teacherName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-50 rounded-lg text-neutral-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Ngày tạo</p>
                <p className="text-sm font-bold text-neutral-700">{new Date(classData.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Class Access Card */}
        <div className="bg-primary text-white rounded-2xl p-6 shadow-lg shadow-primary/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-white/10">
            <LayoutDashboard className="w-32 h-32" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Mã tham gia lớp học</p>
              <div className="flex items-center justify-between bg-white/10 rounded-xl p-3 border border-white/10">
                <code className="text-xl font-black tracking-wider font-mono">{classData.classCode}</code>
                <button 
                  onClick={() => copyToClipboard(classData.classCode || "", "code")}
                  className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-lg cursor-pointer border border-transparent"
                  title="Sao chép mã lớp"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white/80" />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Mật khẩu lớp học</p>
              <div className="flex items-center justify-between bg-white/10 rounded-xl p-3 border border-white/10">
                <code className="text-lg font-bold tracking-wider font-mono">
                  {showPassword ? (classData.classPassword || "CM-123456") : "••••••••"}
                </code>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-lg cursor-pointer border border-transparent"
                    title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white/80" />}
                  </button>
                  <button 
                    onClick={() => copyToClipboard(classData.classPassword || "CM-123456", "password")}
                    className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-lg cursor-pointer border border-transparent"
                    title="Sao chép mật khẩu"
                  >
                    {copiedPassword ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white/80" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-[11px] text-white/60 leading-relaxed mt-4 relative z-10">
            Học sinh cần nhập đúng cả mã lớp và mật khẩu để tham gia lớp học của bạn.
          </p>
        </div>
      </div>

      {/* Main Tabs and Content Area */}
      <div className="space-y-6">
        {/* Tab navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`py-3 px-6 font-bold text-sm flex items-center gap-2 cursor-pointer border-b-2 -mb-px transition-all ${
              activeTab === "leaderboard"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Bảng xếp hạng thi đua
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`py-3 px-6 font-bold text-sm flex items-center gap-2 cursor-pointer border-b-2 -mb-px transition-all ${
              activeTab === "reports"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Chốt tuần & Báo cáo
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`py-3 px-6 font-bold text-sm flex items-center gap-2 cursor-pointer border-b-2 -mb-px transition-all ${
              activeTab === "activities"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Clock className="w-4 h-4" />
            Hoạt động gần đây
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "leaderboard" && classId && (
          <TeacherLeaderboardTab classId={classId} refreshTrigger={refreshTrigger} />
        )}

        {activeTab === "reports" && classId && (
          <TeacherReportsTab classId={classId} onWeekClosed={triggerLeaderboardRefresh} />
        )}

        {activeTab === "activities" && classId && (
          <TeacherActivitiesTab classId={classId} />
        )}
      </div>
    </div>
  );
}
