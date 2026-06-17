import EyeToggle from "../../../components/ui/EyeToggle";
import { useRegisterForm } from "../hooks/useRegisterForm";

interface RegisterFormProps {
  redirectTo: string;
}

export default function RegisterForm({ redirectTo }: RegisterFormProps) {
  const {
    username,
    setUsername,
    phone,
    setPhone,
    fullName,
    setFullName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    togglePasswordVisibility,
    showConfirmPassword,
    toggleConfirmPasswordVisibility,
    isLoading,
    handleSubmit,
  } = useRegisterForm(redirectTo);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-fullname" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
          Họ và tên
        </label>
        <input
          id="reg-fullname"
          type="text"
          placeholder="Nhập họ và tên đầy đủ"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
          className="w-full px-3.5 py-2.5 bg-white border border-[#EAEAEA] rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 outline-none transition-all disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-username" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
          Tên đăng nhập
        </label>
        <input
          id="reg-username"
          type="text"
          placeholder="Độ dài từ 4 - 50 ký tự"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          className="w-full px-3.5 py-2.5 bg-white border border-[#EAEAEA] rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 outline-none transition-all disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-phone" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
          Số điện thoại
        </label>
        <input
          id="reg-phone"
          type="text"
          placeholder="Nhập số điện thoại liên hệ"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isLoading}
          className="w-full px-3.5 py-2.5 bg-white border border-[#EAEAEA] rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 outline-none transition-all disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            placeholder="Tối thiểu 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 pr-10 bg-white border border-[#EAEAEA] rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 outline-none transition-all disabled:opacity-50"
          />
          <EyeToggle visible={showPassword} onToggle={togglePasswordVisibility} disabled={isLoading} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-confirmpass" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
          Nhập lại mật khẩu
        </label>
        <div className="relative">
          <input
            id="reg-confirmpass"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu phía trên"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 pr-10 bg-white border border-[#EAEAEA] rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 outline-none transition-all disabled:opacity-50"
          />
          <EyeToggle visible={showConfirmPassword} onToggle={toggleConfirmPasswordVisibility} disabled={isLoading} />
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
        {isLoading ? "Đang xử lý..." : "Đăng Ký Tài Khoản"}
      </button>
    </form>
  );
}
