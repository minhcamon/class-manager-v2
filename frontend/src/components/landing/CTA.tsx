import { Link } from 'react-router';
import { Button } from '../ui/Button';

export default function CTA() {
  return (
    <section className="py-24 bg-white border-b border-neutral-200" id="cta">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="bg-[radial-gradient(circle_at_0%_0%,var(--color-neutral-800)_0%,var(--color-neutral-900)_100%)] text-white rounded-2xl p-12 md:p-20 text-center flex flex-col items-center gap-6 relative overflow-hidden shadow-xl shadow-neutral-900/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1)_0%,transparent_60%)] pointer-events-none"></div>
          
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2 max-w-3xl leading-[1.2] z-10">
            Nâng Cao Hiệu Quả Quản Lý Lớp Chủ Nhiệm Ngay Hôm Nay
          </h2>
          <p className="text-neutral-400 text-base md:text-lg max-w-2xl leading-relaxed z-10">
            Đơn giản hóa thủ tục hành chính, giải quyết triệt để tranh chấp thi đua tổ, và số hóa toàn bộ hồ sơ lớp học hoàn toàn miễn phí.
          </p>
          <Link to="/register" className="z-10">
            <Button 
              size="lg"
              className="bg-white text-neutral-900 hover:bg-neutral-100 shadow-md text-lg py-3.5 px-8"
            >
              Đăng ký sử dụng miễn phí
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
