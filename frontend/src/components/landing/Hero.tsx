import { CheckCircle2 } from 'lucide-react';
import heroIllustration from '../../assets/hero_illustration.png';
import { Button } from '../ui/Button';

interface HeroProps {
  onRegisterClick: () => void;
}

export default function Hero({ onRegisterClick }: HeroProps) {
  return (
    <section className="pt-[140px] pb-20 min-h-[calc(100vh-72px)] flex items-center" id="hero">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          <div className="flex flex-col gap-6 text-left">
            <div className="inline-flex items-center w-max bg-primary-light text-primary px-3 py-1.5 rounded-full text-xs font-semibold border border-primary-border">
              ⚡ Giải pháp số hóa lớp chủ nhiệm
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
              Quản Lý Lớp Học Chủ Nhiệm Tự Động & Minh Bạch
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 max-w-xl">
              Không còn tốn hàng giờ cộng điểm thi đua hay vật lộn với bảng Excel mỗi cuối tuần. ClassManager tự động hóa toàn bộ quy trình chấm điểm và báo cáo thi đua tổ.
            </p>

            <ul className="flex flex-col gap-3 list-none">
              <li className="flex items-start gap-3 text-base">
                <CheckCircle2 className='text-success w-5 h-5 shrink-0 mt-0.5' />
                <span className="text-neutral-700"><strong>Theo dõi thi đua trực quan:</strong> Chấm điểm cộng/trừ và xếp hạng tổ theo thời gian thực.</span>
              </li>
              <li className="flex items-start gap-3 text-base">
                <CheckCircle2 className='text-success w-5 h-5 shrink-0 mt-0.5' />
                <span className="text-neutral-700"><strong>Chốt điểm tự động:</strong> Khóa sổ điểm tự động vào 23:59 Chủ Nhật, xuất báo cáo tức thì.</span>
              </li>
              <li className="flex items-start gap-3 text-base">
                <CheckCircle2 className='text-success w-5 h-5 shrink-0 mt-0.5' />
                <span className="text-neutral-700"><strong>Thu thập lý lịch linh hoạt:</strong> Tùy chỉnh form thông tin học sinh theo nhu cầu từng lớp.</span>
              </li>
            </ul>

            <div className="flex gap-4 flex-wrap mt-3">
              <Button
                onClick={onRegisterClick}
                size="lg"
              >
                Bắt đầu trải nghiệm ngay
              </Button>
              <a
                href="#preview"
                className="inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 ease-in-out cursor-pointer select-none active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 px-6 py-3 text-lg bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400"
              >
                Xem bảng điểm demo
              </a>
            </div>
          </div>

          <div className="flex justify-center relative">
            <img
              src={heroIllustration}
              alt="ClassManager Dashboard Preview"
              className="max-w-full h-auto rounded-2xl shadow-lg shadow-neutral-900/5 border border-neutral-200 hover:translate-y-[-4px] transition-transform duration-300 ease-out"
              width="600"
              height="400"
            />
          </div>
        </div>
      </div>
    </section >
  );
}
