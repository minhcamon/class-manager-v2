/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import classService from "@/services/classService";
import type { Class } from "@/types/class";
import { ClassManagementContent } from "@/modules/class";
import { FormManagementPage } from "@/modules/form";
import {
  Home as HomeIcon,
  BookOpen,
  FileText,
  PlusCircle,
  GraduationCap,
  Building,
  Loader2,
  Award
} from "lucide-react";

import LogoutButton from "@/components/ui/LogoutButton";
import Logo from "@/components/common/Logo";
import { AiChatbotWidget } from "@/components/ai/AiChatbotWidget";



export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeClass, setActiveClass] = useState<Class | null>(null);
  const [isLoadingClass, setIsLoadingClass] = useState<boolean>(user?.role === "TEACHER");
  const [activeTab, setActiveTab] = useState<string>("home");

  const fetchActiveClass = useCallback(async () => {
    if (user?.role !== "TEACHER") return;
    setIsLoadingClass(true);
    try {
      const cls = await classService.getActiveClass();
      setActiveClass(cls);
    } catch (err) {
      console.error("Failed to fetch active class:", err);
    } finally {
      setIsLoadingClass(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActiveClass();
  }, [fetchActiveClass]);

  if (isLoadingClass) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-sm text-neutral-500 font-medium animate-pulse">
          Đang tải thông tin lớp học...
        </p>
      </div>
    );
  }

  // TEACHER FLOW
  if (user?.role === "TEACHER") {
    // 1. Teacher has NO active class
    if (!activeClass) {
      return (
        <div className="min-h-screen bg-card flex items-center justify-center p-4 font-sans text-left">
          <div className="w-full max-w-[520px] bg-background border border-border rounded-2xl shadow-sm p-10 flex flex-col gap-8 text-center animate-fade-in">
            <div className="flex flex-col gap-3 items-center">
              <div className="w-20 h-20 bg-zinc-50 text-zinc-950 rounded-full flex items-center justify-center mb-2 border border-border">
                <BookOpen className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
                Tạo lớp học đầu tiên
              </h2>
              <p className="text-base text-zinc-500 max-w-[360px] leading-relaxed mx-auto">
                Chào mừng Thầy/Cô <strong>{user.fullName}</strong>. Để bắt đầu quản lý học sinh và thi đua, bước tiếp theo là thiết lập lớp học của mình.
              </p>
            </div>

            <div className="bg-zinc-50 border border-border rounded-xl p-5 flex items-center justify-center gap-3">
              <Building className="w-5 h-5 text-zinc-400" />
              <span className="text-sm font-bold text-zinc-600">
                {user.schoolName}
              </span>
            </div>

            <button
              onClick={() => navigate("/class/create")}
              className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white text-base font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-zinc-200"
            >
              <PlusCircle className="w-6 h-6" />
              Bắt đầu tạo lớp học
            </button>

            <LogoutButton className="text-sm text-zinc-400 hover:text-red-600 font-medium transition-colors mx-auto" />
          </div>
        </div>
      );
    }

    // 2. Teacher HAS an active class (Main Dashboard Layout)
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-left">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-border flex flex-col justify-between shrink-0 h-screen sticky top-0">
          <div className="p-6 space-y-8">
            {/* Logo */}
            <Logo as="div" />

            {/* Nav Menu */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("home")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${activeTab === "home"
                  ? "bg-primary-light text-primary"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
              >
                <HomeIcon className="w-[18px] h-[18px]" />
                Trang chủ
              </button>

              <button
                onClick={() => setActiveTab("class")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${activeTab === "class"
                  ? "bg-primary-light text-primary"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
              >
                <BookOpen className="w-[18px] h-[18px]" />
                Quản lý lớp
              </button>

              <button
                onClick={() => setActiveTab("forms")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer ${activeTab === "forms"
                  ? "bg-primary-light text-primary"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
              >
                <FileText className="w-[18px] h-[18px]" />
                Thiết lập mẫu sơ yếu
              </button>
            </nav>
          </div>

          {/* User Profile Footer & Logout */}
          <div className="p-4 border-t border-border space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm border border-primary-border/20 shrink-0">
                {user.fullName ? user.fullName.split(" ").pop()?.substring(0, 2).toUpperCase() : "GV"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-900 truncate" title={user.fullName}>
                  {user.fullName}
                </p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Giáo Viên
                </p>
              </div>
            </div>

            <LogoutButton
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-danger-text bg-danger-light/20 hover:bg-danger-light/50 rounded-xl transition-all cursor-pointer"
              iconSize={18}
              redirectPath="/"
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto p-8 lg:p-10">
          {activeTab === "home" && (
            <div className="space-y-8 animate-fade-in">
              {/* Welcome Banner */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                    Xin chào, Thầy/Cô {user.fullName.split(" ").pop()}!
                  </h1>
                  <p className="text-neutral-500 text-sm mt-1">
                    Hôm nay là một ngày tuyệt vời để đồng hành cùng học sinh của lớp <strong>{activeClass.className}</strong>.
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary border border-primary-border/30">
                    Khối {activeClass.grade}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-light text-success-text border border-success/15">
                    {activeClass.className}
                  </span>
                </div>
              </div>

              {/* Grid Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* School Card */}
                <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Trường học</p>
                      <h3 className="text-lg font-bold text-neutral-900 mt-1 truncate max-w-[180px]" title={activeClass.schoolName || user.schoolName || "Chưa kết nối"}>
                        {activeClass.schoolName || user.schoolName || "Chưa kết nối"}
                      </h3>
                    </div>
                    <div className="p-2 bg-primary-light rounded-lg text-primary">
                      <Building className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 mt-4">Trường chủ quản tài khoản</p>
                </div>

                {/* Class Info Card */}
                <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Tên lớp & Niên khóa</p>
                      <h3 className="text-lg font-bold text-neutral-900 mt-1">
                        Lớp {activeClass.className} (Khối {activeClass.grade})
                      </h3>
                    </div>
                    <div className="p-2 bg-success-light rounded-lg text-success-text">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 mt-4">Niên khóa đang hoạt động</p>
                </div>

                {/* Base Points Card */}
                <div className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Điểm mặc định tuần</p>
                      <h3 className="text-lg font-bold text-neutral-900 mt-1">
                        {activeClass.basePoint} điểm
                      </h3>
                    </div>
                    <div className="p-2 bg-warning-light rounded-lg text-warning-text">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 mt-4">Điểm khởi điểm thi đua</p>
                </div>
              </div>

              {/* Profile Details Block */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-neutral-900 border-b border-border pb-3 text-lg">
                  Thông Tin Tài Khoản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between md:justify-start gap-4">
                    <span className="text-neutral-400 w-32 shrink-0">Họ & tên:</span>
                    <span className="text-neutral-900 font-semibold">{user.fullName}</span>
                  </div>
                  <div className="flex justify-between md:justify-start gap-4">
                    <span className="text-neutral-400 w-32 shrink-0">Địa chỉ email:</span>
                    <span className="text-neutral-900 font-semibold">{user.email || "Chưa thiết lập"}</span>
                  </div>
                  <div className="flex justify-between md:justify-start gap-4">
                    <span className="text-neutral-400 w-32 shrink-0">Số điện thoại:</span>
                    <span className="text-neutral-900 font-semibold">{user.phoneNumber || "Chưa thiết lập"}</span>
                  </div>
                  <div className="flex justify-between md:justify-start gap-4">
                    <span className="text-neutral-400 w-32 shrink-0">Tài khoản đăng nhập:</span>
                    <span className="text-neutral-900 font-semibold">{user.username}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "class" && (
            <ClassManagementContent
              classData={activeClass}
              onClassEnded={() => setActiveClass(null)}
            />
          )}

          {activeTab === "forms" && (
            <FormManagementPage classId={activeClass.id} />
          )}

          {/* AI Assistant Floating Widget */}
          <AiChatbotWidget
            classId={activeClass.id}
            weekStartDate={new Date().toISOString().split("T")[0]}
          />
        </main>
      </div>
    );
  }

  // STUDENT FLOW (Existing view)
  return (
    <div className="min-h-screen bg-[#F9F9F8] flex items-center justify-center p-4 font-sans text-left">
      <div className="w-full max-w-[520px] bg-white border border-[#EAEAEA] rounded-2xl shadow-sm p-8 flex flex-col gap-6">

        {/* Title Block */}
        <div className="flex flex-col gap-1 text-center">
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest w-fit mx-auto border border-emerald-100">
            Onboarding Hoàn Tất
          </span>
          <h2 className="text-2xl font-bold text-zinc-950 tracking-tight mt-3">
            Bảng Điều Khiển
          </h2>
          <p className="text-xs text-zinc-500">
            Chào mừng đến với hệ thống ClassManager của bạn!
          </p>
        </div>

        {/* Profile Card details */}
        <div className="bg-[#F9F9F8] border border-[#EAEAEA] rounded-xl p-5 flex flex-col gap-3.5">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Thông tin tài khoản
            </h3>
            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-8 h-8 rounded-full border border-[#EAEAEA] object-cover"
              />
            )}
          </div>

          <div className="grid grid-cols-3 text-sm">
            <span className="text-zinc-400 font-medium col-span-1">Họ & tên:</span>
            <span className="text-zinc-900 font-semibold col-span-2">{user?.fullName}</span>
          </div>

          <div className="grid grid-cols-3 text-sm">
            <span className="text-zinc-400 font-medium col-span-1">Tài khoản:</span>
            <span className="text-zinc-900 font-semibold col-span-2">
              {user?.email ?? user?.username}
            </span>
          </div>

          <div className="grid grid-cols-3 text-sm">
            <span className="text-zinc-400 font-medium col-span-1">Vai trò:</span>
            <span className="text-zinc-900 font-semibold col-span-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-zinc-200 text-zinc-800">
                Học Sinh
              </span>
            </span>
          </div>

          <div className="grid grid-cols-3 text-sm">
            <span className="text-zinc-400 font-medium col-span-1">Trường học:</span>
            <span className="text-zinc-900 font-semibold col-span-2">
              {user?.schoolName ? (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#E1F3FE] text-[#1F6C9F]">
                  {user?.schoolName}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700">
                  Chưa kết nối
                </span>
              )}
            </span>
          </div>

        </div>

        <LogoutButton
          className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-semibold rounded-lg transition-all active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-2"
          iconSize={16}
          redirectPath="/"
        >
          Đăng xuất
        </LogoutButton>

      </div>
    </div>
  );
}
