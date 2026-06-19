import { Link } from 'react-router';
import { Button } from '../ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/common/Logo';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-[72px] bg-background/80 backdrop-blur-md border-b border-neutral-200 z-50 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        <Logo variant="c-box" as="anchor" to="#hero" />

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
          {!user ? (
            <>
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
            </>
          ) : (
            <Link to={user.role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard"}>
              <Button size="sm">
                Vào Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
