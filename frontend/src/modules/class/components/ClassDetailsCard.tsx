import { GraduationCap, Award, Building, Calendar } from "lucide-react";
import type { Class } from "@/types/class";

interface ClassDetailsCardProps {
  classData: Class;
}

export default function ClassDetailsCard({ classData }: ClassDetailsCardProps) {
  return (
    <div className="md:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-light text-success-text border border-success/15 uppercase tracking-wide">
              Đang hoạt động
            </span>
            <h2 className="text-4xl font-extrabold text-neutral-900 tracking-tight mt-2.5">
              Lớp {classData.className}
            </h2>
          </div>

          <div className="p-3 bg-primary-light rounded-xl border border-primary-border/40 shrink-0">
            <GraduationCap className="text-primary w-8 h-8" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-t border-border/60 pt-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 rounded-lg text-neutral-500">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Khối lớp</p>
              <p className="text-sm font-semibold text-neutral-900">Khối {classData.grade}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 rounded-lg text-neutral-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Điểm mặc định tuần</p>
              <p className="text-sm font-semibold text-neutral-900">{classData.basePoint} điểm</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 rounded-lg text-neutral-500">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Trường học</p>
              <p className="text-sm font-semibold text-neutral-900 truncate max-w-[200px]" title={classData.schoolName}>
                {classData.schoolName || "Chưa kết nối"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 rounded-lg text-neutral-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Ngày tạo</p>
              <p className="text-sm font-semibold text-neutral-900">
                {new Date(classData.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
