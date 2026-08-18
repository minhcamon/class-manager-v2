import React, { useState } from 'react';
import {
  School,
  Users,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Calendar,
  CheckCircle,
  Clock,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import type { AdminClassSummary, AdminSchoolSummary } from '@/types/admin';

interface SchoolsSummaryTableProps {
  schools: AdminSchoolSummary[];
  loading: boolean;
}

export const SchoolsSummaryTable: React.FC<SchoolsSummaryTableProps> = ({
  schools,
  loading,
}) => {
  const [expandedSchoolId, setExpandedSchoolId] = useState<number | null>(null);
  const [classesCache, setClassesCache] = useState<Record<number, AdminClassSummary[]>>({});
  const [loadingSchoolId, setLoadingSchoolId] = useState<number | null>(null);

  const handleToggleExpand = async (school: AdminSchoolSummary) => {
    if (expandedSchoolId === school.id) {
      setExpandedSchoolId(null);
      return;
    }

    setExpandedSchoolId(school.id);

    // If classes already cached, no need to refetch
    if (classesCache[school.id]) {
      return;
    }

    setLoadingSchoolId(school.id);
    try {
      const data = await adminService.getClassesBySchool(school.id);
      setClassesCache((prev) => ({ ...prev, [school.id]: data }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách lớp học của trường';
      toast.error(msg);
    } finally {
      setLoadingSchoolId(null);
    }
  };

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50/80 border-b border-border text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3.5 px-5">Trường học</th>
              <th className="py-3.5 px-4">Địa chỉ</th>
              <th className="py-3.5 px-4 text-center">Giáo viên</th>
              <th className="py-3.5 px-4 text-center">Lớp học</th>
              <th className="py-3.5 px-4">Ngày tạo</th>
              <th className="py-3.5 px-5 text-right">Danh sách lớp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span>Đang tải danh sách trường học...</span>
                  </div>
                </td>
              </tr>
            ) : schools.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400">
                  Chưa có trường học nào trong hệ thống.
                </td>
              </tr>
            ) : (
              schools.map((s) => {
                const isExpanded = expandedSchoolId === s.id;
                const isLoadingClasses = loadingSchoolId === s.id;
                const schoolClasses = classesCache[s.id] || [];

                return (
                  <React.Fragment key={s.id}>
                    <tr
                      className={`transition cursor-pointer ${
                        isExpanded ? 'bg-primary-light/15' : 'hover:bg-neutral-50/70'
                      }`}
                      onClick={() => handleToggleExpand(s)}
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary-border/20">
                            <School className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-neutral-900 hover:text-primary transition">
                              {s.name}
                            </span>
                            <p className="text-[10px] text-neutral-400">Mã trường: SCH-{s.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-neutral-600 max-w-60 truncate">
                        {s.address || 'Chưa cập nhật địa chỉ'}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-light border border-primary-border text-primary font-bold text-[11px]">
                          <Users className="w-3 h-3" />
                          {s.teacherCount} GV
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]">
                          <BookOpen className="w-3 h-3" />
                          {s.classCount} Lớp
                        </span>
                      </td>

                      <td className="py-4 px-4 text-neutral-500 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{new Date(s.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleExpand(s);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer ${
                            isExpanded
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900'
                          }`}
                        >
                          <span>{isExpanded ? 'Thu gọn' : `Xem ${s.classCount} lớp`}</span>
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Inline Expandable Row */}
                    {isExpanded && (
                      <tr className="bg-neutral-50/70">
                        <td colSpan={6} className="p-4 sm:p-6 border-y border-neutral-200/80">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                                <GraduationCap className="w-4 h-4 text-primary" />
                                <span>Danh sách Lớp học thuộc {s.name} ({s.classCount} lớp)</span>
                              </div>
                              <span className="text-[11px] text-neutral-400">
                                Dữ liệu tóm tắt toàn hệ thống
                              </span>
                            </div>

                            {isLoadingClasses ? (
                              <div className="py-8 text-center text-neutral-400 bg-white rounded-xl border border-border">
                                <div className="inline-flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                  <span>Đang tải các lớp học của trường...</span>
                                </div>
                              </div>
                            ) : schoolClasses.length === 0 ? (
                              <div className="py-8 text-center text-neutral-400 bg-white rounded-xl border border-border">
                                Chưa có lớp học nào được khởi tạo trong trường này.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {schoolClasses.map((cls) => (
                                  <div
                                    key={cls.id}
                                    className="p-4 bg-white border border-border rounded-xl space-y-2.5 shadow-2xs hover:border-primary/40 transition"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-neutral-900 text-xs">
                                        Lớp {cls.className} (Khối {cls.grade})
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border ${
                                          cls.status === 'ACTIVE'
                                            ? 'bg-success-light text-success-text border-emerald-200'
                                            : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                                        }`}
                                      >
                                        {cls.status === 'ACTIVE' ? (
                                          <CheckCircle className="w-3 h-3" />
                                        ) : (
                                          <Clock className="w-3 h-3" />
                                        )}
                                        {cls.status}
                                      </span>
                                    </div>

                                    <div className="text-[11px] text-neutral-500 space-y-1">
                                      <p className="truncate">
                                        GVCN:{' '}
                                        <strong className="text-neutral-800">
                                          {cls.teacherName || 'Chưa phân công'}
                                        </strong>
                                      </p>
                                      <p>
                                        Mã lớp:{' '}
                                        <code className="bg-neutral-50 border border-border px-1.5 py-0.5 rounded text-primary font-bold">
                                          {cls.classCode}
                                        </code>
                                      </p>
                                    </div>

                                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                                      <span className="text-neutral-500">Sĩ số:</span>
                                      <span className="font-bold text-primary flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {cls.studentCount} HS
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchoolsSummaryTable;
