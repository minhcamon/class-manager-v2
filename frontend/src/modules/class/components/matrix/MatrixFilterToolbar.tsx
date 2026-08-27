import { Filter, RefreshCw, ChevronsUpDown, LayoutGrid, CalendarDays, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

export type RangePreset = "recent" | "semester1" | "semester2" | "fullYear" | "custom";
export type MatrixViewMode = "matrix" | "weeklyFocus";

interface MatrixFilterToolbarProps {
  viewMode: MatrixViewMode;
  onViewModeChange: (mode: MatrixViewMode) => void;
  academicYear: number;
  setAcademicYear: (year: number) => void;
  preset: RangePreset;
  onPresetChange: (preset: RangePreset) => void;
  selectedFocusWeek: number;
  onSelectedFocusWeekChange: (week: number) => void;
  onToggleExpandAll: () => void;
  allExpanded: boolean;
  isGlobalExpanded: boolean;
  onToggleGlobalExpanded: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function MatrixFilterToolbar({
  viewMode,
  onViewModeChange,
  academicYear,
  setAcademicYear,
  preset,
  onPresetChange,
  selectedFocusWeek,
  onSelectedFocusWeekChange,
  onToggleExpandAll,
  allExpanded,
  isGlobalExpanded,
  onToggleGlobalExpanded,
  onRefresh,
  loading,
}: MatrixFilterToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-1">
      {/* Left: View Mode Toggle & Scope / Week selector */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* View Mode Switcher */}
        <div className="flex bg-slate-200/70 p-0.5 rounded-xl gap-0.5 border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => onViewModeChange("matrix")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === "matrix"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Bảng Ma Trận</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("weeklyFocus")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === "weeklyFocus"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Tab Tuần Chi Tiết</span>
          </button>
        </div>

        {/* Matrix Mode: Presets */}
        {viewMode === "matrix" && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" />
            </span>
            <div className="flex bg-slate-100 p-0.5 rounded-xl gap-0.5 border border-slate-200/60">
              <button
                type="button"
                onClick={() => onPresetChange("recent")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  preset === "recent"
                    ? "bg-white text-primary shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                4 tuần gần nhất
              </button>
              <button
                type="button"
                onClick={() => onPresetChange("semester1")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  preset === "semester1"
                    ? "bg-white text-primary shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                HK 1 (T1-18)
              </button>
              <button
                type="button"
                onClick={() => onPresetChange("semester2")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  preset === "semester2"
                    ? "bg-white text-primary shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                HK 2 (T19-36)
              </button>
              <button
                type="button"
                onClick={() => onPresetChange("fullYear")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  preset === "fullYear"
                    ? "bg-white text-primary shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Cả năm
              </button>
            </div>
          </div>
        )}

        {/* Weekly Focus Mode: Week Stepper */}
        {viewMode === "weeklyFocus" && (
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              type="button"
              disabled={selectedFocusWeek <= 1}
              onClick={() => onSelectedFocusWeekChange(selectedFocusWeek - 1)}
              className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-white transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-2">
              <span className="text-xs font-extrabold text-slate-900">
                Tuần {selectedFocusWeek}
              </span>
            </div>
            <button
              type="button"
              disabled={selectedFocusWeek >= 52}
              onClick={() => onSelectedFocusWeekChange(selectedFocusWeek + 1)}
              className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-white transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Tuần sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Right: Actions (Expand/Collapse, Academic Year, Refresh) */}
      <div className="flex items-center gap-2">
        {/* Global Expand Toggle (Only in Weekly Focus mode) */}
        {viewMode === "weeklyFocus" && (
          <button
            type="button"
            onClick={onToggleGlobalExpanded}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border shadow-2xs ${
              isGlobalExpanded
                ? "bg-primary text-white border-primary"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
            title={isGlobalExpanded ? "Thu gọn danh sách lỗi" : "Mở rộng toàn bộ lỗi"}
          >
            {isGlobalExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isGlobalExpanded ? "Thu gọn lỗi" : "Mở toàn bộ lỗi"}</span>
          </button>
        )}

        {/* Tree Group Toggle */}
        <button
          type="button"
          onClick={onToggleExpandAll}
          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          title={allExpanded ? "Thu gọn tất cả tổ" : "Mở rộng tất cả tổ"}
        >
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500" />
          <span>{allExpanded ? "Thu gọn tổ" : "Mở rộng tổ"}</span>
        </button>

        {/* Academic Year */}
        <div className="flex items-center gap-1">
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
          >
            <option value={2026}>2025 - 2026</option>
            <option value={2025}>2024 - 2025</option>
          </select>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-60 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : "text-slate-500"}`} />
          <span>{loading ? "Đang tải..." : "Làm mới"}</span>
        </button>
      </div>
    </div>
  );
}

