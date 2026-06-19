import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import classService from "@/services/classService";
import type { Class } from "@/types/class";
import ClassManagementContent from "../components/ClassManagementContent";
import { Loader2 } from "lucide-react";

export default function TeacherClassManagementPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!classId) return;
      setIsLoading(true);
      try {
        const data = await classService.getClassById(parseInt(classId));
        setClassData(data);
      } catch (error) {
        console.error("Failed to fetch class details:", error);
        toast.error("Không thể tải thông tin lớp học.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-neutral-500 font-medium">Đang tải dữ liệu quản lý...</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">Không tìm thấy thông tin lớp học.</p>
      </div>
    );
  }

  return (
    <ClassManagementContent 
      classData={classData} 
      onClassEnded={() => navigate("/teacher/dashboard")} 
    />
  );
}
