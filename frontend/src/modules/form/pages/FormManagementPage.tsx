import { useState } from "react";
import FormBuilder from "../components/FormBuilder";
import FormHistory from "../components/FormHistory";

export default function FormManagementPage({ classId }: { classId: number }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Form Management</h1>
        <p className="text-gray-600">Design the information profile you want your students to complete.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <FormBuilder classId={classId} onSuccess={handleSuccess} />
        <FormHistory classId={classId} key={refreshKey} />
      </div>
    </div>
  );
}
