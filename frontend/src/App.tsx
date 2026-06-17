import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./views/Home";
import Error from "./views/Error";
import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import SelectRole from "./views/onboarding/SelectRole";
import CreateSchool from "./views/onboarding/CreateSchool";
import CreateClass from "./views/onboarding/CreateClass";
import Dashboard from "./views/Dashboard";
import FormManagement from "./views/form/FormManagement";
import StudentProfile from "./views/profile/StudentProfile";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Toaster } from "sonner";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Onboarding Protected Routes (Authenticated but roles or school might be pending) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding/select-role" element={<SelectRole />} />
            <Route path="/onboarding/create-school" element={<CreateSchool />} />
            <Route path="/onboarding/create-class" element={<CreateClass />} />
          </Route>
          
          {/* Onboarded Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["TEACHER", "STUDENT"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
            <Route path="/forms" element={<FormManagement />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
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
