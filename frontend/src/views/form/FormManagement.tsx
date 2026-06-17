import { FormManagementPage } from "@/modules/form";
import { useAuth } from "@/contexts/AuthContext";

export default function FormManagementView() {
  const { user } = useAuth();
  const classId = user?.classId;

  if (!classId) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground">No active class found</h2>
        <p className="text-gray-500 mt-2">Please create a class first to manage forms.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <FormManagementPage classId={classId} />
    </div>
  );
}
