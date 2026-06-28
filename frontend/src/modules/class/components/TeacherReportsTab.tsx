/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  CalendarDays 
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import Button from "@/components/ui/Button";
import weeklyReportService from "@/services/weeklyReportService";
import type { WeeklyReportDetail } from "@/services/weeklyReportService";

interface TeacherReportsTabProps {
  classId: string;
  onWeekClosed?: () => void;
}

export default function TeacherReportsTab({ classId, onWeekClosed }: TeacherReportsTabProps) {
  const [lockedWeeks, setLockedWeeks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [weekReportDetail, setWeekReportDetail] = useState<WeeklyReportDetail | null>(null);
  const [isClosingWeek, setIsClosingWeek] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);

  const fetchReports = useCallback(async () => {
    if (!classId) return;
    setIsLoadingList(true);
    try {
      const classIdInt = parseInt(classId);
      const weeks = await weeklyReportService.getLockedWeeks(classIdInt);
      setLockedWeeks(weeks);
    } catch (e) {
      console.error("Failed to fetch reports", e);
    } finally {
      setIsLoadingList(false);
    }
  }, [classId]);

  const fetchReportDetail = useCallback(async (week: string) => {
    if (!classId) return;
    setIsLoadingReport(true);
    try {
      const classIdInt = parseInt(classId);
      const detail = await weeklyReportService.getWeeklyReport(classIdInt, week);
      setWeekReportDetail(detail);
    } catch (e) {
      console.error("Failed to fetch weekly report detail", e);
      toast.error("Không thể tải chi tiết báo cáo tuần.");
    } finally {
      setIsLoadingReport(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getCurrentMonday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split("T")[0];
  };

  const handleCloseWeek = async () => {
    if (!classId) return;
    const mondayStr = getCurrentMonday();
    const confirmClose = window.confirm(`Bạn có chắc chắn muốn chốt điểm thi đua cho tuần học bắt đầu từ ngày ${mondayStr}? Hành động này sẽ khóa toàn bộ điểm số của tuần này và không thể hoàn tác.`);
    if (!confirmClose) return;

    setIsClosingWeek(true);
    try {
      const classIdInt = parseInt(classId);
      await weeklyReportService.closeWeek(classIdInt, mondayStr);
      toast.success("Chốt điểm tuần thành công!");
      fetchReports();
      if (onWeekClosed) {
        onWeekClosed();
      }
    } catch (e) {
      console.error("Failed to close week", e);
      if (isAxiosError(e) && e.response?.data?.message) {
        toast.error(e.response.data.message);
      } else {
        toast.error("Chốt điểm tuần thất bại.");
      }
    } finally {
      setIsClosingWeek(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Close week controls (Span 1) */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-neutral-900 text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Chốt điểm tuần này
            </h3>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Khóa sổ và đóng băng điểm số thi đua của tuần học hiện tại. Hệ thống sẽ tự động xếp hạng học sinh và tổ.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide">⚠️ Lưu ý quan trọng</h4>
            <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
              Sau khi chốt điểm tuần, dữ liệu điểm số của tuần này sẽ trở thành **bất biến**. Bạn sẽ không thể thêm, sửa, hoặc xóa bất kỳ log điểm nào của tuần này nữa.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Thứ hai tuần này:</span>
              <span className="font-bold text-neutral-800">{getCurrentMonday()}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Trạng thái:</span>
              <span className="font-bold text-amber-600">Đang mở sổ điểm</span>
            </div>
          </div>

          <Button
            onClick={handleCloseWeek}
            disabled={isClosingWeek}
            className="w-full flex items-center justify-center gap-2 cursor-pointer font-bold"
          >
            {isClosingWeek ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang xử lý chốt điểm...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Chốt điểm tuần học
              </>
            )}
          </Button>
        </div>

        {/* History list */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-neutral-50/50">
            <h3 className="font-bold text-neutral-900 text-sm">Lịch sử tuần đã chốt</h3>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-border">
            {isLoadingList ? (
              <div className="py-8 text-center text-neutral-400 text-xs">Đang tải danh sách...</div>
            ) : lockedWeeks.length > 0 ? (
              lockedWeeks.map((week) => (
                <button
                  key={week}
                  onClick={() => {
                    setSelectedWeek(week);
                    fetchReportDetail(week);
                  }}
                  className={`w-full text-left py-3.5 px-6 text-sm flex justify-between items-center hover:bg-neutral-50 cursor-pointer transition-colors ${
                    selectedWeek === week ? "bg-primary-light/35 font-bold text-primary border-l-4 border-primary pl-5" : "text-neutral-700"
                  }`}
                >
                  <span className="font-mono">{week}</span>
                  <span className="text-[10px] bg-neutral-100 text-neutral-500 font-bold px-2 py-0.5 rounded">Đã chốt</span>
                </button>
              ))
            ) : (
              <div className="py-8 text-center text-neutral-400 text-xs">Chưa chốt tuần nào.</div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly report details (Span 2) */}
      <div className="lg:col-span-2">
        {selectedWeek ? (
          isLoadingReport ? (
            <div className="bg-white rounded-2xl border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-neutral-500 text-sm">Đang tải dữ liệu báo cáo tuần...</p>
            </div>
          ) : weekReportDetail ? (
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden space-y-6">
              <div className="px-6 py-5 border-b border-border bg-neutral-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-base">Báo cáo tuần {weekReportDetail.weekStartDate}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Thời gian chốt: {new Date(weekReportDetail.lockedAt).toLocaleString("vi-VN")} bởi {weekReportDetail.lockedBy}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-900 text-white uppercase tracking-wider">LOCKED</span>
              </div>

              <div className="overflow-x-auto px-6 pb-6">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5">Xếp hạng</th>
                      <th className="py-2.5">Học sinh</th>
                      <th className="py-2.5">Tổ</th>
                      <th className="py-2.5 text-right">Cộng</th>
                      <th className="py-2.5 text-right">Trừ</th>
                      <th className="py-2.5 text-right">Điểm chốt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekReportDetail.entries.map((entry) => (
                      <tr key={entry.studentId} className="border-b border-border/60 hover:bg-neutral-50/50">
                        <td className="py-3 font-mono font-bold text-neutral-800">
                          {entry.classRank === 1 && <span className="text-amber-500 font-bold">🥇 1</span>}
                          {entry.classRank === 2 && <span className="text-slate-500 font-bold">🥈 2</span>}
                          {entry.classRank === 3 && <span className="text-amber-800 font-bold">🥉 3</span>}
                          {entry.classRank > 3 && `#${entry.classRank}`}
                        </td>
                        <td className="py-3 font-bold text-neutral-800">{entry.name}</td>
                        <td className="py-3 text-neutral-500 font-medium">{entry.groupName}</td>
                        <td className="py-3 text-right text-success font-semibold">+{entry.totalBonus}</td>
                        <td className="py-3 text-right text-error font-semibold">{entry.totalPenalty}</td>
                        <td className="py-3 text-right font-black text-primary">{entry.finalPoint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border p-12 shadow-sm text-center">
              <p className="text-neutral-400">Không thể hiển thị thông tin báo cáo.</p>
            </div>
          )
        ) : (
          <div className="bg-white rounded-2xl border border-border p-16 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-primary-light text-primary rounded-full">
              <CalendarDays className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-800 text-base">Xem chi tiết báo cáo tuần</h4>
              <p className="text-xs text-neutral-400 max-w-sm mt-1">
                Chọn một tuần học đã chốt trong danh sách lịch sử ở bên trái để hiển thị chi tiết điểm số, tổng cộng điểm cộng/trừ và thứ hạng của các học sinh.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
