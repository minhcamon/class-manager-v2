import { Fragment, useRef, useState, useMemo } from "react";
import { Layers } from "lucide-react";
import type { WeeklyFocusResponse } from "@/types/matrix";
import WeeklyTableHeader from "./WeeklyTableHeader";
import WeeklyGroupRow from "./WeeklyGroupRow";
import WeeklyStudentRow from "./WeeklyStudentRow";
import MatrixTableSkeleton from "../MatrixTableSkeleton";
import { useColumnResize } from "../../../hooks/useColumnResize";

interface WeeklyFocusTableProps {
  data: WeeklyFocusResponse | null;
  loading: boolean;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (groupId: number | null) => void;
  isGlobalExpanded: boolean;
  onOpenDrawer: (studentId: number) => void;
  onRefresh: () => void;
}

export default function WeeklyFocusTable({
  data,
  loading,
  expandedGroups,
  onToggleGroup,
  isGlobalExpanded,
  onOpenDrawer,
  onRefresh,
}: WeeklyFocusTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Column Resizer
  const { colWidth, isResizing, startResizing } = useColumnResize({
    defaultWidth: 240,
    minWidth: 140,
    maxWidth: 360,
  });

  // Drag to scroll state
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || isResizing) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    if (tableContainerRef.current) {
      startXRef.current = e.pageX - tableContainerRef.current.offsetLeft;
      startScrollLeftRef.current = tableContainerRef.current.scrollLeft;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !tableContainerRef.current || isResizing) return;
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 5) {
      if (!hasDraggedRef.current) {
        hasDraggedRef.current = true;
        setIsDragging(true);
      }
      tableContainerRef.current.scrollLeft = startScrollLeftRef.current - walk;
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
      setIsDragging(false);
    }, 50);
  };

  // Group-level duplicate name detection map
  const groupDuplicateMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    if (!data?.groups) return map;
    for (const group of data.groups) {
      const counts = new Map<string, number>();
      for (const s of group.students) {
        if (!s.studentName) continue;
        const parts = s.studentName.trim().split(/\s+/);
        if (parts.length === 0) continue;
        const firstName = parts[parts.length - 1].toLowerCase();
        counts.set(firstName, (counts.get(firstName) || 0) + 1);
      }
      const duplicates = new Set<string>();
      for (const [name, count] of counts.entries()) {
        if (count > 1) duplicates.add(name);
      }
      map.set(String(group.groupId ?? "ungrouped"), duplicates);
    }
    return map;
  }, [data?.groups]);

  if (loading) {
    return <MatrixTableSkeleton rowCount={8} colCount={5} />;
  }

  if (!data || data.groups.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-400">
        <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium">Chưa có dữ liệu danh sách tổ hoặc học sinh trong lớp.</p>
      </div>
    );
  }

  return (
    <div
      ref={tableContainerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`overflow-auto max-h-[calc(100vh-210px)] relative w-full border border-slate-200 rounded-2xl bg-white shadow-2xs select-none scrollbar-auto-hide ${
        isResizing
          ? "cursor-col-resize select-none"
          : isDragging
          ? "cursor-grabbing"
          : "cursor-grab"
      }`}
    >
      <table className="w-full text-left border-collapse min-w-full">
        {/* Sticky Table Header */}
        <WeeklyTableHeader
          weekNumber={data.weekNumber}
          nameColWidth={colWidth}
          isResizing={isResizing}
          onResizeStart={startResizing}
        />

        {/* Table Body */}
        <tbody className="divide-y divide-slate-200/80 text-sm">
          {data.groups.map((group) => {
            const groupKey = String(group.groupId ?? "ungrouped");
            const isExpanded = expandedGroups[groupKey] !== false;
            const duplicateSet = groupDuplicateMap.get(groupKey) || new Set<string>();

            return (
              <Fragment key={groupKey}>
                {/* Group Header Row */}
                <WeeklyGroupRow
                  group={group}
                  isExpanded={isExpanded}
                  onToggle={() => onToggleGroup(group.groupId)}
                  nameColWidth={colWidth}
                />

                {/* Student Rows */}
                {isExpanded &&
                  group.students.map((student, idx) => {
                    const parts = student.studentName?.trim().split(/\s+/) || [];
                    const firstName = parts.length > 0 ? parts[parts.length - 1].toLowerCase() : "";
                    const isDuplicateInGroup = duplicateSet.has(firstName);

                    return (
                      <WeeklyStudentRow
                        key={student.studentId}
                        student={student}
                        index={idx}
                        nameColWidth={colWidth}
                        isDuplicateInGroup={isDuplicateInGroup}
                        isGlobalExpanded={isGlobalExpanded}
                        weekStartDate={data.weekStartDate}
                        isLocked={data.isLocked}
                        onOpenDrawer={onOpenDrawer}
                        onRefresh={onRefresh}
                      />
                    );
                  })}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
