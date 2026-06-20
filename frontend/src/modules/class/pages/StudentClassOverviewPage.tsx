import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  User,
  Building,
  Trophy,
  TableProperties,
  Medal,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import classService from "@/services/classService";
import groupService from "@/services/groupService";
import studentProfileService from "@/services/studentProfileService";
import pointService from "@/services/pointService";
import { useAuth } from "@/contexts/AuthContext";
import type { Class } from "@/types/class";
import type { PointLog } from "@/types/pointLog";
import Button from "@/components/ui/Button";

// ─── Types ───────────────────────────────────────────────────────────────────
type ScorePeriod = "week" | "month" | "semester" | "year";
type Tab = "scores" | "leaderboard";

interface LeaderboardEntry {
  rank: number;
  studentId: number;
  name: string;
  score: number;
  trend: "up" | "down" | "same";
  isCurrentUser?: boolean;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [];

// ─── Sub-components ───────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center mb-4 border border-border">
        <Icon className="w-7 h-7 text-neutral-300" />
      </div>
      <p className="text-sm font-semibold text-neutral-600">{title}</p>
      <p className="text-xs text-neutral-400 mt-1 max-w-xs">{subtitle}</p>
    </div>
  );
}

const PERIOD_LABELS: Record<ScorePeriod, string> = {
  week: "Tuần này",
  month: "Tháng này",
  semester: "Học kì",
  year: "Năm học",
};

