import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  User,
  Building,
  Trophy,
  TableProperties,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import classService from "@/services/classService";
import studentProfileService from "@/services/studentProfileService";
import { useAuth } from "@/contexts/AuthContext";
import type { Class } from "@/types/class";
import Button from "@/components/ui/Button";
import weeklyReportService from "@/services/weeklyReportService";

// Subcomponents
import StudentScoreTab from "../components/StudentScoreTab";
import StudentLeaderboardTab from "../components/StudentLeaderboardTab";

type Tab = "scores" | "leaderboard";

export default function StudentClassOverviewPage() {
  const { classId } = useParams<{ classId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [classData, setClassData] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGroupLeader, setIsGroupLeader] = useState(false);
  const [ledGroupName, setLedGroupName] = useState("");
  const [myStudentProfileId, setMyStudentProfileId] = useState<number | undefined>(undefined);
  const [myRank, setMyRank] = useState<number | null>(null);

  // Derive active tab from URL search param
  const rawTab = searchParams.get("tab");
  const activeTab: Tab = rawTab === "leaderboard" ? "leaderboard" : "scores";

  const setTab = (tab: Tab) => {
    if (tab === "scores") {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab }, { replace: true });
    }
  };

  useEffect(() => {
    const fetchClassAndGroup = async () => {
      if (!classId) return;
      setIsLoading(true);
      try {
        const [data, myProfile] = await Promise.all([
          classService.getClassById(parseInt(classId)),
          studentProfileService.getMyProfile()
        ]);
        setClassData(data);

        // Check if student is a group leader
        if (myProfile) {
          setMyStudentProfileId(myProfile.id);
          if (myProfile.isLeader) {
            setIsGroupLeader(true);
            setLedGroupName(myProfile.groupName || "");
          }
          // Fetch academic leaderboard to resolve current student's rank
          try {
            const leaderboard = await weeklyReportService.getAcademicLeaderboard(parseInt(classId));
            const myEntry = leaderboard.students.find(s => s.studentId === myProfile.id);
            if (myEntry) {
              setMyRank(myEntry.rank);
            }
          } catch (e) {
            console.error("Failed to resolve my rank", e);
          }
        }
      } catch (error) {
        console.error("Failed to fetch class and groups:", error);
        if (isAxiosError(error) && error.response?.status === 404) {
          sessionStorage.removeItem("active_class");
          toast.error("Lớp học không tồn tại.");
          navigate("/student/dashboard");
        } else {
          toast.error("Không thể tải thông tin lớp học.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchClassAndGroup();
  }, [classId, navigate, user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary w-9 h-9" />
          <p className="text-sm text-neutral-400 animate-pulse">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <p className="text-neutral-400 text-sm">Không tìm thấy lớp học.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F8FAFC]">
      {/* ── Compact class info header ─────────────────────────────────────── */}
      <div className="bg-white border-b border-border px-6 lg:px-10 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: class name + status */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-extrabold text-neutral-900 tracking-tight">
                  Lớp {classData.className}
                </h1>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Đang hoạt động
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">Khối {classData.grade}</p>
            </div>
          </div>

          {/* Right: rank + teacher + school */}
          <div className="flex items-center gap-5">
            {/* Rank */}
            <div className="flex items-center gap-2 text-center">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Xếp hạng</p>
                <p className="text-base font-black text-neutral-900">
                  {myRank !== null ? `#${myRank}` : "—"}
                </p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            {/* Teacher */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-neutral-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">GVCN</p>
                <p className="text-sm font-bold text-neutral-700 max-w-[120px] truncate">{classData.teacherName}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            {/* School */}
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-neutral-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Trường</p>
                <p className="text-sm font-bold text-neutral-700 max-w-[140px] truncate">{classData.schoolName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border px-6 lg:px-10">
        <div className="max-w-5xl mx-auto flex gap-1">
          {(
            [
              { key: "scores", label: "Bảng điểm", icon: TableProperties },
              { key: "leaderboard", label: "Xếp hạng", icon: Trophy },
            ] as { key: Tab; label: string; icon: React.ElementType }[]
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
        {isGroupLeader && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <Trophy className="w-5 h-5 text-amber-600 fill-amber-100" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">Quyền hạn Tổ trưởng</p>
                <p className="text-xs text-amber-700">
                  Bạn là Tổ trưởng của <strong>{ledGroupName}</strong>. Bạn có quyền chấm điểm thi đua cho các tổ viên trong tổ.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/student/class/${classId}/daily-canvas`)}
              className="border-amber-300 text-amber-900 hover:bg-amber-100 font-semibold cursor-pointer w-full sm:w-auto text-center shrink-0"
            >
              Chấm điểm thi đua
            </Button>
          </div>
        )}
        {activeTab === "scores" ? (
          <StudentScoreTab classData={classData} studentProfileId={myStudentProfileId} />
        ) : classId ? (
          <StudentLeaderboardTab classId={parseInt(classId)} myStudentProfileId={myStudentProfileId} />
        ) : null}
      </div>
    </div>
  );
}
