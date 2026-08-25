import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Award, ArrowLeft, Layers } from "lucide-react";
import classService from "@/services/classService";
import type { Class } from "@/types/class";
import MatrixPointBoardTab from "../components/matrix/MatrixPointBoardTab";

export default function TeacherMatrixPointBoardPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<Class | null>(null);

  useEffect(() => {
    if (!classId) return;
    classService.getClassById(parseInt(classId))
      .then(setClassData)
      .catch((err) => console.error("Failed to load class info", err));
  }, [classId]);

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col space-y-3">
      {/* ── Compact Top Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/teacher/classes/${classId}`)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Quay lại tổng quan lớp"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Bảng điểm thi đua
              </h1>
              <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {classData?.className || "Lớp học"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi và quản lý điểm số tuần & điểm tích lũy theo tổ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/teacher/classes/${classId}/daily-canvas`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            Chấm điểm thi đua
          </button>
        </div>
      </div>

      {/* ── Integrated Matrix Board Viewport ─────────────────────────── */}
      {classId && (
        <MatrixPointBoardTab classId={classId} canEdit={true} />
      )}
    </div>
  );
}
