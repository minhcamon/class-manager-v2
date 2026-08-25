import React from "react";
import { Sparkles } from "lucide-react";

interface AiChatbotButtonProps {
    onClick: () => void;
}

export const AiChatbotButton: React.FC<AiChatbotButtonProps> = ({ onClick }) => {
    return (
        <div className="fixed right-0 bottom-6 z-40 group">
            <button
                onClick={onClick}
                className="flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-white pl-3.5 pr-4 py-2.5 rounded-l-xl shadow-xl shadow-primary-950/20 border-y border-l border-primary-400/40 transition-all duration-300 ease-out transform translate-x-[calc(100%-40px)] group-hover:translate-x-0 cursor-pointer select-none"
                title="Trợ lý AI Nhận xét"
            >
                <Sparkles className="w-4 h-4 shrink-0 text-secondary" />
                <div className="flex flex-col text-left whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
                    <span className="text-xs font-bold leading-tight">Trợ lý AI</span>
                    <span className="text-[10px] text-secondary leading-tight mt-0.5">Nhận xét</span>
                </div>
            </button>
        </div>
    );
};

export default AiChatbotButton;
