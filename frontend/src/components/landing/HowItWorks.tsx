export default function HowItWorks() {
  return (
    <section className="py-24 bg-background border-b border-neutral-200" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 text-center mb-4">
          Quy Trình Hoạt Động
        </h2>
        <p className="text-lg text-neutral-500 text-center max-w-2xl mx-auto mb-16">
          Bắt đầu số hóa công tác chủ nhiệm lớp học chỉ với 3 bước cực kỳ đơn giản.
        </p>

        <div className="flex flex-col md:flex-row justify-between relative mt-10 gap-8 md:gap-4">
          {/* Connecting Line (Desktop) */}
          <div className="absolute hidden md:block top-8 left-[12%] right-[12%] h-[2px] bg-neutral-200 z-0"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center w-full md:w-[28%] relative z-10 gap-4">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center text-2xl font-bold shadow-sm transition-all duration-300 hover:bg-primary hover:text-white select-none">
              1
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-neutral-900">Khởi Tạo Lớp Học</h3>
              <p className="text-[0.95rem] text-neutral-600 leading-relaxed">
                Giáo viên thiết lập lớp, phân chia danh sách học sinh vào các tổ thi đua, và chỉ định Tổ trưởng hỗ trợ.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center w-full md:w-[28%] relative z-10 gap-4">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center text-2xl font-bold shadow-sm transition-all duration-300 hover:bg-primary hover:text-white select-none">
              2
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-neutral-900">Ghi Nhận Thi Đua</h3>
              <p className="text-[0.95rem] text-neutral-600 leading-relaxed">
                Giáo viên chấm điểm toàn lớp. Tổ trưởng ghi nhận điểm cộng/trừ trực tuyến của thành viên tổ mình hàng ngày.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center w-full md:w-[28%] relative z-10 gap-4">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center text-2xl font-bold shadow-sm transition-all duration-300 hover:bg-primary hover:text-white select-none">
              3
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-neutral-900">Tự Động Báo Cáo</h3>
              <p className="text-[0.95rem] text-neutral-600 leading-relaxed">
                Hệ thống tự động khóa sổ, tổng hợp điểm số và xếp hạng thi đua tuần vào cuối ngày Chủ Nhật.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
