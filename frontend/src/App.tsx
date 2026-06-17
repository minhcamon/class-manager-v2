import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./views/Home";
import Error from "./views/Error";
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import SelectRole from "./views/onboarding/SelectRole";
import CreateSchool from "./views/onboarding/CreateSchool";
import CreateClassView from "./views/onboarding/CreateClass";
import StudentOnboarding from "./views/onboarding/StudentOnboarding";
import { TeacherDashboard, StudentDashboard } from "./modules/dashboard";
import { TeacherClassOverview, TeacherClassManagement, TeacherClassConfiguration, StudentClassOverview } from "./modules/class";
import { ProfileTemplateBuilder } from "./modules/form";
import { MyProfilePage } from "./modules/profile";
import TeacherLayout from "./components/common/TeacherLayout";
import StudentLayout from "./components/common/StudentLayout";
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

          {/* Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
            <Route element={<TeacherLayout><Outlet /></TeacherLayout>}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/classes" element={<div>Danh sách lớp học (Coming Soon)</div>} />
              <Route path="/teacher/classes/create" element={<CreateClassView />} />
              <Route path="/teacher/classes/:classId" element={<TeacherClassOverview />} />
              <Route path="/teacher/classes/:classId/management" element={<TeacherClassManagement />} />
              <Route path="/teacher/classes/:classId/profile-template" element={<ProfileTemplateBuilder />} />
              <Route path="/teacher/classes/:classId/configuration" element={<TeacherClassConfiguration />} />
            </Route>
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
            <Route element={<StudentLayout><Outlet /></StudentLayout>}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/class/:classId" element={<StudentClassOverview />} />
              <Route path="/student/class/:classId/profile" element={<MyProfilePage />} />
            </Route>
          </Route>

          {/* Catch-all 404 Route */}
          <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
