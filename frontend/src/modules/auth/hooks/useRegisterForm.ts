import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";

export function useRegisterForm(redirectTo: string) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((v) => !v);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((v) => !v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!username.trim() || !phone.trim() || !fullName.trim() || !password || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ các trường thông tin đăng ký!");
      return;
    }
    if (username.trim().length < 4) {
      toast.error("Tên đăng nhập phải chứa ít nhất 4 ký tự!");
      return;
    }
    if (password.length < 8) {
      toast.error("Mật khẩu phải dài tối thiểu 8 ký tự!");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error("Số điện thoại không hợp lệ! Vui lòng nhập từ 9 đến 15 chữ số.");
      return;
    }

    setIsLoading(true);
    try {
      await register(
        username.trim(),
        password,
        phone.trim(),
        fullName.trim()
      );
      toast.success("Đăng ký tài khoản thành công!");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Đăng ký thất bại. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    username,
    setUsername,
    phone,
    setPhone,
    fullName,
    setFullName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    togglePasswordVisibility,
    showConfirmPassword,
    toggleConfirmPasswordVisibility,
    isLoading,
    setIsLoading,
    handleSubmit,
  };
}
