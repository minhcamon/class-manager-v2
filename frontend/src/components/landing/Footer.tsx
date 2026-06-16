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
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@classmanager.vn</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
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
    </footer>
  );
}
