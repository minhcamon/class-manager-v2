interface WeeklyTableHeaderProps {
  weekNumber: number;
  nameColWidth: number;
  isResizing?: boolean;
  onResizeStart?: (e: React.MouseEvent) => void;
}

export default function WeeklyTableHeader({
  weekNumber,
  nameColWidth,
  isResizing,
  onResizeStart,
}: WeeklyTableHeaderProps) {
  return (
    <thead className="sticky top-0 z-20 shadow-xs">
      <tr className="bg-slate-100 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
        {/* Sticky Corner Header with Resizer */}
        <th
          style={{ width: `${nameColWidth}px`, minWidth: `${nameColWidth}px`, maxWidth: `${nameColWidth}px` }}
          className="px-4 py-3.5 sticky top-0 left-0 bg-slate-100 z-30 border-r border-slate-200 shadow-xs select-none"
        >
          <div className="flex items-center justify-between pr-2">
            <span className="truncate">Tổ / Học sinh</span>
          </div>

          {/* Column Resizer Handle */}
          {onResizeStart && (
            <div
              onMouseDown={onResizeStart}
              title="Kéo thả để chỉnh độ rộng cột"
              className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/50 transition-all flex items-center justify-center z-40 group ${
                isResizing ? "bg-primary" : "bg-transparent"
              }`}
            >
              <div
                className={`w-0.5 h-4 rounded-full transition-colors ${
                  isResizing ? "bg-white" : "bg-slate-300 group-hover:bg-primary"
                }`}
              />
            </div>
          )}
        </th>

        {/* Behavioral Details Column (Broadest) */}
        <th className="px-4 py-3.5 text-left border-r border-slate-200 bg-slate-100 min-w-[320px]">
          <div className="flex items-center justify-between">
            <span>Chi tiết ghi nhận (Tuần {weekNumber})</span>
            <span className="text-[10px] font-semibold text-slate-400 normal-case tracking-normal">
              Thứ • Hành vi • Điểm
            </span>
          </div>
        </th>

        {/* Plus Points (+) Column */}
        <th className="px-3 py-3.5 text-right w-20 min-w-20 border-r border-slate-200 bg-slate-100 text-emerald-700">
          Cộng +
        </th>

        {/* Minus Points (-) Column */}
        <th className="px-3 py-3.5 text-right w-20 min-w-20 border-r border-slate-200 bg-slate-100 text-rose-700">
          Trừ -
        </th>

        {/* Net Weekly Score Column */}
        <th className="px-3 py-3.5 text-center w-20 min-w-20 border-r border-slate-200 bg-slate-100">
          Tổng
        </th>

        {/* Action Column */}
        <th className="px-2 py-3.5 text-center w-20 min-w-20 bg-slate-100">
          Sửa
        </th>
      </tr>
    </thead>
  );
}
