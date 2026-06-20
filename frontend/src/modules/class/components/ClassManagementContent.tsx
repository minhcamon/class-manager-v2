/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { 
  BookOpen, 
  Plus, 
  Loader2, 
  Info,
  Check,
  Cloud
} from "lucide-react";
import type { Class } from "@/types/class";
import type { Group } from "@/types/group";
import type { ClassStudentResponse } from "@/types/studentProfile";
import groupService from "@/services/groupService";
import studentProfileService from "@/services/studentProfileService";
import Button from "@/components/ui/Button";

// Sub-components
import GroupColumn from "./GroupColumn";
import CreateGroupDialog from "./CreateGroupDialog";
import StudentActionDialog from "./StudentActionDialog";
import ClassDetailsCard from "./ClassDetailsCard";
import DangerZoneCard from "./DangerZoneCard";

interface ClassManagementContentProps {
  classData: Class;
  onClassEnded: () => void;
}

export default function ClassManagementContent({ classData, onClassEnded }: ClassManagementContentProps) {
  const [activeTab, setActiveTab] = useState<"roster" | "settings">("roster");
  const [students, setStudents] = useState<ClassStudentResponse[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Local state for in-memory UX responsiveness and Autosave status
  const [localStudents, setLocalStudents] = useState<ClassStudentResponse[]>([]);
  const [localGroups, setLocalGroups] = useState<Group[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "unsaved" | "saving" | "saved">("idle");

  const localStudentsRef = useRef<ClassStudentResponse[]>([]);
  const studentsRef = useRef<ClassStudentResponse[]>([]);

  useEffect(() => {
    localStudentsRef.current = localStudents;
  }, [localStudents]);

  useEffect(() => {
    studentsRef.current = students;
  }, [students]);

  // Dialog & Modal states
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ClassStudentResponse | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const [groupsData, studentsData] = await Promise.all([
        groupService.getClassGroups(classData.id),
        studentProfileService.getClassStudents(classData.id)
      ]);
      setStudents(studentsData);
      setLocalStudents(studentsData);
      setLocalGroups(groupsData);
      setSaveStatus("idle");
    } catch (error) {
      console.error("Failed to fetch class roster data:", error);
      toast.error("Không thể tải sơ đồ tổ và học sinh.");
    } finally {
      setIsDataLoading(false);
    }
  }, [classData.id]);

  useEffect(() => {
    fetchData();
  }, [classData.id, fetchData]);

  // Save changes to backend
  const saveChanges = useCallback(async (studentsToSave: ClassStudentResponse[], originalStudents: ClassStudentResponse[]) => {
    const changes: Promise<void>[] = [];

    studentsToSave.forEach(localStudent => {
      const original = originalStudents.find(s => s.studentProfileId === localStudent.studentProfileId);
      if (!original) return;

      const groupChanged = localStudent.groupId !== original.groupId;
      const leaderChanged = localStudent.isLeader !== original.isLeader;

      if (groupChanged) {
        changes.push(groupService.assignStudentGroup(localStudent.studentProfileId, localStudent.groupId));
      }

      if (localStudent.isLeader && leaderChanged) {
        changes.push(groupService.assignLeader(localStudent.groupId!, localStudent.studentProfileId).then(() => {}));
      }
    });

    if (changes.length > 0) {
      setSaveStatus("saving");
      try {
        await Promise.all(changes);
        setSaveStatus("saved");
        setStudents(studentsToSave);
        toast.success("Đã tự động lưu các thay đổi phân Tổ!");
      } catch (error) {
        console.error("Autosave failed:", error);
        setSaveStatus("unsaved");
        toast.error("Không thể tự động lưu thay đổi phân Tổ.");
      }
    } else {
      setSaveStatus("idle");
    }
  }, []);

  // Autosave effect (3s debounce)
  useEffect(() => {
    if (saveStatus !== "unsaved") return;

    const timer = setTimeout(() => {
      saveChanges(localStudents, students);
    }, 3000);

    return () => clearTimeout(timer);
  }, [localStudents, saveStatus, students, saveChanges]);

  // Fallback save on unmount
  useEffect(() => {
    return () => {
      const currentLocals = localStudentsRef.current;
      const currentOriginals = studentsRef.current;

      if (currentLocals.length === 0 || currentOriginals.length === 0) return;

      const changes: Promise<void>[] = [];

      currentLocals.forEach(localStudent => {
        const original = currentOriginals.find(s => s.studentProfileId === localStudent.studentProfileId);
        if (!original) return;

        const groupChanged = localStudent.groupId !== original.groupId;
        const leaderChanged = localStudent.isLeader !== original.isLeader;

        if (groupChanged) {
          changes.push(groupService.assignStudentGroup(localStudent.studentProfileId, localStudent.groupId));
        }

        if (localStudent.isLeader && leaderChanged) {
          changes.push(groupService.assignLeader(localStudent.groupId!, localStudent.studentProfileId).then(() => {}));
        }
      });

      if (changes.length > 0) {
        Promise.all(changes).catch(err => {
          console.error("Fallback unmount save failed:", err);
        });
      }
    };
  }, []);

  const handleCreateGroup = async (name: string) => {
    try {
      await groupService.createGroup({
        classId: classData.id,
        groupName: name
      });
      toast.success(`Đã tạo ${name} thành công!`);
      await fetchData();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      const errMsg = err.response?.data?.message || "Không thể tạo tổ mới.";
      toast.error(errMsg);
      throw error;
    }
  };

  const handleAssignLeader = async (groupId: number, studentProfileId: number) => {
    // In-memory update
    setLocalStudents(prev => prev.map(s => {
      if (s.studentProfileId === studentProfileId) {
        return { ...s, isLeader: true, groupId };
      }
      if (s.groupId === groupId && s.isLeader) {
        return { ...s, isLeader: false };
      }
      return s;
    }));
    setSaveStatus("unsaved");
    setIsActionModalOpen(false);
    setSelectedStudent(null);
  };

  const handleMoveStudentGroup = async (studentProfileId: number, groupId: number | null) => {
    // In-memory update
    setLocalStudents(prev => prev.map(s => {
      if (s.studentProfileId === studentProfileId) {
        const groupName = groupId ? localGroups.find(g => g.id === groupId)?.groupName || null : null;
        return {
          ...s,
          groupId,
          groupName,
          isLeader: groupId === null ? false : s.isLeader
        };
      }
      return s;
    }));
    setSaveStatus("unsaved");
    setIsActionModalOpen(false);
    setSelectedStudent(null);
  };

  const handleConfigureStudent = (student: ClassStudentResponse) => {
    setSelectedStudent(student);
    setIsActionModalOpen(true);
  };

  const unassignedStudents = localStudents.filter(s => s.groupId === null);
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-primary w-8 h-8" />
            Lớp {classData.className} — Quản lý
          </h1>
          <p className="text-neutral-500 text-sm">
            Quản lý sơ đồ Tổ học sinh, gán Tổ trưởng và cấu hình lớp học.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-neutral-100 p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("roster")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "roster"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Sơ đồ Tổ & Học sinh
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Thiết lập chung
          </button>
        </div>
      </div>

      {activeTab === "roster" && (
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
            <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-neutral-500 items-center">
              <div>
                Tổng học sinh: <span className="font-bold text-neutral-800">{localStudents.length}</span>
              </div>
              <div>
                Số Tổ học tập: <span className="font-bold text-neutral-800">{localGroups.length}</span>
              </div>
              {unassignedStudents.length > 0 && (
                <div>
                  Chưa chia tổ: <span className="font-bold text-neutral-800">{unassignedStudents.length}</span>
                </div>
              )}
              {/* Save Status Indicator */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-200">
                {saveStatus === "idle" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400">
                    <Cloud className="w-3.5 h-3.5" />
                    Đã đồng bộ
                  </span>
                )}
                {saveStatus === "unsaved" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Có thay đổi chưa lưu (Lưu tự động...)
                  </span>
                )}
                {saveStatus === "saving" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang tự động lưu...
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success-text">
                    <Check className="w-3.5 h-3.5 text-success-text" />
                    Đã lưu mọi thay đổi
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {saveStatus === "unsaved" && (
                <Button
                  onClick={() => saveChanges(localStudents, students)}
                  className="font-semibold text-xs py-2 shadow-sm cursor-pointer border-neutral-300"
                  variant="outline"
                  size="sm"
                >
                  Lưu ngay
                </Button>
              )}
              <Button
                onClick={() => setIsCreateGroupOpen(true)}
                className="flex items-center gap-1.5 font-semibold text-xs py-2 shadow-sm cursor-pointer"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Tạo Tổ Mới
              </Button>
            </div>
          </div>

          {isDataLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-border shadow-sm">
              <Loader2 className="animate-spin text-primary w-8 h-8 mb-3" />
              <p className="text-neutral-500 text-sm font-medium">Đang tải danh sách tổ và học sinh...</p>
            </div>
          ) : (
            <div className="flex flex-row gap-6 items-start overflow-x-auto pb-4 min-h-[500px]">
              
              {/* Kanban Column: Unassigned */}
              {unassignedStudents.length > 0 && (
                <GroupColumn
                  title="Chưa phân tổ"
                  students={unassignedStudents}
                  onConfigureStudent={handleConfigureStudent}
                />
              )}

              {/* Kanban Columns: Groups */}
              {localGroups.map(group => {
                const groupStudents = localStudents.filter(s => s.groupId === group.id);
                return (
                  <GroupColumn
                    key={group.id}
                    title={group.groupName}
                    students={groupStudents}
                    group={group}
                    onConfigureStudent={handleConfigureStudent}
                  />
                );
              })}

            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ClassDetailsCard classData={classData} />
          
          {/* Informational Panel */}
          <div className="bg-primary-light/40 border border-primary-border/30 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                <Info className="text-primary w-5 h-5" />
                Lưu ý vận hành
              </h3>
              <ul className="space-y-3 text-sm text-neutral-600 leading-relaxed list-disc list-inside">
                <li>Mỗi giáo viên chỉ được phép có duy nhất <strong>1 lớp học ACTIVE</strong> tại một thời điểm.</li>
                <li>Điểm mặc định tuần được dùng làm điểm khởi đầu cho thi đua học sinh mỗi tuần mới.</li>
                <li>Bạn có thể cấu hình mẫu sơ yếu lý lịch động để thu thập dữ liệu học sinh trong lớp.</li>
              </ul>
            </div>
          </div>

          <DangerZoneCard classData={classData} onClassEnded={onClassEnded} />
        </div>
      )}

      {/* Dialogs */}
      <CreateGroupDialog
        isOpen={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        onCreate={handleCreateGroup}
        className={classData.className}
      />

      <StudentActionDialog
        isOpen={isActionModalOpen}
        onOpenChange={setIsActionModalOpen}
        student={selectedStudent}
        groups={localGroups}
        onAssignLeader={handleAssignLeader}
        onMoveGroup={handleMoveStudentGroup}
        isUpdating={false}
      />
    </div>
  );
}
