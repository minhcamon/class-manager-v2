import { Book, Check, User } from "lucide-react";

export default function Benefits() {
  return (
    <section className="py-24 bg-white border-b border-neutral-200" id="benefits">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 text-center mb-4">
          Lợi Ích Thực Tế
        </h2>
        <p className="text-lg text-neutral-500 text-center max-w-2xl mx-auto mb-16">
          Giúp giáo viên giảm tải công việc hành chính, đồng thời xây dựng môi trường thi đua công bằng cho học sinh.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Column 1: Dành cho Giáo viên */}
          <div className="flex flex-col gap-7 bg-neutral-50 p-10 rounded-2xl border border-neutral-200 border-t-4 border-t-primary">
            <div className="flex items-center gap-4 mb-2">
              <Book className="text-primary w-7 h-7" strokeWidth={2.5} />
              <h3 className="text-xl font-bold text-neutral-900">Dành Cho Giáo Viên</h3>
            </div>

            <ul className="flex flex-col gap-5 list-none">
              <li className="flex gap-4 items-start">
                <div className="text-success shrink-0 mt-0.5">
                  <Check />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg font-bold text-neutral-900">Giải Phóng 90% Thời Gian Cuối Tuần</h4>
                  <p className="text-[0.95rem] text-neutral-600 leading-relaxed">Không còn những buổi tối chủ nhật cặm cụi nhập liệu hay cộng tay mỏi mắt. Báo cáo tuần được tạo tự động chỉ sau 1 click.</p>
                </div>
              </li>

              <li className="flex gap-4 items-start">
                <div className="text-success shrink-0 mt-0.5">
                  <Check />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg font-bold text-neutral-900">Quản Lý Tập Trung, Không Rời Rạc</h4>
                  <p className="text-[0.95rem] text-neutral-600 leading-relaxed">Tất cả thông tin từ lý lịch học sinh, danh sách tổ, lịch sử chấm điểm thi đua đến snapshot điểm tuần đều nằm trên một nền tảng duy nhất.</p>
                </div>
              </li>

              <li className="flex gap-4 items-start">
                <div className="text-success shrink-0 mt-0.5">
                  <Check />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg font-bold text-neutral-900">Dữ Liệu Bất Biến, Tuyệt Đối Minh Bạch</h4>
                  <p className="text-[0.95rem] text-neutral-600 leading-relaxed">Lịch sử điểm (point logs) là bất biến và lưu vết rõ ràng, tránh trường hợp học sinh hay tổ trưởng khiếu nại thiếu căn cứ.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 2: Dành cho Học sinh */}
          <div className="flex flex-col gap-7 bg-neutral-50 p-10 rounded-2xl border border-neutral-200">
            <div className="flex items-center gap-4 mb-2">
              <User className="text-primary w-7 h-7" strokeWidth={2.5} />
              <h3 className="text-xl font-bold text-neutral-900">Dành Cho Học Sinh</h3>
            </div>

            <ul className="flex flex-col gap-5 list-none">
              <li className="flex gap-4 items-start">
                <div className="text-success shrink-0 mt-0.5">
                  <Check />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg font-bold text-neutral-900">Xây Dựng Tính Tự Quản & Đội Nhóm</h4>
                  <p className="text-[0.95rem] text-neutral-600 leading-relaxed">Tổ trưởng trực tiếp chấm điểm thành viên, rèn luyện kỹ năng lãnh đạo và tinh thần chịu trách nhiệm cho tập thể tổ.</p>
                </div>
              </li>

              <li className="flex gap-4 items-start">
                <div className="text-success shrink-0 mt-0.5">
                  <Check />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg font-bold text-neutral-900">Xem Điểm Thi Đua Tức Thì</h4>
                  <p className="text-[0.95rem] text-neutral-600 leading-relaxed">Mọi học sinh đều có tài khoản riêng để kiểm tra lịch sử điểm số của mình bất kỳ lúc nào, thúc đẩy tinh thần học tập thi đua.</p>
                </div>
              </li>

              <li className="flex gap-4 items-start">
                <div className="text-success shrink-0 mt-0.5">
                  <Check />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg font-bold text-neutral-900">Nộp Lý Lịch Cá Nhân Thuận Tiện</h4>
                  <p className="text-[0.95rem] text-neutral-600 leading-relaxed">Điền và sửa đổi thông tin lý lịch cá nhân theo mẫu form động của lớp cực kỳ dễ dàng, không cần nộp giấy tờ bản cứng phức tạp.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
