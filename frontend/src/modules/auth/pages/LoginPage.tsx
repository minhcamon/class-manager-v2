import { Link } from "react-router";
import LoginForm from "../components/LoginForm";
import Logo from "@/components/common/Logo";

interface LoginPageProps {
  redirectTo: string;
}

export default function LoginPage({ redirectTo }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-[#F9F9F8] flex items-center justify-center p-4 font-sans text-left">
      <div className="w-full max-w-[440px] bg-white border border-[#EAEAEA] rounded-2xl shadow-sm p-8 flex flex-col gap-6">
        
        {/* Back to Home */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors w-fit -mt-2 -ml-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Trở về trang chủ
        </Link>

        {/* Title Block */}
        <div className="flex flex-col gap-1.5 text-center">
          <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">
            Chào mừng bạn đến với
          </h2>
          <Logo variant="text-only" as="div" />
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#EAEAEA]">
          <button
            type="button"
            className="flex-1 pb-3 text-sm font-semibold transition-all border-b-2 text-center cursor-default border-zinc-950 text-zinc-950"
          >
            Đăng Nhập
          </button>
          <Link
            to="/register"
            className="flex-1 pb-3 text-sm font-semibold transition-all border-b-2 text-center cursor-pointer border-transparent text-zinc-400 hover:text-zinc-600"
          >
            Đăng Ký
          </Link>
        </div>

        {/* Login Form */}
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
