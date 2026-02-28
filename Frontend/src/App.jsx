import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>

      {/* LOGIN */}
      <Route
        path="/"
        element={
          currentUser ? <Navigate to="/home" replace /> : <Login />
        }
      />

      {/* HOME (Protected) */}
      <Route
        path="/home"
        element={
          currentUser ? <Home /> : <Navigate to="/" replace />
        }
      />

      {/* PROFILE (Protected) */}
      <Route
        path="/profile"
        element={
          currentUser ? <Profile /> : <Navigate to="/" replace />
        }
      />

      {/* Catch Unknown Routes */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;