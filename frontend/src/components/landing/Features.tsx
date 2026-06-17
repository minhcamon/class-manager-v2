import { Clipboard, ListCheck, Lock, ShieldCheck } from "lucide-react";

export default function Features() {
  return (
    <section className="py-24 bg-white border-b border-neutral-200" id="features">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 text-center mb-4">
          Tính Năng Giải Quyết Vấn Đề
        </h2>
        <p className="text-lg text-neutral-500 text-center max-w-2xl mx-auto mb-16">
          ClassManager mang đến các công cụ thông minh giúp số hóa và tự động hóa toàn bộ công tác chủ nhiệm.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature 1: Chấm điểm thi đua */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300 hover:bg-white hover:border-primary-border hover:shadow-lg hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center">
              <ListCheck />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Chấm Điểm Thi Đua Tức Thì</h3>
            <p className="text-neutral-600 text-[0.95rem] leading-relaxed">
              Giáo viên và Tổ trưởng trực tiếp chấm điểm cộng/trừ cho từng học sinh. Điểm hiện tại cập nhật động theo thời gian thực từ Điểm nền (Base Point) của lớp.
            </p>
          </div>

          {/* Feature 2: Chốt tuần tự động */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300 hover:bg-white hover:border-primary-border hover:shadow-lg hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center">
              <Lock />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Tự Động Chốt Điểm & Xếp Hạng</h3>
            <p className="text-neutral-600 text-[0.95rem] leading-relaxed">
              Hệ thống tự động chạy chốt tuần lúc 23:59 Chủ Nhật. Lưu snapshot điểm thi đua cuối cùng, tính điểm cộng/trừ và xếp hạng thi đua trong lớp và tổ.
            </p>
          </div>

          {/* Feature 3: Dynamic Forms */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300 hover:bg-white hover:border-primary-border hover:shadow-lg hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center">
              <Clipboard />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Phiếu Lý Lịch Động (Dynamic Form)</h3>
            <p className="text-neutral-600 text-[0.95rem] leading-relaxed">
              Thiết kế phiếu thu thập thông tin y tế, lý lịch, hoặc khảo sát riêng cho từng lớp. Học sinh điền thông tin nhanh chóng trên tài khoản cá nhân của mình.
            </p>
          </div>

          {/* Feature 4: Audit Logs */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300 hover:bg-white hover:border-primary-border hover:shadow-lg hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center">
              <ShieldCheck />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Nhật Ký Giám Sát Minh Bạch</h3>
            <p className="text-neutral-600 text-[0.95rem] leading-relaxed">
              Lưu vết toàn bộ hành động nhạy cảm như đổi tổ trưởng, chuyển tổ học sinh, duyệt tài khoản học sinh. Đảm bảo dữ liệu thi đua trung thực, chống gian lận.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
