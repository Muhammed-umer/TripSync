// ./src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { useAuth } from "./context/AuthContext";

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>

      {/* Login */}
      <Route
        path="/"
        element={
          currentUser ? <Navigate to="/home" /> : <Login />
        }
      />

      {/* Home */}
      <Route
        path="/home"
        element={
          currentUser ? <Home /> : <Navigate to="/" />
        }
      />

    </Routes>
  );
}

export default App;