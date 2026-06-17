import { useLocation } from "react-router";
import { RegisterPage } from "@/modules/auth";

export default function Register() {
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  return <RegisterPage redirectTo={from} />;
}
