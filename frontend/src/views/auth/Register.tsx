import { useLocation, Navigate } from "react-router";
import { RegisterPage } from "@/modules/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const { user } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  if (user) {
    return <Navigate to={from} replace />;
  }

  return <RegisterPage redirectTo={from} />;
}
