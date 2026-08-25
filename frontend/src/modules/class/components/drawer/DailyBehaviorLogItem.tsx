import { useState } from "react";
import { Clock, Pencil, Trash2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BehaviorLogItem } from "@/types/behavior";

interface DailyBehaviorLogItemProps {
  log: BehaviorLogItem;
  canEdit: boolean;
  onUpdate: (id: number, ruleName: string, unitPoint: number, quantity: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function DailyBehaviorLogItem({
  log,
  canEdit,
  onUpdate,
  onDelete,
}: DailyBehaviorLogItemProps) {
  const [editing, setEditing] = useState(false);
  const [editRuleName, setEditRuleName] = useState(log.ruleName);
  const [editUnitPoint, setEditUnitPoint] = useState(log.unitPoint);
  const [editQuantity, setEditQuantity] = useState(log.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (!editRuleName.trim()) {
      toast.error("Tên tiêu chí không được để trống.");
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(log.id, editRuleName.trim(), editUnitPoint, editQuantity);
      setEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi điểm này?")) return;
    await onDelete(log.id);
  };

  if (editing) {
    return (
      <div className="bg-white border border-primary/30 rounded-xl p-3.5 shadow-xs space-y-2.5">
        <input
          type="text"
          value={editRuleName}
          onChange={(e) => setEditRuleName(e.target.value)}
          className="w-full text-xs font-bold border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Tên tiêu chí"
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
            onClick={handleSave}
            disabled={isUpdating}
            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer flex items-center gap-1"
          >
            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Lưu
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-bold hover:bg-neutral-200 cursor-pointer"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl p-3.5 shadow-2xs hover:border-neutral-300 transition-all space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-xs font-bold text-neutral-900">{log.ruleName}</h4>
          <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
            {log.dayOfWeek && <span>{log.dayOfWeek}</span>}
            {log.quantity > 1 && <span>(x{log.quantity} lần)</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span
            className={`text-sm font-extrabold ${
              log.totalPoints > 0
                ? "text-emerald-600"
                : log.totalPoints < 0
                ? "text-rose-600"
                : "text-neutral-500"
            }`}
          >
            {log.totalPoints > 0 ? `+${log.totalPoints}` : log.totalPoints}đ
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
              onClick={() => setEditing(true)}
              className="p-1 hover:text-primary hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              title="Chỉnh sửa"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              title="Xóa"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
