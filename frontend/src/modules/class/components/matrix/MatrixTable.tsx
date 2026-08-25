import { Fragment, useRef, useState } from "react";
import { Layers } from "lucide-react";
import type { MatrixBoardResponse } from "@/types/matrix";
import MatrixTableHeader from "./MatrixTableHeader";
import MatrixGroupRow from "./MatrixGroupRow";
import MatrixStudentRow from "./MatrixStudentRow";
import MatrixTableSkeleton from "./MatrixTableSkeleton";

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

  // Drag to scroll state
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click
    if (e.button !== 0) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    if (tableContainerRef.current) {
      startXRef.current = e.pageX - tableContainerRef.current.offsetLeft;
      startScrollLeftRef.current = tableContainerRef.current.scrollLeft;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !tableContainerRef.current) return;
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
    // Suppress click if user was drag-scrolling
    if (hasDraggedRef.current) return;
    onCellClick(studentId, weekNumber);
  };

  const handleToggleGroupSafe = (groupId: number | null) => {
    if (hasDraggedRef.current) return;
    onToggleGroup(groupId);
  };

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
      className={`overflow-auto max-h-[calc(100vh-210px)] relative w-full border border-slate-200 rounded-2xl bg-white shadow-2xs select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <table className="w-full text-left border-collapse min-w-full">
        {/* Sticky Frozen Header */}
        <MatrixTableHeader weekNumbers={weekNumbers} />

        {/* Tree-Grid Body */}
        <tbody className="divide-y divide-slate-200/80 text-sm">
          {data.groups.map((group) => {
            const groupKey = String(group.groupId ?? "ungrouped");
            const isExpanded = expandedGroups[groupKey] !== false;

            return (
              <Fragment key={groupKey}>
                {/* Group Node */}
                <MatrixGroupRow
                  group={group}
                  isExpanded={isExpanded}
                  onToggle={() => handleToggleGroupSafe(group.groupId)}
                  weekCount={weekNumbers.length}
                />

                {/* Student Nodes */}
                {isExpanded &&
                  group.students.map((student) => (
                    <MatrixStudentRow
                      key={student.studentId}
                      student={student}
                      selectedStudentId={selectedStudentId}
                      selectedWeekNumber={selectedWeekNumber}
                      onCellClick={handleCellClickSafe}
                    />
                  ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
