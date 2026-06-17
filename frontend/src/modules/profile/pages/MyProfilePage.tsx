import { 
  User, 
  Save, 
  ShieldCheck, 
  Info
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function MyProfilePage() {
  return (
    <div className="space-y-8 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
          <User className="text-primary w-8 h-8" />
          Hồ sơ của tôi
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Cung cấp và cập nhật thông tin cá nhân của bạn cho giáo viên chủ nhiệm.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-primary-light/20 border border-primary-border/20 rounded-2xl p-4 flex items-start gap-4">
        <div className="p-2 bg-white rounded-lg text-primary shadow-sm shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-primary">Thông tin của bạn được bảo mật</p>
          <p className="text-xs text-primary/70 leading-relaxed">
            Chỉ giáo viên chủ nhiệm mới có quyền xem các thông tin chi tiết trong hồ sơ này của bạn.
          </p>
        </div>
      </div>

      {/* Profile Form (Placeholder) */}
      <div className="bg-white rounded-2xl border border-border p-8 shadow-sm space-y-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Họ và tên</label>
              <input 
                type="text" 
                readOnly
                className="w-full px-4 py-3 bg-neutral-50 border border-border rounded-xl text-neutral-900 font-bold focus:outline-none"
                value="Nguyễn Văn A" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Email</label>
              <input 
                type="email" 
                readOnly
                className="w-full px-4 py-3 bg-neutral-50 border border-border rounded-xl text-neutral-900 font-bold focus:outline-none"
                value="student@gmail.com" 
              />
            </div>
          </div>

          {/* Dynamic fields empty state placeholder */}
          <div className="py-12 border-t border-dashed border-border mt-8 text-center space-y-4">
            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-2">
              <Info className="w-6 h-6 text-neutral-300" />
            </div>
            <p className="text-neutral-500 font-medium text-sm">Chưa có thông tin bổ sung</p>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              Giáo viên chưa kích hoạt mẫu hồ sơ thu thập thông tin cho lớp học này.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex justify-end">
          <Button disabled className="flex items-center gap-2 opacity-50 cursor-not-allowed">
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}
