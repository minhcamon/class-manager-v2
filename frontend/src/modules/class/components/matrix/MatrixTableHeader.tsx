interface MatrixTableHeaderProps {
  weekNumbers: number[];
}

export default function MatrixTableHeader({ weekNumbers }: MatrixTableHeaderProps) {
  return (
    <thead className="sticky top-0 z-20 shadow-xs">
      <tr className="bg-slate-100 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
        {/* Frozen Corner Header (Student / Group Column - Sticky Top & Left) */}
        <th className="px-5 py-3.5 sticky top-0 left-0 bg-slate-100 z-30 w-72 min-w-72 border-r border-slate-200 shadow-xs">
          Tổ / Học sinh
        </th>

        {/* Frozen Academic Total Column (Sticky Top) */}
        <th className="px-3 py-3.5 text-center sticky top-0 w-32 min-w-32 bg-slate-100 border-r border-slate-200">
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
