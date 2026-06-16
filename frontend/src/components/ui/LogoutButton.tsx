import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, Loader2 } from "lucide-react";

interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  iconSize?: number;
  iconClassName?: string;
  redirectPath?: string;
  children?: React.ReactNode;
}

const LogoutButton = ({
  className = "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer",
  iconSize = 16,
  iconClassName = "",
  redirectPath = "/",
  children = "Đăng xuất",
  ...props
}: LogoutButtonProps) => {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Smooth visual delay for log out experience
      await new Promise((resolve) => setTimeout(resolve, 800));
      logout();
      window.location.href = redirectPath;
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`${className} ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={iconSize} className="animate-spin shrink-0" />
      ) : (
        <LogOut size={iconSize} className={`shrink-0 ${iconClassName}`} />
      )}
      <span>{children}</span>
    </button>
  );
};

export default LogoutButton;
