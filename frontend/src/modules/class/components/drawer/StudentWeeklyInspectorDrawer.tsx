/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import behaviorService from "@/services/behaviorService";
import type { StudentWeeklyDetail } from "@/types/behavior";
import Button from "@/components/ui/Button";

// Subcomponents
import DrawerHeader from "./DrawerHeader";
import WeekSummaryMetrics from "./WeekSummaryMetrics";
import DailyBehaviorLogList from "./DailyBehaviorLogList";
import QuickAddBehaviorForm from "./QuickAddBehaviorForm";

interface StudentWeeklyInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number | null;
  classId: number;
  academicYear: number;
  weekNumber: number;
  canEdit: boolean;
  onRefreshRequired: () => void;
}

export default function StudentWeeklyInspectorDrawer({
  isOpen,
  onClose,
  studentId,
  classId,
  academicYear,
  weekNumber,
  canEdit,
  onRefreshRequired,
}: StudentWeeklyInspectorDrawerProps) {
  const [detail, setDetail] = useState<StudentWeeklyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!studentId || !isOpen) return;
    setLoading(true);
    try {
      const data = await behaviorService.getStudentWeeklyDetail(studentId, {
        classId,
        academicYear,
        weekNumber,
      });
      setDetail(data);
    } catch (e) {
      console.error("Failed to fetch student weekly detail", e);
      toast.error("Không thể tải chi tiết điểm thi đua tuần này.");
    } finally {
      setLoading(false);
    }
  }, [studentId, isOpen, classId, academicYear, weekNumber]);

  useEffect(() => {
    if (isOpen) {
      fetchDetail();
      setShowAddForm(false);
    }
  }, [isOpen, fetchDetail]);

  const handleUpdateLog = async (
    logId: number,
    ruleName: string,
    unitPoint: number,
    quantity: number
  ) => {
    try {
      await behaviorService.updateBehavior(logId, {
        ruleName,
        unitPoint,
        quantity,
      });
      toast.success("Cập nhật bản ghi thành công!");
      fetchDetail();
      onRefreshRequired();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Không thể cập nhật bản ghi.");
      } else {
        toast.error("Không thể cập nhật bản ghi.");
      }
    }
  };

  const handleDeleteLog = async (logId: number) => {
    try {
      await behaviorService.deleteBehavior(logId);
      toast.success("Đã xóa bản ghi thành công.");
      fetchDetail();
      onRefreshRequired();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Không thể xóa bản ghi.");
      } else {
        toast.error("Không thể xóa bản ghi.");
      }
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchDetail();
    onRefreshRequired();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Backdrop: Ultra subtle, no blur, crystal clear table visibility */}
      <div 
        className="absolute inset-0 bg-neutral-950/10 pointer-events-auto transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-auto">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-border animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <DrawerHeader
            studentName={detail?.studentName}
            groupName={detail?.groupName}
            academicYear={academicYear}
            weekNumber={weekNumber}
            onClose={onClose}
          />

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <span className="text-sm font-medium">Đang tải dữ liệu tuần {weekNumber}...</span>
              </div>
            ) : detail ? (
              <>
                {/* Score Summary Metrics */}
                <WeekSummaryMetrics
                  netScore={detail.netScore}
                  totalBonus={detail.totalBonus}
                  totalPenalty={detail.totalPenalty}
                  totalAcademicPoints={detail.totalAcademicPoints}
                />

                {/* Add Behavior Action / Form */}
                {canEdit && (
                  <div>
                    {!showAddForm ? (
                      <Button
                        onClick={() => setShowAddForm(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Ghi nhận điểm thi đua tuần này
                      </Button>
                    ) : (
                      <QuickAddBehaviorForm
                        studentId={studentId!}
                        classId={classId}
                        academicYear={academicYear}
                        weekNumber={weekNumber}
                        onSuccess={handleAddSuccess}
                        onCancel={() => setShowAddForm(false)}
                      />
                    )}
                  </div>
                )}

                {/* Daily Behavior Logs List */}
                <DailyBehaviorLogList
                  logs={detail.logs}
                  canEdit={canEdit}
                  weekNumber={weekNumber}
                  onUpdate={handleUpdateLog}
                  onDelete={handleDeleteLog}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
