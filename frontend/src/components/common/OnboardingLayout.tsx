import React from "react";
import LogoutButton from "@/components/ui/LogoutButton";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

const OnboardingLayout = ({ children }: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen bg-card flex flex-col font-sans">
      {/* Header with Logout Access */}
      <header className="w-full h-16 border-b border-border bg-background px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">ClassManager</span>
        </div>
        
        <LogoutButton className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-red-600 hover:bg-red-50/50 rounded-lg transition-all cursor-pointer" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[640px] bg-background border border-border rounded-2xl shadow-sm p-8 md:p-10">
          {children}
        </div>
      </main>

      {/* Footer / Meta */}
      <footer className="py-6 text-center text-xs text-zinc-400">
        © 2026 ClassManager. Student Observation Platform.
      </footer>
    </div>
  );
};

export default OnboardingLayout;
