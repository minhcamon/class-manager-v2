/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  Filter, 
  RefreshCw, 
  Layers
} from "lucide-react";
import { toast } from "sonner";
import matrixService from "@/services/matrixService";
import type { MatrixBoardResponse } from "@/types/matrix";
import StudentWeeklyInspectorDrawer from "./StudentWeeklyInspectorDrawer";

interface MatrixPointBoardTabProps {
  classId: string;
  canEdit?: boolean;
  refreshTrigger?: number;
}

type RangePreset = "recent" | "semester1" | "semester2" | "fullYear" | "custom";

export default function MatrixPointBoardTab({
  classId,
  canEdit = true,
  refreshTrigger,
}: MatrixPointBoardTabProps) {
  const [data, setData] = useState<MatrixBoardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [academicYear, setAcademicYear] = useState<number>(2026);
  const [preset, setPreset] = useState<RangePreset>("recent");
  const [fromWeek, setFromWeek] = useState<number>(1);
  const [toWeek, setToWeek] = useState<number>(4);

  // Expanded Groups Set (stores group IDs or 'ungrouped')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(1);

  const fetchMatrix = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const classIdInt = parseInt(classId);
      const res = await matrixService.getMatrixBoard(classIdInt, {
        academicYear,
        fromWeek,
        toWeek,
      });
      setData(res);

      // Expand all groups by default on initial load
      setExpandedGroups(prev => {
        const next = { ...prev };
        res.groups.forEach(g => {
          const key = String(g.groupId ?? "ungrouped");
          if (next[key] === undefined) {
            next[key] = true;
          }
        });
        return next;
      });
    } catch (e) {
      console.error("Failed to fetch matrix board", e);
      toast.error("Không thể tải bảng ma trận điểm thi đua.");
    } finally {
      setLoading(false);
    }
  }, [classId, academicYear, fromWeek, toWeek]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix, refreshTrigger]);

  const handlePresetChange = (newPreset: RangePreset) => {
    setPreset(newPreset);
    if (newPreset === "recent") {
      setFromWeek(1);
      setToWeek(4);
    } else if (newPreset === "semester1") {
      setFromWeek(1);
      setToWeek(18);
    } else if (newPreset === "semester2") {
      setFromWeek(19);
      setToWeek(36);
    } else if (newPreset === "fullYear") {
      setFromWeek(1);
      setToWeek(36);
    }
  };

  const toggleGroup = (groupId: number | null) => {
    const key = String(groupId ?? "ungrouped");
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCellClick = (studentId: number, weekNumber: number) => {
    setSelectedStudentId(studentId);
    setSelectedWeekNumber(weekNumber);
    setDrawerOpen(true);
  };

  // Generate array of week numbers [fromWeek .. toWeek]
  const weekNumbers: number[] = [];
  if (data) {
    for (let w = data.fromWeek; w <= data.toWeek; w++) {
      weekNumbers.push(w);
    }
  }

  return (
    <div className="space-y-5">
      {/* Filter & Control Toolbar */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Phạm vi tuần:
          </span>

          {/* Range Presets */}
          <div className="flex bg-neutral-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => handlePresetChange("recent")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                preset === "recent"
                  ? "bg-white text-primary shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Gần đây (Tuần 1-4)
            </button>
            <button
              onClick={() => handlePresetChange("semester1")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                preset === "semester1"
                  ? "bg-white text-primary shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Học kỳ 1 (Tuần 1-18)
            </button>
            <button
              onClick={() => handlePresetChange("semester2")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                preset === "semester2"
                  ? "bg-white text-primary shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Học kỳ 2 (Tuần 19-36)
            </button>
            <button
              onClick={() => handlePresetChange("fullYear")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                preset === "fullYear"
                  ? "bg-white text-primary shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Toàn năm
            </button>
          </div>
        </div>

        {/* Academic Year & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-neutral-500">Năm học:</span>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(Number(e.target.value))}
              className="bg-neutral-50 border border-border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value={2026}>2025 - 2026</option>
              <option value={2025}>2024 - 2025</option>
            </select>
          </div>

          <button
            onClick={fetchMatrix}
            className="p-2 text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Làm mới ma trận"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* Matrix Tree Grid Table */}
      <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mb-2" />
            <span className="text-sm font-medium">Đang tổng hợp ma trận điểm đa tuần...</span>
          </div>
        ) : !data || data.groups.length === 0 ? (
          <div className="text-center py-20 text-neutral-400">
            <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Chưa có dữ liệu danh sách tổ hoặc học sinh trong lớp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              {/* Table Header */}
              <thead>
                <tr className="bg-neutral-50/80 border-b border-border text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <th className="px-5 py-3.5 sticky left-0 bg-neutral-50/95 z-10 w-64">
                    Tổ / Học sinh
                  </th>
                  <th className="px-3 py-3.5 text-center w-28 bg-neutral-50/80">
                    Tích lũy năm
                  </th>
                  {weekNumbers.map((w) => (
                    <th key={w} className="px-2 py-2.5 text-center min-w-[90px] border-l border-border/40">
                      <span className="block text-[11px] text-neutral-800">Tuần {w}</span>
                      <span className="block text-[9px] font-semibold text-neutral-400 lowercase">net (+ / -)</span>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body with Group Nesting */}
              <tbody className="divide-y divide-border/60 text-sm">
                {data.groups.map((group) => {
                  const groupKey = String(group.groupId ?? "ungrouped");
                  const isExpanded = expandedGroups[groupKey] !== false;

                  return (
                    <div key={groupKey} style={{ display: "contents" }}>
                      {/* Group Header Row */}
                      <tr className="bg-neutral-100/50 hover:bg-neutral-100/80 font-bold text-neutral-800 transition-colors">
                        <td 
                          className="px-5 py-3 sticky left-0 bg-neutral-100/90 z-10 cursor-pointer flex items-center gap-2 select-none"
                          onClick={() => toggleGroup(group.groupId)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-neutral-500" />
                          )}
                          <span className="text-neutral-900">{group.groupName}</span>
                          <span className="text-xs text-neutral-400 font-normal">
                            ({group.students.length} HS)
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-xs font-extrabold text-primary px-2 py-0.5 bg-primary/10 rounded-md">
                            TB: {group.groupAvgScore}đ
                          </span>
                        </td>
                        {weekNumbers.map((w) => (
                          <td key={w} className="px-2 py-3 border-l border-border/40 bg-neutral-100/30"></td>
                        ))}
                      </tr>

                      {/* Student Rows inside Group */}
                      {isExpanded &&
                        group.students.map((student) => (
                          <tr
                            key={student.studentId}
                            className="hover:bg-neutral-50/60 transition-colors group"
                          >
                            {/* Student Name */}
                            <td className="px-5 py-2.5 pl-11 sticky left-0 bg-white group-hover:bg-neutral-50/90 z-10">
                              <span className="font-semibold text-neutral-800 text-xs truncate block max-w-[200px]">
                                {student.studentName}
                              </span>
                            </td>

                            {/* Total Academic Points */}
                            <td className="px-3 py-2.5 text-center">
                              <span className="font-extrabold text-xs text-neutral-900">
                                {student.totalAcademicPoints}đ
                              </span>
                            </td>

                            {/* Week Cells */}
                            {student.weekCells.map((cell) => {
                              const hasLogs = cell.logCount > 0;
                              const isPositive = cell.netScore > 0;
                              const isNegative = cell.netScore < 0;

                              return (
                                <td
                                  key={cell.weekNumber}
                                  onClick={() => handleCellClick(student.studentId, cell.weekNumber)}
                                  className="px-1.5 py-1.5 text-center border-l border-border/40 cursor-pointer hover:bg-primary-light/40 transition-colors"
                                  title={`Tuần ${cell.weekNumber}: ${cell.netScore}đ (+${cell.posScore} / ${cell.negScore}) • Click để xem chi tiết`}
                                >
                                  <div className={`p-1.5 rounded-lg border transition-all ${
                                    hasLogs
                                      ? isPositive
                                        ? "bg-emerald-50/70 border-emerald-200/60"
                                        : isNegative
                                          ? "bg-red-50/70 border-red-200/60"
                                          : "bg-neutral-50 border-neutral-200"
                                      : "bg-neutral-50/30 border-transparent hover:border-neutral-200"
                                  }`}>
                                    <span className={`text-xs font-extrabold block ${
                                      hasLogs
                                        ? isPositive
                                          ? "text-emerald-700"
                                          : isNegative
                                            ? "text-red-600"
                                            : "text-neutral-600"
                                        : "text-neutral-400 font-normal"
                                    }`}>
                                      {cell.netScore > 0 ? `+${cell.netScore}` : cell.netScore}
                                    </span>
                                    {hasLogs && (cell.posScore > 0 || cell.negScore < 0) ? (
                                      <span className="text-[9px] font-semibold text-neutral-400 block tracking-tighter">
                                        <span className="text-emerald-600">+{cell.posScore}</span>
                                        <span className="text-neutral-300 mx-0.5">/</span>
                                        <span className="text-red-500">{cell.negScore}</span>
                                      </span>
                                    ) : (
                                      <span className="text-[9px] text-neutral-300 block">-</span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                    </div>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspector Drawer */}
      <StudentWeeklyInspectorDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        studentId={selectedStudentId}
        classId={parseInt(classId)}
        academicYear={academicYear}
        weekNumber={selectedWeekNumber}
        canEdit={canEdit}
        onRefreshRequired={fetchMatrix}
      />
    </div>
  );
}
