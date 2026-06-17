import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi đăng xuất!");
    }
  };

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
                {user?.role === "TEACHER" ? "Giáo Viên" : user?.role === "STUDENT" ? "Học Sinh" : "Không xác định"}
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

        {/* Action Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-semibold rounded-lg transition-all active:scale-[0.98] cursor-pointer text-center"
        >
          Đăng Xuất
        </button>

      </div>
    </div>
  );
}
