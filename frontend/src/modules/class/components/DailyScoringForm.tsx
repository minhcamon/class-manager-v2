import React from "react";
import { Calendar, AlertCircle, Minus, Plus, ListTodo } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const QUICK_TEMPLATES = [
  { text: "Hăng hái phát biểu bài", value: 5, type: "positive" },
  { text: "Đóng góp ý kiến xây dựng bài", value: 2, type: "positive" },
  { text: "Đạt điểm 9, 10 trong bài kiểm tra", value: 10, type: "positive" },
  { text: "Làm bài tập đầy đủ, sạch đẹp", value: 5, type: "positive" },
  { text: "Giúp đỡ bạn tiến bộ học tập", value: 5, type: "positive" },
  { text: "Đi học muộn không lý do", value: -5, type: "negative" },
  { text: "Nói chuyện riêng trong lớp", value: -2, type: "negative" },
  { text: "Không làm bài tập về nhà", value: -5, type: "negative" },
  { text: "Không học bài cũ trước khi đến lớp", value: -5, type: "negative" },
  { text: "Làm việc riêng, dùng điện thoại", value: -5, type: "negative" },
];

interface DailyScoringFormProps {
  selectedStudentCount: number;
  weekStartDate: string;
  setWeekStartDate: (date: string) => void;
  isDateValid: boolean;
  pointValue: number;
  setPointValue: (val: number | ((prev: number) => number)) => void;
  reason: string;
  setReason: (val: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function DailyScoringForm({
  selectedStudentCount,
  weekStartDate,
  setWeekStartDate,
  isDateValid,
  pointValue,
  setPointValue,
  reason,
  setReason,
  isSubmitting,
  onSubmit
}: DailyScoringFormProps) {
  
  const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    setReason(template.text);
    setPointValue(template.value);
  };

  const isFormDisabled =
    selectedStudentCount === 0 ||
    !reason.trim() ||
    reason.trim().length < 5 ||
    pointValue === 0 ||
    !isDateValid;

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-5">
      {/* Header info */}
      <div>
        <h3 className="font-bold text-neutral-900 text-base">Ghi điểm thi đua</h3>
        <p className="text-xs text-neutral-400 mt-0.5">
          Điền thông tin điểm thi đua cho những học sinh được chọn.
        </p>
      </div>

      {/* Selection summary */}
      <div className="bg-neutral-50 rounded-xl p-3 border border-border flex justify-between items-center">
        <span className="text-xs text-neutral-500 font-semibold">Đã chọn:</span>
        <span className="text-sm font-bold text-neutral-900 bg-neutral-200/60 px-2 py-0.5 rounded-md">
          {selectedStudentCount} học sinh
        </span>
      </div>

      {/* Week Date Picker */}
      <div className="space-y-1.5">
        <label htmlFor="weekStartDate" className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          Tuần áp dụng điểm
        </label>
        <Input
          id="weekStartDate"
          type="date"
          value={weekStartDate}
          onChange={e => setWeekStartDate(e.target.value)}
          className={`w-full ${!isDateValid ? "border-danger focus-visible:ring-danger/20" : ""}`}
          required
        />
        {!isDateValid ? (
          <p className="text-[11px] text-danger font-semibold flex items-center gap-1 animate-pulse">
            <AlertCircle className="w-3 h-3" />
            Ngày bắt đầu tuần phải là ngày Thứ Hai.
          </p>
        ) : (
          <p className="text-[10px] text-neutral-400">
            Hệ thống tự động ghi nhận điểm thi đua theo tuần bắt đầu từ ngày Thứ Hai được chọn.
          </p>
        )}
      </div>

      {/* Point Value */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
          Số điểm thi đua
        </label>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPointValue(prev => Math.max(-100, prev < 0 ? prev - 5 : -5))}
            className="p-2 border-danger/20 text-danger hover:bg-danger-light/50 shrink-0 cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </Button>

          <input
            type="number"
            value={pointValue}
            onChange={e => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) setPointValue(val);
              else setPointValue(0);
            }}
            className="w-full text-center font-extrabold text-lg border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            min="-100"
            max="100"
            required
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPointValue(prev => Math.min(100, prev > 0 ? prev + 5 : 5))}
            className="p-2 border-success/20 text-success hover:bg-success-light/50 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Point Quick selector buttons */}
        <div className="flex justify-between gap-1.5 mt-2">
          {[-10, -5, -2, 2, 5, 10].map(val => (
            <button
              key={val}
              type="button"
              onClick={() => setPointValue(val)}
              className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                pointValue === val
                  ? val > 0 
                    ? "bg-success border-success text-white" 
                    : "bg-danger border-danger text-white"
                  : "bg-neutral-50 border-border text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {val > 0 ? `+${val}` : val}
            </button>
          ))}
        </div>
      </div>

      {/* Reason Field */}
      <div className="space-y-1.5">
        <label htmlFor="reason" className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
          Lý do chấm điểm
        </label>
        <textarea
          id="reason"
          rows={3}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Nhập lý do cụ thể (VD: Phát biểu xây dựng bài phát biểu hay...)"
          className="w-full rounded-xl border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-neutral-400"
          minLength={5}
          maxLength={500}
          required
        />
        <div className="flex justify-between text-[10px] text-neutral-400">
          <span>Tối thiểu 5 ký tự</span>
          <span>{reason.length}/500 ký tự</span>
        </div>
      </div>

      {/* Quick Templates List */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
          <ListTodo className="w-3.5 h-3.5" />
          Mẫu lý do nhanh
        </span>
        <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto pr-1 border border-neutral-100 rounded-xl p-2 bg-neutral-50/40">
          {QUICK_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyTemplate(tmpl)}
              className="p-1.5 text-left text-[11px] hover:bg-white rounded-lg border border-transparent hover:border-neutral-200 transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="text-neutral-700 truncate max-w-[80%] group-hover:text-neutral-900">
                {tmpl.text}
              </span>
              <span className={`font-bold text-[10px] shrink-0 ${
                tmpl.type === "positive" ? "text-success" : "text-danger"
              }`}>
                {tmpl.value > 0 ? `+${tmpl.value}` : tmpl.value}đ
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full font-bold shadow-md cursor-pointer pt-3 pb-3"
        disabled={isFormDisabled}
        isLoading={isSubmitting}
      >
        Ghi nhận điểm thi đua
      </Button>
    </form>
  );
}
