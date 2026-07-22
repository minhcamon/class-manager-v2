import React from "react";
import useAiChatbot from "../hooks/useAiChatbot";
import AiChatbotButton from "./AiChatbotButton";
import AiChatbotHeader from "./AiChatbotHeader";
import AiChatbotBody from "./AiChatbotBody";
import AiChatbotFooter from "./AiChatbotFooter";

interface AiChatbotWidgetProps {
  classId: number;
  studentId?: number | null;
  studentName?: string;
  weekStartDate: string;
  onApplySummary?: (summaryText: string) => void;
}

export const AiChatbotWidget: React.FC<AiChatbotWidgetProps> = ({
  classId,
  studentId,
  studentName,
  weekStartDate,
  onApplySummary,
}) => {
  const {
    isOpen,
    toggleOpen,
    tone,
    setTone,
    loading,
    response,
    chatInput,
    setChatInput,
    refining,
    applied,
    handleGenerate,
    handleRefine,
    handleApply,
  } = useAiChatbot({
    classId,
    studentId,
    weekStartDate,
    onApplySummary,
  });

  return (
    <>
      <AiChatbotButton onClick={toggleOpen} />

      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh] transition-all animate-in fade-in slide-in-from-bottom-4 duration-200">
          <AiChatbotHeader studentName={studentName} onClose={toggleOpen} />

          <AiChatbotBody
            tone={tone}
            setTone={setTone}
            loading={loading}
            response={response}
            applied={applied}
            handleGenerate={handleGenerate}
            handleApply={handleApply}
            hasApplyCallback={Boolean(onApplySummary)}
          />

          {response && (
            <AiChatbotFooter
              chatInput={chatInput}
              setChatInput={setChatInput}
              refining={refining}
              handleRefine={handleRefine}
            />
          )}
        </div>
      )}
    </>
  );
};

export default AiChatbotWidget;
