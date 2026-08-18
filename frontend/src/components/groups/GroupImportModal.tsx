import React, { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  X,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import groupService from "@/services/groupService";
import type { GroupImportPreviewResponse, GroupImportRow } from "@/types/group";

interface GroupImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  onSuccess: () => void;
}

export const GroupImportModal: React.FC<GroupImportModalProps> = ({
  isOpen,
  onClose,
  classId,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [previewData, setPreviewData] = useState<GroupImportPreviewResponse | null>(null);
  const [createNewGroups, setCreateNewGroups] = useState(true);
  const [filterTab, setFilterTab] = useState<"ALL" | "VALID" | "INVALID">("ALL");

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setPreviewData(null);
    setLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      await groupService.downloadTemplate(classId);
      toast.success("Đã tải xuống file Excel mẫu chuẩn!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể tải file mẫu.");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      validateAndSetFile(selected);
    }
  };

  const validateAndSetFile = (f: File) => {
    const name = f.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".xls") && !name.endsWith(".csv")) {
      toast.error("Vui lòng chỉ chọn file Excel (.xlsx, .xls) hoặc CSV (.csv)");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file trước khi tiếp tục!");
      return;
    }
    try {
      setLoading(true);
      const res = await groupService.previewImport(classId, file);
      setPreviewData(res);
      setStep(2);
      toast.success(`Đã phân tích ${res.totalRows} dòng từ file!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi đọc file Excel/CSV. Vui lòng kiểm tra lại định dạng.");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!previewData || previewData.validRows === 0) {
      toast.error("Không có dòng hợp lệ nào để import.");
      return;
    }

    const validRowsToImport = previewData.rows
      .filter((r) => r.status === "VALID" && r.studentProfileId !== null)
      .map((r) => ({
        studentProfileId: r.studentProfileId!,
        groupName: r.groupName,
        isLeader: r.isLeader,
      }));

    try {
      setLoading(true);
      const res = await groupService.executeImport(classId, {
        rows: validRowsToImport,
        createNewGroups,
      });
      toast.success(res.message);
      setStep(3);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi nhập danh sách tổ.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = (previewData?.rows || []).filter((r) => {
    if (filterTab === "VALID") return r.status === "VALID";
    if (filterTab === "INVALID") return r.status !== "VALID";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Import Danh Sách Tổ Qua Excel / CSV
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Phân tổ và chỉ định Tổ trưởng hàng loạt từ file dữ liệu
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center gap-8">
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 1 ? "text-blue-600 dark:text-blue-400" : "text-slate-500"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>1</span>
            Chọn File
          </div>
          <div className="w-8 h-px bg-slate-300 dark:bg-slate-700" />
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 2 ? "text-blue-600 dark:text-blue-400" : "text-slate-500"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>2</span>
            Xem Trước Dữ Liệu
          </div>
          <div className="w-8 h-px bg-slate-300 dark:bg-slate-700" />
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 3 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 3 ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>3</span>
            Hoàn Tất
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Template Download Banner */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                      Chưa có file định dạng chuẩn?
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300/80">
                      Tải mẫu file Excel (.xlsx) chuẩn gồm các cột: STT, Mã học sinh/Email, Họ tên, Tên tổ, Tổ trưởng.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm transition-colors shrink-0 disabled:opacity-50"
                >
                  {downloadingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Tải File Mẫu (.xlsx)
                </button>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                    : "border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/30 dark:bg-slate-900/30"
                }`}
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-3">
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  Kéo thả file Excel hoặc CSV vào đây
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Hỗ trợ các định dạng .xlsx, .xls, .csv (Dung lượng tối đa 10MB)
                </p>

                {file && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{file.name}</p>
                      <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW TABLE */}
          {step === 2 && previewData && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 font-medium">Tổng số dòng</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{previewData.totalRows}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Hợp lệ</p>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{previewData.validRows}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Cần kiểm tra lại</p>
                  <p className="text-lg font-bold text-rose-700 dark:text-rose-300 mt-0.5">{previewData.invalidRows}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Số Tổ mới tạo</p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-0.5">{previewData.newGroupsCount}</p>
                </div>
              </div>

              {/* Options & Filter Tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setFilterTab("ALL")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      filterTab === "ALL" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Tất cả ({previewData.totalRows})
                  </button>
                  <button
                    onClick={() => setFilterTab("VALID")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      filterTab === "VALID" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Hợp lệ ({previewData.validRows})
                  </button>
                  <button
                    onClick={() => setFilterTab("INVALID")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      filterTab === "INVALID" ? "bg-rose-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Lỗi ({previewData.invalidRows})
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createNewGroups}
                    onChange={(e) => setCreateNewGroups(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                  />
                  Tự động tạo mới Tổ nếu chưa có trên hệ thống
                </label>
              </div>

              {/* Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-[350px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="p-3 w-12 text-center">Dòng</th>
                      <th className="p-3">Học sinh</th>
                      <th className="p-3">Mã / Email</th>
                      <th className="p-3">Phân vào Tổ</th>
                      <th className="p-3 text-center">Chức vụ</th>
                      <th className="p-3 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredRows.map((row: GroupImportRow, idx: number) => (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                          row.status !== "VALID" ? "bg-rose-50/30 dark:bg-rose-950/10" : ""
                        }`}
                      >
                        <td className="p-3 text-center text-slate-400 font-mono">{row.rowNumber}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          {row.studentName || <span className="text-slate-400 italic">Chưa xác định</span>}
                        </td>
                        <td className="p-3 font-mono text-slate-500">{row.studentIdentifier || "-"}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                            <Users className="w-3.5 h-3.5" />
                            {row.groupName || "-"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {row.isLeader ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1">
                              <UserCheck className="w-3 h-3" /> Tổ Trưởng
                            </span>
                          ) : (
                            <span className="text-slate-400">Thành viên</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {row.status === "VALID" ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hợp lệ
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 inline-flex items-center gap-1" title={row.statusMessage}>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" /> {row.statusMessage}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS RESULT */}
          {step === 3 && (
            <div className="py-8 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Import Danh Sách Tổ Thành Công!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Dữ liệu chia Tổ và chỉ định Tổ trưởng đã được cập nhật chính xác vào hệ thống quản lý lớp học.
              </p>

              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all"
              >
                Đóng & Cập Nhật Bảng
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step !== 3 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <button
              onClick={step === 2 ? () => setStep(1) : handleClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {step === 2 ? "Quay lại chọn file" : "Hủy bỏ"}
            </button>

            {step === 1 ? (
              <button
                onClick={handlePreview}
                disabled={!file || loading}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                Xem Trước Dữ Liệu File
              </button>
            ) : (
              <button
                onClick={handleExecuteImport}
                disabled={!previewData || previewData.validRows === 0 || loading}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Xác Nhận Import ({previewData?.validRows || 0} Học Sinh)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
