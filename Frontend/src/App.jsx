// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ChangePassword from "./pages/ChangePassword";
import { useAuth } from "./context/AuthContext";

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Login */}
      <Route
        path="/"
        element={!currentUser ? <Login /> : <Navigate to="/home" />}
      />

      {/* Home */}
      <Route
        path="/home"
        element={currentUser ? <Home /> : <Navigate to="/" />}
      />

      {/* Change Password */}
      <Route
        path="/change-password"
        element={currentUser ? <ChangePassword /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;