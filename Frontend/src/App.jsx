// ./src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Admin from "./pages/Admin";
import AdminAttendance from "./pages/AdminAttendance";
import AdminPresent from "./pages/AdminPresent";
import AdminAbsent from "./pages/AdminAbsent";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Navigation from "./pages/Navigation"; // ✅ ADD THIS
import Attendance from "./pages/Attendance";


// 🔐 Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" replace />;
};

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>

      {/* Login */}
      <Route
        path="/"
        element={
          currentUser ? <Navigate to="/home" replace /> : <Login />
        }
      />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* 🗺 Navigation Page */}
      <Route
        path="/navigation"
        element={
          <ProtectedRoute>
            <Navigation />
          </ProtectedRoute>
        }
      />

      {/* Catch unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />

      <Route path="/attendance" element={<Attendance />} />

      <Route path="/admin" element={<Admin />} />
<Route path="/admin/attendance" element={<AdminAttendance />} />
<Route path="/admin/attendance/present" element={<AdminPresent />} />
<Route path="/admin/attendance/absent" element={<AdminAbsent />} />

    </Routes>
  );
}

export default App;