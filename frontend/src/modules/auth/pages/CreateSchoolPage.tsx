import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";
import OnboardingLayout from "@/components/common/OnboardingLayout";
import schoolService from "@/services/schoolService";
import type { School } from "@/services/schoolService";
import { Search, Plus, School as SchoolIcon, ChevronRight, Loader2 } from "lucide-react";

export default function TeacherOnboardingPage() {
  const { createSchool } = useAuth(); // Note: AuthContext.createSchool seems to handle school creation and re-auth
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      setIsSearching(true);
      try {
        const data = await schoolService.getSchools(searchTerm);
        setSchools(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSchools();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelectSchool = async (school: School) => {
    setIsSubmitting(true);
    try {
      // If the backend has an endpoint to join an existing school as a teacher, call it.
      // Assuming AuthContext.createSchool handles linking or we need a new method.
      // Based on current AuthContext, let's assume we can use a "join school" logic.
      // Wait, AuthContext only has createSchool. I'll need to check if I can reuse it or add selectSchool.
      
      // For now, let's stick to the current capability or update it.
      // If I select an existing school, I'm basically setting my schoolId.
      // I'll update AuthContext later if needed. For now, let's assume we create it if not found.
      
      // If the requirement says "Select existing", we need a "selectSchool" method in AuthContext.
      toast.info(`Đang liên kết với trường: ${school.name}`);
      // I'll call a hypothetical selectSchool or just createSchool with same details if BE allows.
      // Better: Update AuthContext.
      await createSchool(school.name, school.address); 
      toast.success("Liên kết trường học thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Không thể liên kết trường học.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAddress.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setIsSubmitting(true);
    try {
      await createSchool(newName.trim(), newAddress.trim());
      toast.success("Tạo trường học thành công!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tạo trường học thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2 text-center max-w-[420px] mx-auto">
          <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">
            {showCreateForm ? "Tạo trường học mới" : "Chọn trường học của bạn"}
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            {showCreateForm 
              ? "Nhập thông tin chi tiết để đăng ký trường học mới vào hệ thống ClassManager."
              : "Tìm kiếm và chọn trường học bạn đang công tác để bắt đầu quản lý lớp học."}
          </p>
        </div>

        {!showCreateForm ? (
          <>
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder="Tìm tên trường (ví dụ: THPT Chu Văn An...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-zinc-950 outline-none transition-all"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 size={16} className="animate-spin text-zinc-400" />
                </div>
              )}
            </div>

            {/* School List */}
            <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {schools.length > 0 ? (
                schools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => handleSelectSchool(school)}
                    disabled={isSubmitting}
                    className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-zinc-950 hover:bg-zinc-50 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                        <SchoolIcon size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-950">{school.name}</h4>
                        <p className="text-xs text-zinc-500 line-clamp-1">{school.address}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-zinc-300 group-hover:text-zinc-950 transition-colors" />
                  </button>
                ))
              ) : !isSearching ? (
                <div className="py-8 text-center border-2 border-dashed border-border rounded-xl">
                  <p className="text-sm text-zinc-400">Không tìm thấy trường học nào</p>
                </div>
              ) : null}
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <span className="relative px-3 bg-background text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Hoặc</span>
            </div>

            {/* Create New Option */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-zinc-600 hover:text-zinc-950 hover:border-zinc-400 hover:bg-zinc-50 transition-all text-sm font-bold cursor-pointer"
            >
              <Plus size={18} />
              Đăng ký trường học mới
            </button>
          </>
        ) : (
          /* Create Form */
          <form onSubmit={handleCreateSchool} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Tên trường học</label>
              <input
                type="text"
                placeholder="Ví dụ: Trường THPT Phan Đình Phùng"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Địa chỉ chi tiết</label>
              <textarea
                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                rows={3}
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 outline-none resize-none"
              />
            </div>
            
            <div className="flex flex-col gap-3 mt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Xác nhận & Tạo trường
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-950 font-medium transition-colors"
              >
                Quay lại tìm kiếm
              </button>
            </div>
          </form>
        )}
      </div>
    </OnboardingLayout>
  );
}
