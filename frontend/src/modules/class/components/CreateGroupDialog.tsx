import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CreateGroupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => Promise<void>;
  className: string;
}

export default function CreateGroupDialog({
  isOpen,
  onOpenChange,
  onCreate,
  className,
}: CreateGroupDialogProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate(newGroupName.trim());
      setNewGroupName("");
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the parent component
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Tạo Tổ Học Tập Mới
          </DialogTitle>
          <DialogDescription className="text-neutral-500 text-sm">
            Tạo một tổ thi đua mới cho học sinh lớp {className}. Tên tổ phải là duy nhất.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label
              htmlFor="dialogGroupName"
              className="text-xs font-bold uppercase tracking-wider text-neutral-500"
            >
              Tên Tổ
            </label>
            <Input
              id="dialogGroupName"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="VD: Tổ 1, Tổ 2, Tổ Lý Tự Trọng..."
              className="w-full"
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setNewGroupName("");
                onOpenChange(false);
              }}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="cursor-pointer">
              Tạo Tổ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
