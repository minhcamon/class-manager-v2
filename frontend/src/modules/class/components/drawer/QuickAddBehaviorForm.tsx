import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import behaviorService from "@/services/behaviorService";
import type { BehaviorType } from "@/types/behavior";
import Button from "@/components/ui/Button";

interface QuickAddBehaviorFormProps {
  studentId: number;
  classId: number;
  academicYear: number;
  weekNumber: number;
  onSuccess: () => void;
  onCancel: () => void;
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

export default function QuickAddBehaviorForm({
  studentId,
  classId,
  academicYear,
  weekNumber,
  onSuccess,
  onCancel,
}: QuickAddBehaviorFormProps) {
  const [ruleName, setRuleName] = useState("");
  const [behaviorType, setBehaviorType] = useState<BehaviorType>("BONUS");
  const [unitPoint, setUnitPoint] = useState(5);
  const [quantity, setQuantity] = useState(1);
  const [dayOfWeek, setDayOfWeek] = useState("Thứ 2");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyPreset = (preset: typeof PRESET_RULES[0]) => {
    setRuleName(preset.name);
    setBehaviorType(preset.type);
    setUnitPoint(preset.point);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      onSuccess();
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

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-2xl border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Nhập điểm thi đua mới
        </h4>
        <button
          type="button"
          onClick={onCancel}
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
              <span className={`font-bold text-[10px] ${preset.type === "BONUS" ? "text-emerald-600" : "text-rose-600"}`}>
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
  );
}