function ScoreTab({ classData, studentProfileId }: { classData: Class; studentProfileId?: number }) {
  const [period, setPeriod] = useState<ScorePeriod>("week");
  const [allLogs, setAllLogs] = useState<PointLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentProfileId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    pointService.getPointLogs(studentProfileId)
      .then((logs) => setAllLogs(logs))
      .catch(() => setAllLogs([]))
      .finally(() => setIsLoading(false));
  }, [studentProfileId]);

  // Filter logs based on selected period
  const now = new Date();
  const filteredLogs = allLogs.filter((log) => {
    const logDate = new Date(log.weekStartDate);
    if (period === "week") {
      // Same week as now (Monday-based)
      const startOfWeek = new Date(now);
      const day = now.getDay();
      startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return logDate >= startOfWeek && logDate <= endOfWeek;
    } else if (period === "month") {
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    } else if (period === "semester") {
      const currentMonth = now.getMonth();
      const semesterStart = currentMonth < 6 ? 0 : 6; // Jan-Jun or Jul-Dec
      return logDate.getFullYear() === now.getFullYear() && logDate.getMonth() >= semesterStart && logDate.getMonth() < semesterStart + 6;
    } else {
      return logDate.getFullYear() === now.getFullYear();
    }
  });

  const totalDelta = filteredLogs.reduce((acc, log) => acc + log.pointValue, 0);

  return (
    <div className="space-y-5">
      {/* Period filter */}
      <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl w-fit">
        {(Object.keys(PERIOD_LABELS) as ScorePeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              period === p
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5 text-center">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Điểm cơ sở
          </p>
          <p className="text-3xl font-black text-neutral-900">{classData.basePoint}</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5 text-center">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Điều chỉnh
          </p>
          <p className={`text-3xl font-black ${totalDelta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {totalDelta >= 0 ? `+${totalDelta}` : totalDelta}
          </p>
        </div>
        <div className="bg-primary rounded-2xl p-5 text-center">
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">
            Tổng điểm
          </p>
          <p className="text-3xl font-black text-white">{classData.basePoint + totalDelta}</p>
        </div>
      </div>

      {/* Score table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary w-6 h-6" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Chưa có dữ liệu điểm"
            subtitle={`Chưa có điểm thi đua nào được ghi nhận cho ${PERIOD_LABELS[period].toLowerCase()}.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-border">
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest w-8">STT</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Lý do</th>
                  <th className="text-center px-4 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Điểm</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Ghi bởi</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-neutral-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-neutral-400 font-medium">{i + 1}</td>
                    <td className="px-5 py-3.5 font-semibold text-neutral-800">{log.reason}</td>
                    <td className={`px-4 py-3.5 text-center font-bold ${log.pointValue >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {log.pointValue >= 0 ? `+${log.pointValue}` : log.pointValue}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500 text-xs">{log.createdByName}</td>
                    <td className="px-5 py-3.5 text-neutral-400 text-xs">{log.weekStartDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardTab({ currentStudentId }: { currentStudentId?: number }) {
  void currentStudentId;
  const entries = MOCK_LEADERBOARD;
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = ["h-20", "h-28", "h-14"];
  const podiumColors = ["bg-neutral-200 text-neutral-600", "bg-amber-400 text-amber-900", "bg-orange-300 text-orange-800"];
  const medalColors = ["text-neutral-500", "text-amber-500", "text-orange-400"];

  const trendIcon = (trend: LeaderboardEntry["trend"]) => {
    if (trend === "up") return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
    if (trend === "down") return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
    return <Minus className="w-3.5 h-3.5 text-neutral-400" />;
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm">
        <EmptyState
          icon={Trophy}
          title="Bảng xếp hạng chưa có dữ liệu"
          subtitle="Xếp hạng của lớp sẽ được cập nhật sau khi có điểm thi đua."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Podium */}
      {top3.length >= 2 && (
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6 text-center">
            Top 3 xuất sắc nhất
          </p>
          <div className="flex items-end justify-center gap-4">
            {podiumOrder.map((entry, i) =>
              entry ? (
                <div key={entry.studentId} className="flex flex-col items-center gap-2">
                  <Medal className={`w-5 h-5 ${medalColors[i]}`} />
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                      entry.isCurrentUser
                        ? "bg-primary text-white border-primary"
                        : "bg-neutral-100 text-neutral-600 border-neutral-200"
                    }`}
                  >
                    {entry.name.split(" ").pop()?.substring(0, 2).toUpperCase()}
                  </div>
                  <p className={`text-xs font-bold max-w-[70px] text-center truncate ${entry.isCurrentUser ? "text-primary" : "text-neutral-700"}`}>
                    {entry.name.split(" ").pop()}
                  </p>
                  <div className={`${podiumHeights[i]} ${podiumColors[i]} w-20 rounded-t-xl flex flex-col items-center justify-center gap-1`}>
                    <span className="text-lg font-black">#{entry.rank}</span>
                    <span className="text-xs font-bold opacity-80">{entry.score}đ</span>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Rest of leaderboard */}
      {rest.length > 0 && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-border">
                <th className="text-center px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest w-16">Hạng</th>
                <th className="text-left px-4 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Học sinh</th>
                <th className="text-center px-5 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Điểm</th>
                <th className="text-center px-4 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest w-16">Xu hướng</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((entry) => (
                <tr
                  key={entry.studentId}
                  className={`border-b border-border/50 transition-colors ${
                    entry.isCurrentUser
                      ? "bg-primary-light/60 hover:bg-primary-light"
                      : "hover:bg-neutral-50/60"
                  }`}
                >
                  <td className="px-5 py-3.5 text-center font-black text-neutral-500">#{entry.rank}</td>
                  <td className="px-4 py-3.5">
                    <span className={`font-semibold ${entry.isCurrentUser ? "text-primary" : "text-neutral-800"}`}>
                      {entry.name}
                      {entry.isCurrentUser && (
                        <span className="ml-2 text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">Bạn</span>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center font-black text-neutral-900">{entry.score}</td>
                  <td className="px-4 py-3.5 flex justify-center">{trendIcon(entry.trend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
        const [data, groupsList, studentsList] = await Promise.all([
          classService.getClassById(parseInt(classId)),
          groupService.getClassGroups(parseInt(classId)),
          studentProfileService.getClassStudents(parseInt(classId))
        ]);
        setClassData(data);

        // Check if student is a group leader
        if (user?.id) {
          const myStudent = studentsList.find(s => s.userId === user.id);
          if (myStudent) {
            setMyStudentProfileId(myStudent.studentProfileId);
            const myLedGroup = groupsList.find(g => g.leaderStudentId === myStudent.studentProfileId);
            if (myLedGroup) {
              setIsGroupLeader(true);
              setLedGroupName(myLedGroup.groupName);
            }
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

  // Mock rank — will be replaced when backend API is available
  const myRank: number | null = null;

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
          <ScoreTab classData={classData} studentProfileId={myStudentProfileId} />
        ) : (
          <LeaderboardTab currentStudentId={user?.id} />
        )}
      </div>
    </div>
  );
}
