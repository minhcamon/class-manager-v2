import { 
  FileText, 
  Plus, 
  Save, 
  Type, 
  AlignLeft, 
  Hash, 
  Calendar as CalendarIcon, 
  Mail, 
  Phone, 
  ChevronDown, 
  CircleDot, 
  CheckSquare
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function ProfileTemplateBuilder() {
  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
            <FileText className="text-primary w-8 h-8" />
            Mẫu Sơ yếu Lý lịch
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Thiết kế các trường thông tin bạn muốn học sinh cung cấp khi tham gia lớp.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            Xem trước
          </Button>
          <Button className="flex items-center gap-2 shadow-lg shadow-primary/20">
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* Form Area (Placeholder) */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm space-y-4">
          <input 
            type="text" 
            placeholder="Tên mẫu hồ sơ (Ví dụ: Sơ yếu lý lịch đầu năm)" 
            className="text-2xl font-bold text-neutral-900 w-full border-none focus:ring-0 p-0 placeholder:text-neutral-300"
          />
          <textarea 
            placeholder="Mô tả ngắn về mục đích thu thập thông tin..." 
            className="text-neutral-500 w-full border-none focus:ring-0 p-0 resize-none h-10 placeholder:text-neutral-200"
          />
        </div>

        {/* Empty state builder */}
        <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl bg-neutral-50/30">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-border">
            <Plus className="w-8 h-8 text-neutral-300" />
          </div>
          <h3 className="font-bold text-neutral-900 text-lg">Chưa có câu hỏi nào</h3>
          <p className="text-neutral-400 text-sm mt-1 max-w-xs mx-auto">
            Bắt đầu xây dựng mẫu hồ sơ bằng cách thêm các trường thông tin từ danh sách bên dưới.
          </p>
        </div>

        {/* Question Types Toolbar */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Thêm trường thông tin</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { label: "Văn bản ngắn", icon: Type },
              { label: "Đoạn văn", icon: AlignLeft },
              { label: "Số", icon: Hash },
              { label: "Ngày", icon: CalendarIcon },
              { label: "Email", icon: Mail },
              { label: "Điện thoại", icon: Phone },
              { label: "Lựa chọn", icon: ChevronDown },
              { label: "Trắc nghiệm", icon: CircleDot },
              { label: "Hộp kiểm", icon: CheckSquare },
            ].map((type) => (
              <button 
                key={type.label}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary-light/10 transition-all group"
              >
                <type.icon className="w-5 h-5 text-neutral-400 group-hover:text-primary" />
                <span className="text-[10px] font-bold text-neutral-500 group-hover:text-neutral-700">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
