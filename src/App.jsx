import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={!currentUser ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/dashboard"
        element={currentUser ? <Dashboard /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;