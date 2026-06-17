import { useState, useEffect } from "react";
import type { FormTemplate } from "@/types/form";
import formService from "@/services/formService";

interface FormHistoryProps {
  classId: number;
}

export default function FormHistory({ classId }: FormHistoryProps) {
  const [history, setHistory] = useState<FormTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const data = await formService.getFormHistory(classId);
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch form history", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [classId]);

  if (isLoading) return <div className="animate-pulse h-20 bg-card rounded-md"></div>;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Form Version History</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="p-3 font-medium">Version</th>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Created At</th>
              <th className="p-3 font-medium">Fields</th>
            </tr>
          </thead>
          <tbody>
            {history.map((form) => (
              <tr key={form.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="p-3">v{form.version}</td>
                <td className="p-3 font-medium">{form.title}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    form.isActive ? 'bg-pale-green text-pale-green-text' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {form.isActive ? 'Active' : 'Archived'}
                  </span>
                </td>
                <td className="p-3 text-gray-500">
                  {new Date(form.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">{form.structure.length} fields</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
