/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, PlusCircle, Loader2 } from "lucide-react";
import { useNavigate, Navigate } from "react-router";
import classService from "@/services/classService";
import type { Class } from "@/types/class";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeClass, setActiveClass] = useState<Class | null>(() => {
    try {
      const cached = sessionStorage.getItem("active_class");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(() => {
    return !sessionStorage.getItem("active_class_fetched");
  });

  const fetchClass = useCallback(async () => {
    const hasFetched = sessionStorage.getItem("active_class_fetched");
    if (!hasFetched) {
      setIsLoading(true);
    }
    try {
      const cls = await classService.getActiveClass();
      setActiveClass(cls);
      sessionStorage.setItem("active_class_fetched", "true");
    } catch (error) {
      console.error("Failed to fetch active class:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClass();
  }, [fetchClass]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-sans">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-neutral-500 font-medium animate-pulse">
          Đang tải dữ liệu lớp học...
        </p>
      </div>
    );
  }

  // If teacher has an active class, redirect straight to class overview
  if (activeClass) {
    return <Navigate to={`/teacher/classes/${activeClass.id}`} replace />;
  }

  // No active class — show "create class" prompt
  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-border p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Xin chào, Thầy/Cô {user?.fullName?.split(" ").pop()}!
          </h1>
          <p className="text-neutral-500 text-base mt-2">
            Bạn chưa thiết lập lớp học nào. Hãy tạo một lớp học để bắt đầu quản lý thi đua.
          </p>
        </div>

        <button
          onClick={() => navigate("/teacher/classes/create")}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-md shadow-primary/20 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          Tạo lớp mới
        </button>
      </div>

      {/* Empty state */}
      <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-2xl p-16 text-center">
        <div className="w-16 h-16 bg-white border border-border rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <BookOpen className="w-8 h-8 text-neutral-300" />
        </div>
        <p className="text-base font-semibold text-neutral-600">
          Không có lớp học nào đang hoạt động
        </p>
        <p className="text-sm text-neutral-400 mt-2 max-w-xs mx-auto">
          Tạo lớp học đầu tiên để bắt đầu quản lý thi đua và theo dõi học sinh.
        </p>
      </div>
    </div>
  );
}
