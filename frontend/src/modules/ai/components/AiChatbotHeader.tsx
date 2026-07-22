import React from "react";
import { Bot, X } from "lucide-react";

interface AiChatbotHeaderProps {
  studentName?: string;
  onClose: () => void;
}

export const AiChatbotHeader: React.FC<AiChatbotHeaderProps> = ({
  studentName,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 bg-indigo-600 text-white shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-white/10 rounded-lg">
          <Bot className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <h3 className="text-sm font-bold leading-tight">Trợ lý AI ClassManager</h3>
          <p className="text-[11px] text-indigo-100 font-normal">
            {studentName ? `Nhận xét: ${studentName}` : "Tóm tắt đánh giá lớp"}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        title="Đóng"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default AiChatbotHeader;
