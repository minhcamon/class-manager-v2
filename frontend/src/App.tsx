import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./views/Home";
import Error from "./views/Error";
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import SelectRole from "./views/onboarding/SelectRole";
import CreateSchool from "./views/onboarding/CreateSchool";
import CreateClassView from "./views/onboarding/CreateClass";
import StudentOnboarding from "./views/onboarding/StudentOnboarding";
import TeacherDashboard from "./views/dashboard/TeacherDashboard";
import StudentDashboard from "./views/dashboard/StudentDashboard";
import TeacherClassesList from "./views/class/TeacherClassesList";
import TeacherClassOverview from "./views/class/TeacherClassOverview";
import TeacherClassManagement from "./views/class/TeacherClassManagement";
import DailyCanvasView from "./views/class/DailyCanvasView";
import TeacherClassConfiguration from "./views/class/TeacherClassConfiguration";
import StudentClassOverview from "./views/class/StudentClassOverview";
import ProfileTemplateBuilder from "./views/form/ProfileTemplateBuilder";
import StudentProfileView from "./views/profile/StudentProfile";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Toaster } from "sonner";

function DashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === "TEACHER") {
    return <Navigate to="/teacher/dashboard" replace />;
  }
  if (user?.role === "STUDENT" && user.classId) {
    return <Navigate to={`/student/class/${user.classId}`} replace />;
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
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/classes" element={<TeacherClassesList />} />
            <Route path="/teacher/classes/create" element={<CreateClassView />} />
            <Route path="/teacher/classes/:classId" element={<TeacherClassOverview />} />
            <Route path="/teacher/classes/:classId/management" element={<TeacherClassManagement />} />
            <Route path="/teacher/classes/:classId/profile-template" element={<ProfileTemplateBuilder />} />
            <Route path="/teacher/classes/:classId/configuration" element={<TeacherClassConfiguration />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/class/:classId" element={<StudentClassOverview />} />
            <Route path="/student/class/:classId/profile" element={<StudentProfileView />} />
            <Route path="/student/class/:classId/daily-canvas" element={<DailyCanvasView />} />
          </Route>

          {/* Shared Routes (Teacher + Student) */}
          <Route element={<ProtectedRoute allowedRoles={["TEACHER", "STUDENT"]} />}>
            <Route path="/teacher/classes/:classId/daily-canvas" element={<DailyCanvasView />} />
          </Route>

          {/* Catch-all 404 Route */}
          <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
