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

export default function Home() {
  return (
    <div className="bg-background text-neutral-600 font-sans min-h-screen text-left">
      {/* SEO metadata markers */}
      <h1 className="sr-only">
        ClassManager - Phần mềm quản lý lớp chủ nhiệm tự động và thi đua tổ học sinh
      </h1>

      {/* Sticky Header Nav */}
      <Header />

      {/* Hero Section */}
      <Hero />

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
      <CTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}
