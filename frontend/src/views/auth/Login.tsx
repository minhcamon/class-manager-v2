import { useLocation, Navigate } from "react-router";
import { LoginPage } from "@/modules/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { user } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  if (user) {
    return <Navigate to={from} replace />;
  }

  return <LoginPage redirectTo={from} />;
}
