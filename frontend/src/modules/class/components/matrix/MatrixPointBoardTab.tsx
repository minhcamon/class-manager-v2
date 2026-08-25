/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import matrixService from "@/services/matrixService";
import type { MatrixBoardResponse } from "@/types/matrix";

// Subcomponents
import MatrixFilterToolbar, { type RangePreset } from "./MatrixFilterToolbar";
import MatrixTable from "./MatrixTable";
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
  const [data, setData] = useState<MatrixBoardResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (!data) return;
    const allAreExpanded = data.groups.every(
      (g) => expandedGroups[String(g.groupId ?? "ungrouped")] !== false
    );
    const next: Record<string, boolean> = {};
    data.groups.forEach((g) => {
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

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedStudentId(null);
    setSelectedWeekNumber(null);
  };

  const allExpanded = Boolean(
    data &&
      data.groups.length > 0 &&
      data.groups.every((g) => expandedGroups[String(g.groupId ?? "ungrouped")] !== false)
  );

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 space-y-2.5">
      {/* ── Fixed Static Filter Toolbar ──────────────────────────────── */}
      <div className="shrink-0">
        <MatrixFilterToolbar
          academicYear={academicYear}
          setAcademicYear={setAcademicYear}
          preset={preset}
          onPresetChange={handlePresetChange}
          onToggleExpandAll={toggleExpandAll}
          allExpanded={allExpanded}
          onRefresh={fetchMatrix}
          loading={loading}
        />
      </div>

      {/* ── Full-height Matrix Table with Frozen Header ──────────────── */}
      <MatrixTable
        data={data}
        loading={loading}
        expandedGroups={expandedGroups}
        onToggleGroup={toggleGroup}
        selectedStudentId={selectedStudentId}
        selectedWeekNumber={selectedWeekNumber}
        onCellClick={handleCellClick}
      />

      {/* ── Inspector Drawer ─────────────────────────────────────────── */}
      <StudentWeeklyInspectorDrawer
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        studentId={selectedStudentId}
        classId={parseInt(classId)}
        academicYear={academicYear}
        weekNumber={selectedWeekNumber ?? 1}
        canEdit={canEdit}
        onRefreshRequired={fetchMatrix}
      />
    </div>
  );
}
