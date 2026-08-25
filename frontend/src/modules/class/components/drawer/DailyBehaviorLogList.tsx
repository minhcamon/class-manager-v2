import { AlertCircle } from "lucide-react";
import type { BehaviorLogItem } from "@/types/behavior";
import DailyBehaviorLogItem from "./DailyBehaviorLogItem";

interface DailyBehaviorLogListProps {
  logs: BehaviorLogItem[];
  canEdit: boolean;
  weekNumber: number;
  onUpdate: (id: number, ruleName: string, unitPoint: number, quantity: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function DailyBehaviorLogList({
  logs,
  canEdit,
  weekNumber,
  onUpdate,
  onDelete,
}: DailyBehaviorLogListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center justify-between">
        <span>Nhật ký hành vi trong tuần ({logs.length})</span>
      </h3>

      {logs.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border rounded-2xl p-6 text-neutral-400 bg-neutral-50/50">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs font-medium">
            Chưa có sự kiện thi đua nào được ghi nhận trong tuần {weekNumber}.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => (
            <DailyBehaviorLogItem
              key={log.id}
              log={log}
              canEdit={canEdit}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
