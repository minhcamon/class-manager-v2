import { useLocation } from "react-router";
import { LoginPage } from "@/modules/auth";

export default function Login() {
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  return <LoginPage redirectTo={from} />;
}
