import preview from '../../assets/preview.png';

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
        <div className="flex justify-center relative">
            <img
              src={preview}
              alt="ClassManager Dashboard Preview"
              className="max-w-full h-auto rounded-2xl shadow-lg shadow-neutral-900/5 border border-neutral-200 hover:translate-y-[-4px] transition-transform duration-300 ease-out"
              width="1000"
              height="800"
            />
          </div>
            
          
        
      </div>
    </section>
  );
}
