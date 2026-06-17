import { AlertCircle, AlertTriangle, Clock } from "lucide-react";

export default function PainPoints() {
  return (
    <section className="py-24 bg-white border-b border-neutral-200" id="pain-points">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 text-center mb-4">
          Những Khó Khăn Trong Quản Lý Truyền Thống
        </h2>
        <p className="text-lg text-neutral-500 text-center max-w-2xl mx-auto mb-16">
          Các phương pháp quản lý thủ công bằng sổ sách hay Excel đang làm mất thời gian của giáo viên và gây thiếu minh bạch trong lớp học.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pain Point 1: Excel Dễ Sai Sót */}
          <div className="bg-background border border-neutral-200 border-l-4 border-l-danger rounded-lg p-6 flex flex-col gap-4">
            <AlertCircle className="text-danger w-7 h-7" />
            <h3 className="text-lg font-bold text-neutral-900">File Excel Dễ Sai Sót</h3>
            <p className="text-neutral-600 text-[0.95rem] leading-relaxed">
              Các công thức tính toán phức tạp, việc nhập liệu thủ công lặp đi lặp lại rất dễ dẫn đến sai sót, nhầm lẫn điểm thi đua giữa học sinh và các tổ.
            </p>
          </div>

          {/* Pain Point 2: Tốn Thời Gian Làm Báo Cáo */}
          <div className="bg-background border border-neutral-200 border-l-4 border-l-danger rounded-lg p-6 flex flex-col gap-4">
            <Clock className="text-danger w-7 h-7" />
            <h3 className="text-lg font-bold text-neutral-900">Cực Hình Tổng Kết Cuối Tuần</h3>
            <p className="text-neutral-600 text-[0.95rem] leading-relaxed">
              Giáo viên phải dành nhiều giờ tối Chủ Nhật để đọc và cộng điểm từ các biên bản viết tay rời rạc của tổ trưởng, gây áp lực công việc lớn.
            </p>
          </div>

          {/* Pain Point 3: Thiếu Minh Bạch */}
          <div className="bg-background border border-neutral-200 border-l-4 border-l-danger rounded-lg p-6 flex flex-col gap-4">
            <AlertTriangle className="text-danger w-7 h-7" />
            <h3 className="text-lg font-bold text-neutral-900">Thiếu Minh Bạch & Tranh Chấp</h3>
            <p className="text-neutral-600 text-[0.95rem] leading-relaxed">
              Học sinh không nắm được lý do và thời điểm mình bị trừ điểm, dẫn đến những tranh cãi không đáng có về xếp hạng thi đua giữa các tổ.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
