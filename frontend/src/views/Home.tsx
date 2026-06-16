import { useState } from 'react';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import WhoIsItFor from '../components/landing/WhoIsItFor';
import PainPoints from '../components/landing/PainPoints';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Benefits from '../components/landing/Benefits';
import DashboardPreview from '../components/landing/DashboardPreview';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Button } from '../components/ui/Button';

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  const handleRegisterClick = () => {
    setShowModal(true);
  };

  return (
    <div className="bg-background text-neutral-600 font-sans min-h-screen text-left">
      {/* SEO metadata markers */}
      <h1 className="sr-only">
        ClassManager - Phần mềm quản lý lớp chủ nhiệm tự động và thi đua tổ học sinh
      </h1>

      {/* Sticky Header Nav */}
      <Header onRegisterClick={handleRegisterClick} />

      {/* Hero Section */}
      <Hero onRegisterClick={handleRegisterClick} />

      {/* Pain Points Section */}
      <PainPoints />

      {/* Who is it for Section */}
      <WhoIsItFor />

      {/* Features Section */}
      <Features />

      {/* How it works Section */}
      <HowItWorks />

      {/* Benefits Section */}
      <Benefits />

      {/* Live Data Preview Section */}
      <DashboardPreview />

      {/* CTA Section */}
      <CTA onRegisterClick={handleRegisterClick} />

      {/* Footer */}
      <Footer />

      {/* Premium Contact/Register Modal (Shadcn Dialog) */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-[480px] p-8">
          <DialogHeader className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-light text-primary flex items-center justify-center">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <DialogTitle className="text-2xl font-bold text-neutral-900">Đăng Ký Trải Nghiệm</DialogTitle>
            <DialogDescription className="text-neutral-500 text-[0.95rem] leading-relaxed">
              Hệ thống ClassManager hiện đang trong giai đoạn thử nghiệm giới hạn cho các trường THCS & THPT. Vui lòng liên hệ ban quản trị để tạo tài khoản Giáo viên chủ nhiệm.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            <a 
              href="mailto:register@classmanager.vn?subject=Đăng ký sử dụng ClassManager"
              className="inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 ease-in-out cursor-pointer select-none active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 px-4 py-2 text-base bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/20 w-full text-center"
            >
              Gửi Email Đăng Ký
            </a>
            <Button 
              variant="secondary" 
              onClick={() => setShowModal(false)}
              className="w-full"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
