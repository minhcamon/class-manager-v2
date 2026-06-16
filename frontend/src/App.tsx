import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./views/Home";
import Error from "./views/Error";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          
          {/* Example Protected Routes (can be uncommented/expanded when features are built) */}
          <Route element={<ProtectedRoute allowedRoles={["TEACHER", "PRINCIPAL"]} />}>
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          </Route>
          
          {/* Catch-all 404 Route */}
          <Route path="*" element={<Error />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
