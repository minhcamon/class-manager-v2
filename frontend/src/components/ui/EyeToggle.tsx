import { Eye, EyeOff } from "lucide-react";

interface EyeToggleProps {
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function EyeToggle({ visible, onToggle, disabled }: EyeToggleProps) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      disabled={disabled}
      aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors disabled:opacity-50 cursor-pointer p-0.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
    >
      {visible ? (
        <EyeOff className="w-4.5 h-4.5" />
      ) : (
        <Eye className="w-4.5 h-4.5" />
      )}
    </button>
  );
}
