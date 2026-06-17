import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./views/Home";
import Error from "./views/Error";
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import SelectRole from "./views/onboarding/SelectRole";
import CreateSchool from "./views/onboarding/CreateSchool";
import CreateClass from "./views/onboarding/CreateClass";
import StudentOnboarding from "./views/onboarding/StudentOnboarding";
import Dashboard from "./views/Dashboard";
import FormManagement from "./views/form/FormManagement";
import StudentProfile from "./views/profile/StudentProfile";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Toaster } from "sonner";

function DashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === "TEACHER") {
    return <Navigate to="/teacher/dashboard" replace />;
  }
  if (user?.role === "STUDENT") {
    return <Navigate to="/student/dashboard" replace />;
  }
  return <Navigate to="/" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="bottom-right" richColors />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Onboarding Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding/select-role" element={<SelectRole />} />
            <Route path="/onboarding/teacher" element={<CreateSchool />} />
            <Route path="/onboarding/student" element={<StudentOnboarding />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
          </Route>

          {/* Onboarded Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
            <Route path="/teacher/dashboard" element={<Dashboard />} />
            <Route path="/class/create" element={<CreateClass />} />
            <Route path="/forms" element={<FormManagement />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
            <Route path="/student/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<StudentProfile />} />
          </Route>

          {/* Catch-all 404 Route */}
          <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
