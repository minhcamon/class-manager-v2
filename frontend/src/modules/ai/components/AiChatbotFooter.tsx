import React from "react";
import { Send, RefreshCw } from "lucide-react";

interface AiChatbotFooterProps {
  chatInput: string;
  setChatInput: (val: string) => void;
  refining: boolean;
  handleRefine: (e: React.FormEvent) => void;
}

export const AiChatbotFooter: React.FC<AiChatbotFooterProps> = ({
  chatInput,
  setChatInput,
  refining,
  handleRefine,
}) => {
  return (
    <form
      onSubmit={handleRefine}
      className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-2 shrink-0"
    >
      <input
        type="text"
        placeholder="Yêu cầu AI chỉnh sửa (VD: Sửa đoạn 2 mềm mỏng hơn)..."
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        disabled={refining}
        className="flex-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      />
      <button
        type="submit"
        disabled={refining || !chatInput.trim()}
        className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
        title="Gửi yêu cầu chỉnh sửa"
      >
        {refining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </form>
  );
};

export default AiChatbotFooter;
