import type { Group } from "@/types/group";
import type { ClassStudentResponse } from "@/types/studentProfile";

interface GroupFilterTabsProps {
  selectedGroupFilter: string;
  onSelectFilter: (filter: string) => void;
  groups: Group[];
  students: ClassStudentResponse[];
}

export default function GroupFilterTabs({
  selectedGroupFilter,
  onSelectFilter,
  groups,
  students
}: GroupFilterTabsProps) {
  const unassignedCount = students.filter(s => s.groupId === null).length;

  return (
    <div className="space-y-2.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
        Lọc theo tổ học tập
      </span>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onSelectFilter("all")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
            selectedGroupFilter === "all"
              ? "bg-primary text-white border-primary shadow-xs"
              : "bg-neutral-50 border-border text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          Tất cả lớp ({students.length})
        </button>
        {unassignedCount > 0 && (
          <button
            type="button"
            onClick={() => onSelectFilter("unassigned")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              selectedGroupFilter === "unassigned"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-neutral-50 border-border text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Chưa phân tổ ({unassignedCount})
          </button>
        )}
        {groups.map(g => {
          const count = students.filter(s => s.groupId === g.id).length;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelectFilter(g.id.toString())}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                selectedGroupFilter === g.id.toString()
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-neutral-50 border-border text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {g.groupName} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
}
