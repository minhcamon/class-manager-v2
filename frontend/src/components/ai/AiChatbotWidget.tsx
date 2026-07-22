import React, { useState } from "react";
import { Sparkles, Bot, Send, X, Check, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import aiService from "@/services/aiService";
import type { AiReportResponse, ToneOption } from "@/types/ai";

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
  const [isOpen, setIsOpen] = useState(false);
  const [tone, setTone] = useState<ToneOption>("MOTIVATIONAL");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AiReportResponse | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [refining, setRefining] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleGenerate = async () => {
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
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !response) return;

    setRefining(true);
    try {
      const refinedText = await aiService.refineSummary({
        currentSummary: response.summaryText,
        userFeedback: chatInput,
        tone,
      });
      setResponse({
        ...response,
        summaryText: refinedText,
      });
      setChatInput("");
    } catch (err) {
      console.error("AI Refine error:", err);
    } finally {
      setRefining(false);
    }
  };

  const handleApply = () => {
    if (response && onApplySummary) {
      onApplySummary(response.summaryText);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 active:scale-95"
      >
        <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
        <span className="text-sm font-semibold">Trợ lý AI Nhận xét</span>
      </button>

      {/* Floating Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh] transition-all animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
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
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-200">
            {/* Tone Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                Văn phong nhận xét:
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {(["MOTIVATIONAL", "STRICT", "CONCISE"] as ToneOption[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                      tone === t
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {t === "MOTIVATIONAL" ? "Động viên" : t === "STRICT" ? "Nghiêm khắc" : "Súc tích"}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Trigger */}
            {!response && !loading && (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Tự động phân tích dữ liệu thi đua, điểm cộng và vi phạm để tạo bản nhận xét sư phạm.
                </p>
                <button
                  onClick={handleGenerate}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Sinh nhận xét tự động
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Đang tổng hợp dữ liệu & sinh nhận xét AI...</p>
              </div>
            )}

            {/* Response Display */}
            {response && !loading && (
              <div className="space-y-3.5">
                {/* Fallback Warning Badge */}
                {response.isFallback ? (
                  <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Hệ thống đang hoạt động ở chế độ Offline/Rule-based.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-800 dark:text-emerald-300 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Mô hình: {response.providerUsed} (Pll Anonymized)</span>
                  </div>
                )}

                {/* Summary Text Area */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm leading-relaxed text-slate-900 dark:text-slate-100 font-normal">
                  {response.summaryText}
                </div>

                {/* Strengths & Improvements Badges */}
                {response.strengths?.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                      Điểm mạnh nổi bật:
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                      {response.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {response.improvements?.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block mb-1">
                      Cần khắc phục:
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                      {response.improvements.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Controls */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleGenerate}
                    className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Tạo lại
                  </button>

                  {onApplySummary && (
                    <button
                      onClick={handleApply}
                      className={`flex-1 py-2 px-3 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        applied
                          ? "bg-emerald-600 text-white"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                      }`}
                    >
                      {applied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Đã chèn
                        </>
                      ) : (
                        "Chèn vào báo cáo"
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Chat Input (for refining text) */}
          {response && (
            <form onSubmit={handleRefine} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
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
                className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                {refining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};
export default AiChatbotWidget;
