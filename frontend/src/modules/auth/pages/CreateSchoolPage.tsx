import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";

export default function CreateSchoolPage() {
  const { createSchool } = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !address.trim()) {
      toast.error("Vui lòng nhập đầy đủ tên trường học và địa chỉ!");
      return;
    }
    if (name.trim().length > 255) {
      toast.error("Tên trường học không được vượt quá 255 ký tự!");
      return;
    }
    if (address.trim().length > 500) {
      toast.error("Địa chỉ trường học không được vượt quá 500 ký tự!");
      return;
    }

    setIsLoading(true);
    try {
      await createSchool(name.trim(), address.trim());
      toast.success("Tạo trường học thành công!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Tạo trường học thất bại. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F8] flex items-center justify-center p-4 font-sans text-left">
      <div className="w-full max-w-[480px] bg-white border border-[#EAEAEA] rounded-2xl shadow-sm p-8 flex flex-col gap-6">
        
        {/* Header Block */}
        <div className="flex flex-col gap-2 text-center max-w-[380px] mx-auto">
          <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">
            Thiết lập Trường Học của bạn
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Với vai trò Giáo viên, bạn cần liên kết tài khoản với một trường học cụ thể để quản lý các lớp học.
          </p>
        </div>

        {/* Create School Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="school-name" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
              Tên trường học
            </label>
            <input
              id="school-name"
              type="text"
              placeholder="Nhập tên trường học đầy đủ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 bg-white border border-[#EAEAEA] rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 outline-none transition-all disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="school-address" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
              Địa chỉ trường
            </label>
            <textarea
              id="school-address"
              rows={3}
              placeholder="Nhập địa chỉ của trường học"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 bg-white border border-[#EAEAEA] rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 outline-none transition-all disabled:opacity-50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {isLoading ? "Đang tạo..." : "Tạo Trường Học & Bắt Đầu"}
          </button>
        </form>

      </div>
    </div>
  );
}
