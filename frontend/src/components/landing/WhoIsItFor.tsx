import { GraduationCap, User, School } from "lucide-react";

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
              <GraduationCap />
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
              <User />
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
              <School />
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
