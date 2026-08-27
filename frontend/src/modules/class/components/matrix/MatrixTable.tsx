import { Fragment, useRef, useState, useMemo } from "react";
import { Layers } from "lucide-react";
import type { MatrixBoardResponse } from "@/types/matrix";
import MatrixTableHeader from "./MatrixTableHeader";
import MatrixGroupRow from "./MatrixGroupRow";
import MatrixStudentRow from "./MatrixStudentRow";
import MatrixTableSkeleton from "./MatrixTableSkeleton";
import { useColumnResize } from "../../hooks/useColumnResize";
import { getGroupDuplicateFirstNames } from "../../utils/nameFormatters";

interface MatrixTableProps {
  data: MatrixBoardResponse | null;
  loading: boolean;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (groupId: number | null) => void;
  selectedStudentId: number | null;
  selectedWeekNumber: number | null;
  onCellClick: (studentId: number, weekNumber: number) => void;
}

export default function MatrixTable({
  data,
  loading,
  expandedGroups,
  onToggleGroup,
  selectedStudentId,
  selectedWeekNumber,
  onCellClick,
}: MatrixTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Column Resizer hook
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

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click and not resizing
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

  const handleCellClickSafe = (studentId: number, weekNumber: number) => {
    // Suppress click if user was drag-scrolling or resizing
    if (hasDraggedRef.current || isResizing) return;
    onCellClick(studentId, weekNumber);
  };

  const handleToggleGroupSafe = (groupId: number | null) => {
    if (hasDraggedRef.current || isResizing) return;
    onToggleGroup(groupId);
  };

  // Pre-calculate group duplicate first names for every group in group context
  const groupDuplicateMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    if (!data?.groups) return map;
    for (const group of data.groups) {
      const key = String(group.groupId ?? "ungrouped");
      map.set(key, getGroupDuplicateFirstNames(group.students));
    }
    return map;
  }, [data?.groups]);

  if (loading) {
    return <MatrixTableSkeleton rowCount={8} colCount={data ? data.toWeek - data.fromWeek + 1 : 4} />;
  }

  if (!data || data.groups.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-400">
        <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium">Chưa có dữ liệu danh sách tổ hoặc học sinh trong lớp.</p>
      </div>
    );
  }

  const weekNumbers: number[] = [];
  for (let w = data.fromWeek; w <= data.toWeek; w++) {
    weekNumbers.push(w);
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
        {/* Sticky Frozen Header with Resizer */}
        <MatrixTableHeader
          weekNumbers={weekNumbers}
          nameColWidth={colWidth}
          isResizing={isResizing}
          onResizeStart={startResizing}
        />

        {/* Tree-Grid Body */}
        <tbody className="divide-y divide-slate-200/80 text-sm">
          {data.groups.map((group) => {
            const groupKey = String(group.groupId ?? "ungrouped");
            const isExpanded = expandedGroups[groupKey] !== false;
            const duplicateSet = groupDuplicateMap.get(groupKey) || new Set<string>();

            return (
              <Fragment key={groupKey}>
                {/* Group Node */}
                <MatrixGroupRow
                  group={group}
                  isExpanded={isExpanded}
                  onToggle={() => handleToggleGroupSafe(group.groupId)}
                  weekCount={weekNumbers.length}
                  nameColWidth={colWidth}
                />

                {/* Student Nodes */}
                {isExpanded &&
                  group.students.map((student) => {
                    const parts = student.studentName?.trim().split(/\s+/) || [];
                    const firstName = parts.length > 0 ? parts[parts.length - 1].toLowerCase() : "";
                    const isDuplicateInGroup = duplicateSet.has(firstName);

                    return (
                      <MatrixStudentRow
                        key={student.studentId}
                        student={student}
                        selectedStudentId={selectedStudentId}
                        selectedWeekNumber={selectedWeekNumber}
                        nameColWidth={colWidth}
                        isDuplicateInGroup={isDuplicateInGroup}
                        onCellClick={handleCellClickSafe}
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

