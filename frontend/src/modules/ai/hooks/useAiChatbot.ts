import { useState, useCallback } from "react";
import aiService from "@/services/aiService";
import type { AiReportResponse, ToneOption } from "@/types/ai";

interface UseAiChatbotOptions {
  classId: number;
  studentId?: number | null;
  weekStartDate: string;
  onApplySummary?: (summaryText: string) => void;
}

export function useAiChatbot({
  classId,
  studentId,
  weekStartDate,
  onApplySummary,
}: UseAiChatbotOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [tone, setTone] = useState<ToneOption>("MOTIVATIONAL");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiReportResponse | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [refining, setRefining] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setApplied(false);
    try {
      const res = await aiService.generateWeeklySummary({
        classId,
        studentId: studentId ?? null,
        weekStartDate,
        tone,
      });
      setResponse(res);
    } catch (err) {
      console.error("AI Generation error:", err);
    } finally {
      setLoading(false);
    }
  }, [classId, studentId, weekStartDate, tone]);

  const handleRefine = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() || !response) return;

      setRefining(true);
      try {
        const refinedText = await aiService.refineSummary({
          currentSummary: response.summaryText,
          userFeedback: chatInput,
          tone,
        });
        setResponse((prev) =>
          prev ? { ...prev, summaryText: refinedText } : null
        );
        setChatInput("");
      } catch (err) {
        console.error("AI Refine error:", err);
      } finally {
        setRefining(false);
      }
    },
    [chatInput, response, tone]
  );

  const handleApply = useCallback(() => {
    if (response && onApplySummary) {
      onApplySummary(response.summaryText);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    }
  }, [response, onApplySummary]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
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
  };
}

export default useAiChatbot;
