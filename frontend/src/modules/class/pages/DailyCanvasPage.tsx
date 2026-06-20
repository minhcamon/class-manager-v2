/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { 
  Award, 
  ChevronLeft, 
  AlertCircle,
  Loader2,
  Search,
  ClipboardList,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import classService from "@/services/classService";
import groupService from "@/services/groupService";
import studentProfileService from "@/services/studentProfileService";
import pointService from "@/services/pointService";
import type { Class } from "@/types/class";
import type { Group } from "@/types/group";
import type { ClassStudentResponse } from "@/types/studentProfile";
import type { PointLog } from "@/types/pointLog";
import Button from "@/components/ui/Button";

// Sub-components
import DailyStudentCard from "../components/DailyStudentCard";
import GroupFilterTabs from "../components/GroupFilterTabs";
import DailyScoringForm from "../components/DailyScoringForm";

type PageTab = "scoring" | "logs";

// ─── Point Log Row (editable) ─────────────────────────────────────────────────
function PointLogRow({
  log,
  canEdit,
  onDelete,
  onUpdate,
}: {
  log: PointLog;
  canEdit: boolean;
  onDelete: (id: number) => void;
  onUpdate: (id: number, pointValue: number, reason: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editPoint, setEditPoint] = useState(log.pointValue);
  const [editReason, setEditReason] = useState(log.reason);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editReason.trim() || editReason.trim().length < 5) {
      toast.error("Lý do phải từ 5 ký tự trở lên.");
      return;
    }
    setSaving(true);
    try {
      await onUpdate(log.id, editPoint, editReason.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-b border-border/50 hover:bg-neutral-50/40 transition-colors group">
      {/* Student */}
      <td className="px-4 py-3">
        <span className="text-sm font-semibold text-neutral-800">
          {log.studentName || `#${log.studentId}`}
        </span>
      </td>
      {/* Point */}
      <td className="px-3 py-3 text-center">
        {editing ? (
          <input
            type="number"
            value={editPoint}
            onChange={(e) => setEditPoint(Number(e.target.value))}
            className="w-20 text-center border border-border rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary"
            min={-100}
            max={100}
          />
        ) : (
          <span className={`text-sm font-bold ${log.pointValue >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {log.pointValue >= 0 ? `+${log.pointValue}` : log.pointValue}
          </span>
        )}
      </td>
      {/* Reason */}
      <td className="px-3 py-3">
        {editing ? (
          <input
            type="text"
            value={editReason}
            onChange={(e) => setEditReason(e.target.value)}
            className="w-full border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        ) : (
          <span className="text-sm text-neutral-700">{log.reason}</span>
        )}
      </td>
      {/* Created By */}
      <td className="px-3 py-3">
        <span className="text-xs text-neutral-500">{log.createdByName}</span>
      </td>
      {/* Date */}
      <td className="px-3 py-3">
        <span className="text-xs text-neutral-400">{log.weekStartDate}</span>
      </td>
      {/* Actions */}
      {canEdit && (
        <td className="px-3 py-3">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  title="Lưu"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setEditing(false); setEditPoint(log.pointValue); setEditReason(log.reason); }}
                  className="p-1.5 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                  title="Hủy"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 text-neutral-400 hover:text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer"
                  title="Chỉnh sửa"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(log.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Xóa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

// ─── Log Tab ──────────────────────────────────────────────────────────────────
function LogTab({
  classId,
  currentUserId,
  isTeacher,
}: {
  classId: number;
  currentUserId?: number;
  isTeacher: boolean;
}) {
  const [logs, setLogs] = useState<PointLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await pointService.getClassPointLogs(classId);
      setLogs(data);
    } catch {
      toast.error("Không thể tải nhật ký điểm.");
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleDelete = async (logId: number) => {
    if (!confirm("Bạn có chắc muốn xóa log điểm này không?")) return;
    try {
      await pointService.deletePointLog(logId);
      toast.success("Đã xóa log điểm.");
      setLogs((prev) => prev.filter((l) => l.id !== logId));
    } catch {
      toast.error("Không thể xóa log điểm.");
    }
  };

  const handleUpdate = async (logId: number, pointValue: number, reason: string) => {
    try {
      const updated = await pointService.updatePointLog(logId, { pointValue, reason });
      toast.success("Đã cập nhật log điểm.");
      setLogs((prev) => prev.map((l) => (l.id === logId ? updated : l)));
    } catch {
      toast.error("Không thể cập nhật log điểm.");
      throw new Error("update failed");
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.studentName ?? "").toLowerCase().includes(q) ||
      log.reason.toLowerCase().includes(q) ||
      log.createdByName.toLowerCase().includes(q)
    );
  });

  // A log can be edited/deleted by its creator or the teacher
  const canEditLog = (log: PointLog) =>
    isTeacher || log.createdByUserId === currentUserId;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-neutral-400" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo tên học sinh, lý do, hoặc người ghi..."
          className="block w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary w-7 h-7" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center mb-4 border border-border">
              <ClipboardList className="w-7 h-7 text-neutral-300" />
            </div>
            <p className="text-sm font-semibold text-neutral-600">Chưa có nhật ký điểm</p>
            <p className="text-xs text-neutral-400 mt-1">
              {searchQuery ? "Không tìm thấy kết quả phù hợp." : "Bắt đầu chấm điểm để xem nhật ký tại đây."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-border">
                  <th className="text-left px-4 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Học sinh</th>
                  <th className="text-center px-3 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest w-24">Điểm</th>
                  <th className="text-left px-3 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Lý do</th>
                  <th className="text-left px-3 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Ghi bởi</th>
                  <th className="text-left px-3 py-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Tuần bắt đầu</th>
                  <th className="w-20 px-3 py-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <PointLogRow
                    key={log.id}
                    log={log}
                    canEdit={canEditLog(log)}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-400 text-right">
        Hiển thị {filteredLogs.length} / {logs.length} bản ghi
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DailyCanvasPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [classData, setClassData] = useState<Class | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<ClassStudentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic StudentProfileId to solve JWT staleness for student leader
  const [currentUserProfileId, setCurrentUserProfileId] = useState<number | undefined>(undefined);

  // Page tab
  const [pageTab, setPageTab] = useState<PageTab>("scoring");

  // Filter and Selection states
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("all"); // "all", "unassigned", or group.id string
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Form states
  const [pointValue, setPointValue] = useState<number>(5);
  const [reason, setReason] = useState<string>("");
  const [weekStartDate, setWeekStartDate] = useState<string>(() => {
    // Default to current week's Monday
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split("T")[0];
  });
  const isDateValid = !weekStartDate ? false : new Date(weekStartDate).getDay() === 1;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student details derived from user context
  const isTeacher = user?.role === "TEACHER";

  // Find the group led by current student (if any)
  const ledGroup = groups.find(g => g.leaderStudentId === currentUserProfileId);
  const isGroupLeader = !isTeacher && !!ledGroup;

  const loadData = useCallback(async () => {
    if (!classId) return;
    try {
      const [classDetails, groupsList, studentsList] = await Promise.all([
        classService.getClassById(parseInt(classId)),
        groupService.getClassGroups(parseInt(classId)),
        studentProfileService.getClassStudents(parseInt(classId))
      ]);
      setClassData(classDetails);
      setGroups(groupsList);
      setStudents(studentsList);

      // Dynamically find current student profile id by matching user.id
      if (user?.id) {
        const myStudent = studentsList.find(s => s.userId === user.id);
        if (myStudent) {
          setCurrentUserProfileId(myStudent.studentProfileId);
        }
      }
    } catch (error) {
      console.error("Failed to load daily canvas data:", error);
      toast.error("Không thể tải thông tin lớp học.");
    } finally {
      setIsLoading(false);
    }
  }, [classId, user]);

  useEffect(() => {
    loadData();
  }, [classId, loadData]);

  // Fallback to "all" filter if "unassigned" becomes empty
  useEffect(() => {
    if (selectedGroupFilter === "unassigned") {
      const unassignedCount = students.filter(s => s.groupId === null).length;
      if (unassignedCount === 0) {
        setSelectedGroupFilter("all");
      }
    }
  }, [students, selectedGroupFilter]);

  // Determine students list visible to the user
  const visibleStudents = students.filter(student => {
    let matchRole = false;
    if (isTeacher) {
      if (selectedGroupFilter === "all") matchRole = true;
      else if (selectedGroupFilter === "unassigned") matchRole = student.groupId === null;
      else matchRole = student.groupId === parseInt(selectedGroupFilter);
    } else if (isGroupLeader) {
      // Group leader can only see students in their group
      matchRole = student.groupId === ledGroup?.id;
    }

    if (!matchRole) return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return student.fullName.toLowerCase().includes(q) || student.username.toLowerCase().includes(q);
    }

    return true;
  });

  const toggleSelectStudent = (studentId: number) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const allVisibleIds = visibleStudents.map(s => s.studentProfileId);
    const areAllSelected = allVisibleIds.every(id => selectedStudentIds.includes(id));
    if (areAllSelected) {
      // Deselect all visible
      setSelectedStudentIds(prev => prev.filter(id => !allVisibleIds.includes(id)));
    } else {
      // Select all visible
      setSelectedStudentIds(prev => [...new Set([...prev, ...allVisibleIds])]);
    }
  };

  const handleSubmitPoints = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStudentIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một học sinh.");
      return;
    }
    if (pointValue === 0) {
      toast.error("Điểm thi đua phải khác 0.");
      return;
    }
    if (pointValue < -100 || pointValue > 100) {
      toast.error("Điểm thi đua nằm trong khoảng [-100, 100].");
      return;
    }
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error("Lý do chấm điểm phải từ 5 kí tự trở lên.");
      return;
    }
    if (!isDateValid) {
      toast.error("Ngày áp dụng điểm thi đua phải là ngày Thứ Hai.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Perform batch point creation request in a single HTTP request
      await pointService.createPointLogsBatch({
        studentIds: selectedStudentIds,
        pointValue,
        reason: reason.trim(),
        weekStartDate
      });
      
      toast.success(`Đã cập nhật điểm thi đua cho ${selectedStudentIds.length} học sinh thành công!`);
      setSelectedStudentIds([]);
      setReason("");
      // Reload points
      await loadData();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "Lỗi khi chấm điểm thi đua.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-background min-h-[500px]">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-neutral-500 font-medium">Đang tải Daily Canvas...</p>
      </div>
    );
  }

  // Authorization Shield
  if (!isTeacher && !isGroupLeader) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="w-16 h-16 bg-danger-light text-danger-text rounded-full flex items-center justify-center mx-auto border border-danger/10">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-neutral-900">Quyền truy cập bị từ chối</h2>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Chức năng chấm điểm nhanh (Daily Canvas) chỉ dành cho Giáo viên chủ nhiệm hoặc Tổ trưởng được bổ nhiệm.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)} className="mx-auto cursor-pointer">
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-10">
      
      {/* Top Navigation Row */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white hover:bg-neutral-50 active:scale-95 border border-border rounded-xl transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <Award className="text-primary w-6 h-6" />
            Daily Canvas — Lớp {classData?.className}
          </h1>
          <p className="text-xs text-neutral-400 font-medium mt-0.5">
            {isTeacher 
              ? "Giáo viên chủ nhiệm thực hiện chấm điểm thi đua nhanh" 
              : `Tổ trưởng ${ledGroup?.groupName} thực hiện chấm điểm tổ viên`}
          </p>
        </div>
      </div>

      {/* Page Tab Bar */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex border-b border-border">
          {[
            { key: "scoring" as PageTab, label: "Chấm điểm", icon: Award },
            { key: "logs" as PageTab, label: "Nhật ký điểm", icon: ClipboardList },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPageTab(key)}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                pageTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {pageTab === "scoring" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Column Left: Student Selector (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Filter Row (only for Teacher) */}
                {isTeacher && (
                  <GroupFilterTabs
                    selectedGroupFilter={selectedGroupFilter}
                    onSelectFilter={setSelectedGroupFilter}
                    groups={groups}
                    students={students}
                  />
                )}

                {/* Search Input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm học sinh theo tên hoặc username..."
                    className="block w-full pl-10 pr-4 py-2 border border-border rounded-xl text-sm placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-neutral-50/50"
                  />
                </div>

                {/* Selection actions bar */}
                <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                  <span className="text-sm font-bold text-neutral-700">
                    Danh sách học sinh ({visibleStudents.length})
                  </span>
                  <button
                    onClick={handleSelectAll}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    {visibleStudents.every(s => selectedStudentIds.includes(s.studentProfileId))
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả hiển thị"}
                  </button>
                </div>

                {/* Students Selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {visibleStudents.length === 0 ? (
                    <div className="col-span-2 text-center py-20 text-neutral-400 text-sm italic">
                      Không tìm thấy học sinh nào phù hợp bộ lọc.
                    </div>
                  ) : (
                    visibleStudents.map(student => (
                      <DailyStudentCard
                        key={student.studentProfileId}
                        student={student}
                        isSelected={selectedStudentIds.includes(student.studentProfileId)}
                        onToggle={() => toggleSelectStudent(student.studentProfileId)}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Column Right: Scoring Form (5 cols) */}
              <div className="lg:col-span-5">
                <DailyScoringForm
                  selectedStudentCount={selectedStudentIds.length}
                  weekStartDate={weekStartDate}
                  setWeekStartDate={setWeekStartDate}
                  isDateValid={isDateValid}
                  pointValue={pointValue}
                  setPointValue={setPointValue}
                  reason={reason}
                  setReason={setReason}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmitPoints}
                />
              </div>
            </div>
          ) : (
            <LogTab
              classId={parseInt(classId!)}
              currentUserId={user?.id}
              isTeacher={isTeacher}
            />
          )}
        </div>
      </div>

    </div>
  );
}
