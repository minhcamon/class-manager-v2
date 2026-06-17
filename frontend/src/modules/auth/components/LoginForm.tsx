import { useEffect } from "react";
import { useNavigate } from "react-router";
import EyeToggle from "../../../components/ui/EyeToggle";
import { useLoginForm } from "../hooks/useLoginForm";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";

interface LoginFormProps {
  redirectTo: string;
  onLoadingChange?: (loading: boolean) => void;
}

export default function LoginForm({ redirectTo, onLoadingChange }: LoginFormProps) {
  const navigate = useNavigate();
  const {
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    togglePasswordVisibility,
    isLoading,
    handleSubmit,
  } = useLoginForm(redirectTo);

  const { loginWithGoogle } = useAuth();

  // Initialize and render Google Sign-In button
  useEffect(() => {
    const initGoogleGSI = () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              await loginWithGoogle(response.credential);
              
              toast.success("Đăng nhập Google thành công!");
              navigate(redirectTo, { replace: true });
            } catch (err) {
              console.error(err);
              toast.error(err instanceof Error ? err.message : "Đăng nhập Google thất bại!");
            }
          },
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-login-btn"),
          {
            theme: "outline",
            size: "large",
            width: 376, // Match form inputs width (440 max-width minus 64 padding)
            text: "signin_with",
            shape: "rectangular",
          }
        );
      }
    };

    // Attempt immediately
    initGoogleGSI();

    // In case script loads slightly after component mounts
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        initGoogleGSI();
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [loginWithGoogle, navigate, redirectTo]);

  // Sync loading state with parent if needed
  if (onLoadingChange) {
    // We don't call this in render — parent uses this for tab-switching guard
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-username" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
          Tên đăng nhập
        </label>
        <input
          id="login-username"
          type="text"
          placeholder="Nhập tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          className="w-full px-3.5 py-2.5 bg-white border border-[#EAEAEA] rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 outline-none transition-all disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-password" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 pr-10 bg-white border border-[#EAEAEA] rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 outline-none transition-all disabled:opacity-50"
          />
          <EyeToggle visible={showPassword} onToggle={togglePasswordVisibility} disabled={isLoading} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 mt-2 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer"
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : null}
        {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
      </button>

      {/* Divider */}
      <div className="relative flex py-2 items-center">
        <div className="grow border-t border-[#EAEAEA]"></div>
        <span className="shrink mx-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Hoặc</span>
        <div className="grow border-t border-[#EAEAEA]"></div>
      </div>

      {/* Google Login Button Container */}
      <div id="google-login-btn" className="w-full flex justify-center min-h-[44px]"></div>
    </form>
  );
}
