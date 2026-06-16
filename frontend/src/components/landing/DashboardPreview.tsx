export default function DashboardPreview() {
  return (
    <section className="py-24 bg-white border-b border-neutral-200" id="preview">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 text-center mb-4">
          Trực Quan Hóa Thi Đua Lớp Học
        </h2>
        <p className="text-lg text-neutral-500 text-center max-w-2xl mx-auto mb-16">
          Bảng điểm thi đua được cập nhật liên tục, tự động tính toán điểm số và xếp hạng giúp giáo viên chủ nhiệm dễ dàng quản trị lớp học.
        </p>

        {/* Dashboard Frame Mockup */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-xl shadow-neutral-900/5 overflow-hidden max-w-4xl mx-auto">
          <div className="bg-neutral-900 text-white px-6 py-4 flex justify-between items-center select-none">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
              </div>
              <span className="text-sm font-medium opacity-80">Bảng thi đua lớp 10A1 — Tuần 3</span>
            </div>
            <span className="text-xs font-medium opacity-80">Đang hoạt động (ACTIVE)</span>
          </div>

          <div className="p-6 md:p-8 bg-neutral-50">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-8">
              <div className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-1 border-l-4 border-l-primary">
                <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Sĩ số lớp</span>
                <span className="text-2xl font-bold text-neutral-900">42</span>
              </div>
              <div className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-1 border-l-4 border-l-success">
                <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Điểm TB tuần</span>
                <span className="text-2xl font-bold text-neutral-900">92.5</span>
              </div>
              <div className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-1 border-l-4 border-l-warning">
                <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Chờ duyệt</span>
                <span className="text-2xl font-bold text-neutral-900">3</span>
              </div>
              <div className="bg-white border border-neutral-200 rounded-lg p-4 flex flex-col gap-1 border-l-4 border-l-danger">
                <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Vi phạm tuần</span>
                <span className="text-2xl font-bold text-neutral-900">4</span>
              </div>
            </div>

            {/* TanStack Table Preview Mock */}
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
              <table className="w-full border-collapse text-left text-[0.95rem]">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-900 font-semibold">
                    <th className="px-4 py-3 border-b border-neutral-200">Hạng</th>
                    <th className="px-4 py-3 border-b border-neutral-200">Học sinh</th>
                    <th className="px-4 py-3 border-b border-neutral-200">Tổ</th>
                    <th className="px-4 py-3 border-b border-neutral-200">Điểm thi đua</th>
                    <th className="px-4 py-3 border-b border-neutral-200">Thay đổi tuần</th>
                    <th className="px-4 py-3 border-b border-neutral-200">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3.5 border-b border-neutral-200">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-rank-1">1</div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 font-semibold text-neutral-900">Nguyễn Hoàng Nam</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 text-neutral-600">Tổ 1</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 font-semibold text-neutral-900">125</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 text-success font-semibold">+15</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-success-light text-success-text">Xuất sắc</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3.5 border-b border-neutral-200">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-rank-2">2</div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 font-semibold text-neutral-900">Trần Minh Thu</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 text-neutral-600">Tổ 2</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 font-semibold text-neutral-900">110</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 text-success font-semibold">+10</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-success-light text-success-text">Tốt</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3.5 border-b border-neutral-200">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-rank-3">3</div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 font-semibold text-neutral-900">Lê Quốc Anh</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 text-neutral-600">Tổ 1</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 font-semibold text-neutral-900">98</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 text-primary font-semibold">+2</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary">Khá</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3.5 border-b border-neutral-200">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-neutral-800 bg-neutral-200">4</div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 font-semibold text-neutral-900">Phạm Văn Hùng</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 text-neutral-600">Tổ 3</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 font-semibold text-neutral-900">78</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200 text-danger font-semibold">-12</td>
                    <td className="px-4 py-3.5 border-b border-neutral-200">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-light text-danger-text">Cần chú ý</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
