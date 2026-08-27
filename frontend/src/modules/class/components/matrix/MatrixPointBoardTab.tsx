/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import matrixService from "@/services/matrixService";
import type { MatrixBoardResponse, WeeklyFocusResponse } from "@/types/matrix";

// Subcomponents
import MatrixFilterToolbar, { type RangePreset, type MatrixViewMode } from "./MatrixFilterToolbar";
import MatrixTable from "./MatrixTable";
import WeeklyFocusTable from "./weekly/WeeklyFocusTable";
import StudentWeeklyInspectorDrawer from "../drawer/StudentWeeklyInspectorDrawer";

interface MatrixPointBoardTabProps {
  classId: string;
  canEdit?: boolean;
  refreshTrigger?: number;
}

export default function MatrixPointBoardTab({
  classId,
  canEdit = true,
  refreshTrigger,
}: MatrixPointBoardTabProps) {
  // View Mode: "matrix" | "weeklyFocus"
  const [viewMode, setViewMode] = useState<MatrixViewMode>("matrix");

  // Matrix Mode Data & Loading
  const [data, setData] = useState<MatrixBoardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Weekly Focus Mode Data & Loading
  const [weeklyData, setWeeklyData] = useState<WeeklyFocusResponse | null>(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [selectedFocusWeek, setSelectedFocusWeek] = useState<number>(1);
  const [isGlobalExpanded, setIsGlobalExpanded] = useState<boolean>(false);

  // Filters
  const [academicYear, setAcademicYear] = useState<number>(2026);
  const [preset, setPreset] = useState<RangePreset>("recent");
  const [fromWeek, setFromWeek] = useState<number>(1);
  const [toWeek, setToWeek] = useState<number>(4);

  // Expanded Groups Set (with localStorage persistence)
  const storageKey = `class_${classId}_matrix_expanded_groups`;
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Drawer state & selected cell
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null);

  // Fetch Matrix Board
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

      // Default expand all if no prior preference saved in localStorage
      setExpandedGroups((prev) => {
        const next = { ...prev };
        let modified = false;
        res.groups.forEach((g) => {
          const key = String(g.groupId ?? "ungrouped");
          if (next[key] === undefined) {
            next[key] = true;
            modified = true;
          }
        });
        if (modified) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {
            // Ignore storage errors
          }
        }
        return next;
      });
    } catch (e) {
      console.error("Failed to fetch matrix board", e);
      toast.error("Không thể tải bảng ma trận điểm thi đua.");
    } finally {
      setLoading(false);
    }
  }, [classId, academicYear, fromWeek, toWeek, storageKey]);

  // Fetch Weekly Focus Board
  const fetchWeeklyFocus = useCallback(async () => {
    if (!classId) return;
    setWeeklyLoading(true);
    try {
      const classIdInt = parseInt(classId);
      const res = await matrixService.getWeeklyFocusBoard(classIdInt, {
        academicYear,
        weekNumber: selectedFocusWeek,
      });
      setWeeklyData(res);

      setExpandedGroups((prev) => {
        const next = { ...prev };
        let modified = false;
        res.groups.forEach((g) => {
          const key = String(g.groupId ?? "ungrouped");
          if (next[key] === undefined) {
            next[key] = true;
            modified = true;
          }
        });
        if (modified) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {
            // Ignore storage errors
          }
        }
        return next;
      });
    } catch (e) {
      console.error("Failed to fetch weekly focus board", e);
      toast.error("Không thể tải chi tiết bảng điểm tuần.");
    } finally {
      setWeeklyLoading(false);
    }
  }, [classId, academicYear, selectedFocusWeek, storageKey]);

  useEffect(() => {
    if (viewMode === "matrix") {
      fetchMatrix();
    } else {
      fetchWeeklyFocus();
    }
  }, [viewMode, fetchMatrix, fetchWeeklyFocus, refreshTrigger]);

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
    setExpandedGroups((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const toggleExpandAll = () => {
    const currentGroups = viewMode === "matrix" ? data?.groups : weeklyData?.groups;
    if (!currentGroups) return;
    const allAreExpanded = currentGroups.every(
      (g) => expandedGroups[String(g.groupId ?? "ungrouped")] !== false
    );
    const next: Record<string, boolean> = {};
    currentGroups.forEach((g) => {
      next[String(g.groupId ?? "ungrouped")] = !allAreExpanded;
    });
    setExpandedGroups(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  };

  const handleCellClick = (studentId: number, weekNumber: number) => {
    setSelectedStudentId(studentId);
    setSelectedWeekNumber(weekNumber);
    setDrawerOpen(true);
  };

  const handleOpenWeeklyDrawer = (studentId: number) => {
    setSelectedStudentId(studentId);
    setSelectedWeekNumber(selectedFocusWeek);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedStudentId(null);
    setSelectedWeekNumber(null);
  };

  const currentGroups = viewMode === "matrix" ? data?.groups : weeklyData?.groups;
  const allExpanded = Boolean(
    currentGroups &&
      currentGroups.length > 0 &&
      currentGroups.every((g) => expandedGroups[String(g.groupId ?? "ungrouped")] !== false)
  );

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 space-y-2.5">
      {/* ── Fixed Static Filter Toolbar ──────────────────────────────── */}
      <div className="shrink-0">
        <MatrixFilterToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          academicYear={academicYear}
          setAcademicYear={setAcademicYear}
          preset={preset}
          onPresetChange={handlePresetChange}
          selectedFocusWeek={selectedFocusWeek}
          onSelectedFocusWeekChange={setSelectedFocusWeek}
          onToggleExpandAll={toggleExpandAll}
          allExpanded={allExpanded}
          isGlobalExpanded={isGlobalExpanded}
          onToggleGlobalExpanded={() => setIsGlobalExpanded((prev) => !prev)}
          onRefresh={viewMode === "matrix" ? fetchMatrix : fetchWeeklyFocus}
          loading={viewMode === "matrix" ? loading : weeklyLoading}
        />
      </div>

      {/* ── Viewport Mode: Matrix Table vs Weekly Focus Table ────────── */}
      {viewMode === "matrix" ? (
        <MatrixTable
          data={data}
          loading={loading}
          expandedGroups={expandedGroups}
          onToggleGroup={toggleGroup}
          selectedStudentId={selectedStudentId}
          selectedWeekNumber={selectedWeekNumber}
          onCellClick={handleCellClick}
        />
      ) : (
        <WeeklyFocusTable
          data={weeklyData}
          loading={weeklyLoading}
          expandedGroups={expandedGroups}
          onToggleGroup={toggleGroup}
          isGlobalExpanded={isGlobalExpanded}
          onOpenDrawer={handleOpenWeeklyDrawer}
          onRefresh={fetchWeeklyFocus}
        />
      )}

      {/* ── Inspector Drawer ─────────────────────────────────────────── */}
      <StudentWeeklyInspectorDrawer
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        studentId={selectedStudentId}
        classId={parseInt(classId)}
        academicYear={academicYear}
        weekNumber={selectedWeekNumber ?? selectedFocusWeek ?? 1}
        canEdit={canEdit}
        onRefreshRequired={viewMode === "matrix" ? fetchMatrix : fetchWeeklyFocus}
      />
    </div>
  );
}

