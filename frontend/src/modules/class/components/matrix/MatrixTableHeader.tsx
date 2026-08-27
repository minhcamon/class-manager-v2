interface MatrixTableHeaderProps {
  weekNumbers: number[];
  nameColWidth: number;
  isResizing?: boolean;
  onResizeStart?: (e: React.MouseEvent) => void;
}

export default function MatrixTableHeader({
  weekNumbers,
  nameColWidth,
  isResizing,
  onResizeStart,
}: MatrixTableHeaderProps) {
  return (
    <thead className="sticky top-0 z-20 shadow-xs">
      <tr className="bg-slate-100 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
        {/* Frozen Corner Header (Student / Group Column - Sticky Top & Left with Resizer) */}
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
              <div className={`w-0.5 h-4 rounded-full transition-colors ${
                isResizing ? "bg-white" : "bg-slate-300 group-hover:bg-primary"
              }`} />
            </div>
          )}
        </th>

        {/* Frozen Academic Total Column (Sticky Top) */}
        <th className="px-3 py-3.5 text-center sticky top-0 w-28 min-w-28 bg-slate-100 border-r border-slate-200">
          Tích lũy năm
        </th>

        {/* Frozen Dynamic Week Columns (Sticky Top) */}
        {weekNumbers.map((w) => (
          <th
            key={w}
            className="px-3 py-2.5 text-center sticky top-0 min-w-28 border-r border-slate-200 bg-slate-100"
          >
            <span className="block text-xs text-slate-900 font-extrabold">Tuần {w}</span>
            <span className="block text-[10px] font-semibold text-slate-400 tracking-tight mt-0.5">
              net (+ / -)
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );
}

