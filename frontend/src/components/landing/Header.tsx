import { Link } from 'react-router';
import { Button } from '../ui/Button';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-[72px] bg-background/80 backdrop-blur-md border-b border-neutral-200 z-50 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        <a href="#hero" className="flex items-center gap-2.5 text-xl font-bold text-neutral-900 no-underline">
          <span className="w-8 h-8 bg-primary rounded-[6px] flex items-center justify-center text-white font-extrabold text-lg">C</span>
          ClassManager
        </a>

        <nav>
          <ul className="hidden lg:flex items-center gap-8 list-none">
            <li><a href="#pain-points" className="text-neutral-600 no-underline text-[0.95rem] font-medium hover:text-primary transition-colors duration-150">Vấn đề</a></li>
            <li><a href="#who-is-it-for" className="text-neutral-600 no-underline text-[0.95rem] font-medium hover:text-primary transition-colors duration-150">Đối tượng</a></li>
            <li><a href="#features" className="text-neutral-600 no-underline text-[0.95rem] font-medium hover:text-primary transition-colors duration-150">Tính năng</a></li>
            <li><a href="#how-it-works" className="text-neutral-600 no-underline text-[0.95rem] font-medium hover:text-primary transition-colors duration-150">Quy trình</a></li>
            <li><a href="#benefits" className="text-neutral-600 no-underline text-[0.95rem] font-medium hover:text-primary transition-colors duration-150">Lợi ích</a></li>
          </ul>
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-neutral-600 no-underline font-semibold text-[0.95rem] hover:text-primary transition-colors duration-150 cursor-pointer"
          >
            Đăng nhập
          </Link>
          <Link to="/register">
            <Button size="sm">
              Đăng ký ngay
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
