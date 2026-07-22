import React from "react";
import { Sparkles } from "lucide-react";

interface AiChatbotButtonProps {
  onClick: () => void;
}

export const AiChatbotButton: React.FC<AiChatbotButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer select-none"
      title="Trợ lý AI Nhận xét"
    >
      <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
      <span className="text-sm font-semibold">Trợ lý AI Nhận xét</span>
    </button>
  );
};

export default AiChatbotButton;
