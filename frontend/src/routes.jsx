import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TimetableSetup from "./pages/TimetableSetup";
import AddCourse from "./pages/AddCourse";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthDebugger from "./components/Debug/AuthDebugger";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timetable"
        element={
          <ProtectedRoute>
            <TimetableSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/add"
        element={
          <ProtectedRoute>
            <AddCourse />
          </ProtectedRoute>
        }
      />
      {/* Debug route for authentication testing */}
      <Route path="/debug/auth" element={<AuthDebugger />} />
      {/* Catch-all route - redirect to home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
