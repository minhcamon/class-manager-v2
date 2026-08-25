/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { 
  X, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Pencil, 
  Check, 
  Loader2, 
  Clock, 
  Calendar,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import behaviorService from "@/services/behaviorService";
import type { StudentWeeklyDetail, BehaviorLogItem, BehaviorType } from "@/types/behavior";
import Button from "@/components/ui/Button";

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

const PRESET_RULES = [
  { name: "Hăng hái phát biểu bài", type: "BONUS" as BehaviorType, point: 5 },
  { name: "Đóng góp ý kiến xây dựng bài", type: "BONUS" as BehaviorType, point: 2 },
  { name: "Đạt điểm 9, 10 bài kiểm tra", type: "BONUS" as BehaviorType, point: 10 },
  { name: "Làm bài tập đầy đủ, sạch đẹp", type: "BONUS" as BehaviorType, point: 5 },
  { name: "Giúp đỡ bạn tiến bộ", type: "BONUS" as BehaviorType, point: 5 },
  { name: "Đi học muộn không lý do", type: "PENALTY" as BehaviorType, point: -5 },
  { name: "Nói chuyện riêng trong lớp", type: "PENALTY" as BehaviorType, point: -2 },
  { name: "Không làm bài tập về nhà", type: "PENALTY" as BehaviorType, point: -5 },
  { name: "Làm việc riêng, dùng điện thoại", type: "PENALTY" as BehaviorType, point: -5 },
];

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

  // Form states for new behavior
  const [ruleName, setRuleName] = useState("");
  const [behaviorType, setBehaviorType] = useState<BehaviorType>("BONUS");
  const [unitPoint, setUnitPoint] = useState(5);
  const [quantity, setQuantity] = useState(1);
  const [dayOfWeek, setDayOfWeek] = useState("Thứ 2");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editing state for existing log
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [editRuleName, setEditRuleName] = useState("");
  const [editUnitPoint, setEditUnitPoint] = useState(0);
  const [editQuantity, setEditQuantity] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);

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
      setEditingLogId(null);
    }
  }, [isOpen, fetchDetail]);

  const handleApplyPreset = (preset: typeof PRESET_RULES[0]) => {
    setRuleName(preset.name);
    setBehaviorType(preset.type);
    setUnitPoint(preset.point);
  };

  const handleCreateBehavior = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    if (!ruleName.trim() || ruleName.trim().length < 3) {
      toast.error("Vui lòng nhập tên tiêu chí (tối thiểu 3 ký tự).");
      return;
    }

    setIsSubmitting(true);
    try {
      await behaviorService.createBehavior({
        studentId,
        classId,
        academicYear,
        semester: weekNumber <= 18 ? 1 : 2,
        weekNumber,
        ruleName: ruleName.trim(),
        type: behaviorType,
        unitPoint,
        quantity,
        dayOfWeek,
        note: note.trim() || undefined,
      });
      toast.success("Ghi nhận hành vi thi đua thành công!");
      setRuleName("");
      setNote("");
      setShowAddForm(false);
      fetchDetail();
      onRefreshRequired();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Lỗi khi ghi nhận điểm.");
      } else {
        toast.error("Lỗi khi ghi nhận điểm.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (log: BehaviorLogItem) => {
    setEditingLogId(log.id);
    setEditRuleName(log.ruleName);
    setEditUnitPoint(log.unitPoint);
    setEditQuantity(log.quantity);
  };

  const handleSaveEdit = async (logId: number) => {
    if (!editRuleName.trim()) {
      toast.error("Tên tiêu chí không được để trống.");
      return;
    }

    setIsUpdating(true);
    try {
      await behaviorService.updateBehavior(logId, {
        ruleName: editRuleName.trim(),
        unitPoint: editUnitPoint,
        quantity: editQuantity,
      });
      toast.success("Cập nhật bản ghi thành công!");
      setEditingLogId(null);
      fetchDetail();
      onRefreshRequired();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Không thể cập nhật bản ghi.");
      } else {
        toast.error("Không thể cập nhật bản ghi.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (logId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi điểm này?")) return;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-border animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-border bg-neutral-50/70 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-900">
                  {detail?.studentName || "Chi tiết học sinh"}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                  {detail?.groupName || "Chưa phân tổ"}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Tuần {weekNumber} • Năm học {academicYear}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-neutral-50 border border-border rounded-xl p-3.5 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Điểm tuần
                    </span>
                    <span className={`text-xl font-extrabold ${detail.netScore >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {detail.netScore >= 0 ? `+${detail.netScore}` : detail.netScore}
                    </span>
                  </div>
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3" /> Điểm cộng
                    </span>
                    <span className="text-xl font-extrabold text-emerald-700">
                      +{detail.totalBonus}
                    </span>
                  </div>
                  <div className="bg-red-50/60 border border-red-100 rounded-xl p-3.5 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 flex items-center justify-center gap-1 mb-1">
                      <TrendingDown className="w-3 h-3" /> Điểm trừ
                    </span>
                    <span className="text-xl font-extrabold text-red-700">
                      {detail.totalPenalty}
                    </span>
                  </div>
                </div>

                {/* Total Academic Points Note */}
                <div className="bg-primary-light/40 border border-primary/20 rounded-xl p-3 flex items-center justify-between text-xs text-primary-dark">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-primary" />
                    Tổng điểm tích lũy năm học:
                  </span>
                  <span className="font-extrabold text-sm">{detail.totalAcademicPoints}đ</span>
                </div>

                {/* Add Behavior Action */}
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
                      <form onSubmit={handleCreateBehavior} className="bg-neutral-50 rounded-2xl border border-border p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            Nhập điểm thi đua mới
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="text-xs text-neutral-400 hover:text-neutral-600 cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>

                        {/* Presets */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase text-neutral-400 block">Chọn nhanh tiêu chí:</span>
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                            {PRESET_RULES.map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleApplyPreset(preset)}
                                className="text-[11px] px-2.5 py-1 rounded-lg border border-border bg-white hover:border-primary/50 text-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <span>{preset.name}</span>
                                <span className={`font-bold text-[10px] ${preset.type === "BONUS" ? "text-emerald-600" : "text-red-500"}`}>
                                  {preset.point > 0 ? `+${preset.point}` : preset.point}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Type & Point Inputs */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold uppercase text-neutral-500 block mb-1">Loại</label>
                            <select
                              value={behaviorType}
                              onChange={(e) => {
                                const newType = e.target.value as BehaviorType;
                                setBehaviorType(newType);
                                if (newType === "BONUS" && unitPoint < 0) setUnitPoint(Math.abs(unitPoint));
                                if (newType === "PENALTY" && unitPoint > 0) setUnitPoint(-Math.abs(unitPoint));
                              }}
                              className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="BONUS">Điểm cộng (+)</option>
                              <option value="PENALTY">Điểm trừ (-)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] font-bold uppercase text-neutral-500 block mb-1">Điểm đơn vị</label>
                            <input
                              type="number"
                              value={unitPoint}
                              onChange={(e) => setUnitPoint(Number(e.target.value))}
                              className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary"
                              required
                            />
                          </div>
                        </div>

                        {/* Rule Name */}
                        <div>
                          <label className="text-[11px] font-bold uppercase text-neutral-500 block mb-1">Nội dung / Tiêu chí</label>
                          <input
                            type="text"
                            value={ruleName}
                            onChange={(e) => setRuleName(e.target.value)}
                            placeholder="VD: Phát biểu bài học, đi học muộn..."
                            className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            required
                          />
                        </div>

                        {/* Quantity & Day of week */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold uppercase text-neutral-500 block mb-1">Số lần</label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={quantity}
                              onChange={(e) => setQuantity(Number(e.target.value))}
                              className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold uppercase text-neutral-500 block mb-1">Ngày trong tuần</label>
                            <select
                              value={dayOfWeek}
                              onChange={(e) => setDayOfWeek(e.target.value)}
                              className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="Thứ 2">Thứ 2</option>
                              <option value="Thứ 3">Thứ 3</option>
                              <option value="Thứ 4">Thứ 4</option>
                              <option value="Thứ 5">Thứ 5</option>
                              <option value="Thứ 6">Thứ 6</option>
                              <option value="Thứ 7">Thứ 7</option>
                            </select>
                          </div>
                        </div>

                        {/* Note */}
                        <div>
                          <label className="text-[11px] font-bold uppercase text-neutral-500 block mb-1">Ghi chú (tùy chọn)</label>
                          <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Ghi chú chi tiết..."
                            className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        <Button
                          type="submit"
                          isLoading={isSubmitting}
                          className="w-full py-2 text-xs font-bold cursor-pointer"
                        >
                          Lưu điểm thi đua
                        </Button>
                      </form>
                    )}
                  </div>
                )}

                {/* Daily Behavior Logs List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center justify-between">
                    <span>Nhật ký hành vi trong tuần ({detail.logs.length})</span>
                  </h3>

                  {detail.logs.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-border rounded-2xl p-6 text-neutral-400">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs">Chưa có sự kiện thi đua nào được ghi nhận trong tuần {weekNumber}.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {detail.logs.map((log) => (
                        <div
                          key={log.id}
                          className="bg-white border border-border rounded-xl p-3.5 shadow-2xs hover:border-neutral-300 transition-all space-y-2"
                        >
                          {editingLogId === log.id ? (
                            /* Inline Edit Mode */
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editRuleName}
                                onChange={(e) => setEditRuleName(e.target.value)}
                                className="w-full text-xs font-bold border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <div className="flex gap-2 items-center">
                                <div className="flex-1">
                                  <label className="text-[10px] text-neutral-400 block">Điểm đơn vị</label>
                                  <input
                                    type="number"
                                    value={editUnitPoint}
                                    onChange={(e) => setEditUnitPoint(Number(e.target.value))}
                                    className="w-full text-xs font-bold text-center border border-border rounded-lg px-2 py-1"
                                  />
                                </div>
                                <div className="w-20">
                                  <label className="text-[10px] text-neutral-400 block">Số lần</label>
                                  <input
                                    type="number"
                                    min={1}
                                    value={editQuantity}
                                    onChange={(e) => setEditQuantity(Number(e.target.value))}
                                    className="w-full text-xs font-bold text-center border border-border rounded-lg px-2 py-1"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-1.5 pt-1">
                                <button
                                  onClick={() => handleSaveEdit(log.id)}
                                  disabled={isUpdating}
                                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer flex items-center gap-1"
                                >
                                  {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Lưu
                                </button>
                                <button
                                  onClick={() => setEditingLogId(null)}
                                  className="px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-bold hover:bg-neutral-200 cursor-pointer"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Normal Display Mode */
                            <>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-xs font-bold text-neutral-900">{log.ruleName}</h4>
                                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                                    {log.dayOfWeek && <span>{log.dayOfWeek}</span>}
                                    {log.quantity > 1 && <span>(x{log.quantity} lần)</span>}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className={`text-sm font-extrabold ${log.totalPoints >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                    {log.totalPoints >= 0 ? `+${log.totalPoints}` : log.totalPoints}đ
                                  </span>
                                </div>
                              </div>

                              {log.note && (
                                <p className="text-[11px] text-neutral-600 bg-neutral-50 p-2 rounded-lg border border-neutral-100 italic">
                                  "{log.note}"
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[10px] text-neutral-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {log.createdByName}
                                </span>
                                {canEdit && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleStartEdit(log)}
                                      className="p-1 hover:text-primary hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                                      title="Chỉnh sửa"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(log.id)}
                                      className="p-1 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                      title="Xóa"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
