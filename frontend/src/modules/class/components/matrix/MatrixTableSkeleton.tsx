interface MatrixTableSkeletonProps {
  rowCount?: number;
  colCount?: number;
}

export default function MatrixTableSkeleton({
  rowCount = 6,
  colCount = 4,
}: MatrixTableSkeletonProps) {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      {/* Fake Header */}
      <div className="flex gap-2">
        <div className="h-10 bg-neutral-200 rounded-xl w-60 shrink-0" />
        <div className="h-10 bg-neutral-100 rounded-xl w-28 shrink-0" />
        {Array.from({ length: colCount }).map((_, i) => (
          <div key={i} className="h-10 bg-neutral-100 rounded-xl w-22.5 shrink-0" />
        ))}
      </div>

      {/* Fake Rows */}
      {Array.from({ length: rowCount }).map((_, rIdx) => (
        <div key={rIdx} className="flex gap-2 items-center">
          <div className="h-12 bg-neutral-100 rounded-xl w-60 shrink-0 flex items-center px-4">
            <div className="h-4 bg-neutral-200 rounded-md w-32" />
          </div>
          <div className="h-12 bg-neutral-50 rounded-xl w-28 shrink-0 flex items-center justify-center">
            <div className="h-4 bg-neutral-200 rounded-md w-12" />
          </div>
          {Array.from({ length: colCount }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="h-12 bg-neutral-50 rounded-xl w-22.5 shrink-0 flex flex-col items-center justify-center gap-1"
            >
              <div className="h-3 bg-neutral-200 rounded-md w-8" />
              <div className="h-2 bg-neutral-100 rounded-md w-10" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
