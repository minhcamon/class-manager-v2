import { useState, useRef, useEffect } from "react";
import { X, Check, Loader2, ListTodo } from "lucide-react";
import { toast } from "sonner";
import pointService from "@/services/pointService";

const QUICK_TEMPLATES = [
  { text: "Phát biểu xây dựng bài", value: 5 },
  { text: "Làm bài tập đầy đủ", value: 5 },
  { text: "Điểm tốt kiểm tra 15p", value: 10 },
  { text: "Nói chuyện riêng", value: -2 },
  { text: "Đi học muộn", value: -5 },
  { text: "Không làm bài tập", value: -5 },
  { text: "Ngủ trong giờ", value: -2 },
  { text: "Dùng điện thoại", value: -5 },
];

const DAYS_OF_WEEK = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

interface InlineQuickScoringPopoverProps {
  studentId: number;
  studentName: string;
  weekStartDate: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InlineQuickScoringPopover({
  studentId,
  studentName,
  weekStartDate,
  onClose,
  onSuccess,
}: InlineQuickScoringPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [selectedDay, setSelectedDay] = useState("T2");
  const [pointValue, setPointValue] = useState(5);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Click Outside or Escape Key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const applyTemplate = (tmpl: typeof QUICK_TEMPLATES[0]) => {
    setReason(tmpl.text);
    setPointValue(tmpl.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 3) {
      toast.error("Lý do phải từ 3 ký tự trở lên.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullReason = `[${selectedDay}] ${reason.trim()}`;
      await pointService.createPointLog({
        studentId,
        pointValue,
        reason: fullReason,
        weekStartDate,
      });

      toast.success(`Đã ghi nhận điểm cho ${studentName}`);
      onSuccess();
      onClose();
    } catch {
      toast.error("Không thể ghi nhận điểm. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute top-full left-0 mt-1 z-50 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150 text-left select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <span className="text-xs font-extrabold text-slate-800 block">Thêm điểm nhanh</span>
          <span className="text-[10px] text-slate-500 truncate max-w-50 block font-medium">
            {studentName}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Day Selector */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {DAYS_OF_WEEK.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={`px-1.5 py-0.5 text-[10px] font-bold rounded border transition-colors cursor-pointer shrink-0 ${
              selectedDay === day
                ? "bg-primary text-white border-primary"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Quick Templates */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <ListTodo className="w-2.5 h-2.5" />
          Mẫu nhanh
        </span>
        <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto pr-0.5">
          {QUICK_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyTemplate(tmpl)}
              className="p-1 text-left text-[10px] bg-slate-50 hover:bg-slate-100 rounded border border-slate-200/60 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span className="truncate max-w-22.5 font-medium text-slate-700">{tmpl.text}</span>
              <span className={`font-extrabold text-[9px] shrink-0 ${
                tmpl.value > 0 ? "text-emerald-600" : "text-rose-600"
              }`}>
                {tmpl.value > 0 ? `+${tmpl.value}` : tmpl.value}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="space-y-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={pointValue}
            onChange={(e) => setPointValue(Number(e.target.value))}
            min={-100}
            max={100}
            className={`w-16 px-1.5 py-1 text-center text-xs font-black rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary ${
              pointValue >= 0 ? "text-emerald-700 bg-emerald-50/40 border-emerald-300" : "text-rose-700 bg-rose-50/40 border-rose-300"
            }`}
          />
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do..."
            className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-slate-800"
            autoFocus
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-1.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !reason.trim()}
            className="px-3 py-1 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-2xs disabled:opacity-50 transition-all flex items-center gap-1 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
}
