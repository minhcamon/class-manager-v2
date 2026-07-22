import React from "react";
import { Sparkles, Check, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import type { AiReportResponse, ToneOption } from "@/types/ai";

interface AiChatbotBodyProps {
  tone: ToneOption;
  setTone: (tone: ToneOption) => void;
  loading: boolean;
  response: AiReportResponse | null;
  applied: boolean;
  handleGenerate: () => void;
  handleApply: () => void;
  hasApplyCallback: boolean;
}

export const AiChatbotBody: React.FC<AiChatbotBodyProps> = ({
  tone,
  setTone,
  loading,
  response,
  applied,
  handleGenerate,
  handleApply,
  hasApplyCallback,
}) => {
  return (
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
              className={`py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
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

      {/* Initial State */}
      {!response && !loading && (
        <div className="text-center py-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Tự động phân tích dữ liệu thi đua, điểm cộng và vi phạm để tạo bản nhận xét sư phạm.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Sinh nhận xét tự động
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Đang tổng hợp dữ liệu & sinh nhận xét AI...</p>
        </div>
      )}

      {/* Generated Response View */}
      {response && !loading && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Fallback Badge */}
          {response.isFallback ? (
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Hệ thống đang hoạt động ở chế độ Offline/Rule-based.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-800 dark:text-emerald-300 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Mô hình: {response.providerUsed} (PII Anonymized)</span>
            </div>
          )}

          {/* Summary Text Area */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm leading-relaxed text-slate-900 dark:text-slate-100 font-normal">
            {response.summaryText}
          </div>

          {/* Strengths */}
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

          {/* Improvements */}
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

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleGenerate}
              className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tạo lại
            </button>

            {hasApplyCallback && (
              <button
                onClick={handleApply}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
  );
};

export default AiChatbotBody;
