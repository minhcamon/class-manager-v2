import { StudentProfilePage } from "@/modules/profile";
import { useAuth } from "@/contexts/AuthContext";
import StudentLayout from "@/components/common/StudentLayout";

export default function StudentProfileView() {
  const { user } = useAuth();
  const classId = user?.classId;

  if (!classId) {
    return (
      <StudentLayout>
        <div className="container mx-auto py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground">Not Enrolled</h2>
          <p className="text-gray-500 mt-2">You are not enrolled in any class yet.</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="container mx-auto py-8">
        <StudentProfilePage classId={classId} />
      </div>
    </StudentLayout>
  );
}
