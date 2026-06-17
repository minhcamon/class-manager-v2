import { MailOpen, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 py-16 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 mb-12 text-left">
          {/* Col 1: About */}
          <div className="flex flex-col gap-4">
            <a href="#hero" className="text-white text-xl font-bold no-underline flex items-center gap-2">
              <span className="w-8 h-8 bg-primary rounded-[6px] flex items-center justify-center text-white font-extrabold text-lg">C</span>
              ClassManager
            </a>
            <p className="text-sm leading-relaxed">
              Hệ thống quản lý lớp học chủ nhiệm thông minh giúp tối ưu hóa thời gian cho giáo viên chủ nhiệm và nâng cao tinh thần tự quản của học sinh.
            </p>
          </div>

          {/* Col 2: Features */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Tính năng</h4>
            <ul className="list-none flex flex-col gap-3">
              <li><a href="#features" className="text-neutral-400 no-underline text-sm hover:text-white transition-colors duration-150">Chấm điểm thi đua</a></li>
              <li><a href="#features" className="text-neutral-400 no-underline text-sm hover:text-white transition-colors duration-150">Báo cáo tuần tự động</a></li>
              <li><a href="#features" className="text-neutral-400 no-underline text-sm hover:text-white transition-colors duration-150">Phiếu lý lịch động</a></li>
              <li><a href="#features" className="text-neutral-400 no-underline text-sm hover:text-white transition-colors duration-150">Audit Log minh bạch</a></li>
            </ul>
          </div>

          {/* Col 3: Who is it for */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Đối tượng</h4>
            <ul className="list-none flex flex-col gap-3">
              <li><a href="#who-is-it-for" className="text-neutral-400 no-underline text-sm hover:text-white transition-colors duration-150">Giáo viên chủ nhiệm</a></li>
              <li><a href="#who-is-it-for" className="text-neutral-400 no-underline text-sm hover:text-white transition-colors duration-150">Tổ trưởng thi đua</a></li>
              <li><a href="#who-is-it-for" className="text-neutral-400 no-underline text-sm hover:text-white transition-colors duration-150">Học sinh lớp học</a></li>
              <li><a href="#who-is-it-for" className="text-neutral-400 no-underline text-sm hover:text-white transition-colors duration-150">Ban giám hiệu nhà trường</a></li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Liên hệ</h4>
            <ul className="list-none flex flex-col gap-4">
              <li className="flex items-center gap-2.5 text-sm">
                <MailOpen className="text-primary w-4 h-4" />
                <span>support@classmanager.vn</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Phone className="text-primary w-4 h-4" />
                <span>0987-654-321 (Zalo)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-neutral-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
          <p>&copy; {new Date().getFullYear()} ClassManager. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-6">
            <a href="#" className="text-neutral-400 no-underline hover:text-white transition-colors duration-150">Điều khoản dịch vụ</a>
            <a href="#" className="text-neutral-400 no-underline hover:text-white transition-colors duration-150">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer >
  );
}
