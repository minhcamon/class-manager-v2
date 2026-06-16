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
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Chấm Điểm Thi Đua Tức Thì</h3>
            <p className="text-neutral-600 text-[0.95rem] leading-relaxed">
              Giáo viên và Tổ trưởng trực tiếp chấm điểm cộng/trừ cho từng học sinh. Điểm hiện tại cập nhật động theo thời gian thực từ Điểm nền (Base Point) của lớp.
            </p>
          </div>

          {/* Feature 2: Chốt tuần tự động */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300 hover:bg-white hover:border-primary-border hover:shadow-lg hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Tự Động Chốt Điểm & Xếp Hạng</h3>
            <p className="text-neutral-600 text-[0.95rem] leading-relaxed">
              Hệ thống tự động chạy chốt tuần lúc 23:59 Chủ Nhật. Lưu snapshot điểm thi đua cuối cùng, tính điểm cộng/trừ và xếp hạng thi đua trong lớp và tổ.
            </p>
          </div>

          {/* Feature 3: Dynamic Forms */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300 hover:bg-white hover:border-primary-border hover:shadow-lg hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Phiếu Lý Lịch Động (Dynamic Form)</h3>
            <p className="text-neutral-600 text-[0.95rem] leading-relaxed">
              Thiết kế phiếu thu thập thông tin y tế, lý lịch, hoặc khảo sát riêng cho từng lớp. Học sinh điền thông tin nhanh chóng trên tài khoản cá nhân của mình.
            </p>
          </div>

          {/* Feature 4: Audit Logs */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300 hover:bg-white hover:border-primary-border hover:shadow-lg hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
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
