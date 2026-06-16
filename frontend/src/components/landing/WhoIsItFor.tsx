export default function WhoIsItFor() {
  return (
    <section className="py-24 bg-background border-b border-neutral-200" id="who-is-it-for">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 text-center mb-4">
          Dành Cho Ai?
        </h2>
        <p className="text-lg text-neutral-500 text-center max-w-2xl mx-auto mb-16">
          ClassManager kết nối và tối ưu hóa quy trình làm việc giữa các đối tượng nòng cốt của lớp học.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Giáo viên chủ nhiệm */}
          <div className="bg-white border border-neutral-200 rounded-xl p-8 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md hover:border-primary-border flex flex-col gap-4">
            <div className="w-14 h-14 rounded-lg bg-primary-light text-primary flex items-center justify-center">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-4-9 4 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Giáo Viên Chủ Nhiệm</h3>
            <p className="text-[0.95rem] text-neutral-600 leading-relaxed">
              Đóng vai trò quản trị viên tối cao của lớp học. Giáo viên thiết lập luật thi đua, duyệt hồ sơ học sinh mới, phân tổ và giám sát toàn bộ hoạt động của lớp.
            </p>
            <ul className="list-none flex flex-col gap-2 mt-auto text-[0.9rem]">
              <li className="flex items-center gap-2 text-neutral-700">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                <span>Tạo lớp và thiết lập điểm chuẩn</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-700">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                <span>Cấu hình phiếu thông tin lý lịch</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-700">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                <span>Chốt điểm tuần tự động hoặc thủ công</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Tổ trưởng & Học sinh */}
          <div className="bg-white border border-neutral-200 rounded-xl p-8 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md hover:border-primary-border flex flex-col gap-4">
            <div className="w-14 h-14 rounded-lg bg-primary-light text-primary flex items-center justify-center">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 025.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Tổ Trưởng & Học Sinh</h3>
            <p className="text-[0.95rem] text-neutral-600 leading-relaxed">
              Tổ trưởng hỗ trợ giáo viên chủ nhiệm trực tiếp chấm điểm cho thành viên trong tổ. Học sinh theo dõi trực quan kết quả thi đua cá nhân và cập nhật lý lịch trực tuyến.
            </p>
            <ul className="list-none flex flex-col gap-2 mt-auto text-[0.9rem]">
              <li className="flex items-center gap-2 text-neutral-700">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                <span>Tổ trưởng chấm điểm thi đua tổ</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-700">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                <span>Theo dõi bảng xếp hạng cá nhân, tổ</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-700">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                <span>Điền lý lịch trực tuyến nhanh chóng</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Ban giám hiệu */}
          <div className="bg-white border border-neutral-200 rounded-xl p-8 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-md hover:border-primary-border flex flex-col gap-4">
            <div className="w-14 h-14 rounded-lg bg-primary-light text-primary flex items-center justify-center">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Ban Giám Hiệu</h3>
            <p className="text-[0.95rem] text-neutral-600 leading-relaxed">
              Giúp Ban giám hiệu và Admin trường nắm bắt tình hình thi đua, kỷ luật của các lớp một cách khách quan nhờ hệ thống Audit Log minh bạch, không thể làm giả số liệu.
            </p>
            <ul className="list-none flex flex-col gap-2 mt-auto text-[0.9rem]">
              <li className="flex items-center gap-2 text-neutral-700">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                <span>Xem lịch sử thay đổi qua Audit Log</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-700">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                <span>Báo cáo số liệu thi đua chính xác</span>
              </li>
              <li className="flex items-center gap-2 text-neutral-700">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                <span>Phê duyệt tài khoản Giáo viên an toàn</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
