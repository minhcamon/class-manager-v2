import { Filter, RefreshCw, ChevronsUpDown } from "lucide-react";

export type RangePreset = "recent" | "semester1" | "semester2" | "fullYear" | "custom";

interface MatrixFilterToolbarProps {
  academicYear: number;
  setAcademicYear: (year: number) => void;
  preset: RangePreset;
  onPresetChange: (preset: RangePreset) => void;
  onToggleExpandAll: () => void;
  allExpanded: boolean;
  onRefresh: () => void;
  loading: boolean;
}

export default function MatrixFilterToolbar({
  academicYear,
  setAcademicYear,
  preset,
  onPresetChange,
  onToggleExpandAll,
  allExpanded,
  onRefresh,
  loading,
}: MatrixFilterToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-1">
      {/* Scope Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Tuần:
        </span>

        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => onPresetChange("recent")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              preset === "recent"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            4 tuần gần nhất
          </button>
          <button
            onClick={() => onPresetChange("semester1")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              preset === "semester1"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Học kỳ 1 (T1-18)
          </button>
          <button
            onClick={() => onPresetChange("semester2")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              preset === "semester2"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Học kỳ 2 (T19-36)
          </button>
          <button
            onClick={() => onPresetChange("fullYear")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              preset === "fullYear"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cả năm
          </button>
        </div>
      </div>

      {/* Actions: Expand/Collapse, Academic Year & Refresh */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleExpandAll}
          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          title={allExpanded ? "Thu gọn tất cả tổ" : "Mở rộng tất cả tổ"}
        >
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500" />
          {allExpanded ? "Thu gọn tổ" : "Mở rộng tổ"}
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-500">Năm học:</span>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value={2026}>2025 - 2026</option>
            <option value={2025}>2024 - 2025</option>
          </select>
        </div>

        <button
          onClick={onRefresh}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          title="Làm mới ma trận"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
        </button>
      </div>
    </div>
  );
}
