// ./src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { useAuth } from "./context/AuthContext";

import Admin from "./pages/Admin";
import AdminAttendance from "./pages/AdminAttendance";
import AdminPresent from "./pages/AdminPresent";
import AdminAbsent from "./pages/AdminAbsent";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Navigation from "./pages/Navigation";
import Attendance from "./pages/Attendance";

// 🔐 Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" replace />;
};

function App() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // 🔔 Request Browser Notification Permission
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    const showNotification = (title, body, icon) => {
      if (Notification.permission === "granted") {
        new Notification(title, { body, icon });
      }
    };

    // --- 🚨 Global Emergency Alert Listener ---
    const tenMinsAgo = Date.now() - 10 * 60 * 1000;
    const emergencyQ = query(
      collection(db, "emergency_alerts"),
      where("timestamp", ">=", tenMinsAgo)
    );

    const unsubEmergency = onSnapshot(emergencyQ, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const alertData = change.doc.data();
          if (alertData.senderId !== currentUser.uid) {
            showNotification(
              "🚨 EMERGENCY ALERT",
              `${alertData.senderName} needs help immediately!`,
              alertData.senderPhoto || "/logo192.png"
            );
          }
        }
      });
    });

    // --- 💬 Global New Message Listener ---
    const initialLoadTime = new Date();
    const messageQ = query(
      collection(db, "support_messages"),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubMessages = onSnapshot(messageQ, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const msg = change.doc.data();
          const msgTime = msg.timestamp?.toDate();
          
          // Notify only for new messages received after the app loaded
          if (msg.senderId !== currentUser.uid && msgTime > initialLoadTime) {
            showNotification(
              "New Message",
              msg.text,
              "/logo192.png"
            );
          }
        }
      });
    });

    return () => {
      unsubEmergency();
      unsubMessages();
    };
  }, [currentUser]);

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

      <Route
        path="/navigation"
        element={
          <ProtectedRoute>
            <Navigation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute>
            <AdminAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance/present"
        element={
          <ProtectedRoute>
            <AdminPresent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance/absent"
        element={
          <ProtectedRoute>
            <AdminAbsent />
          </ProtectedRoute>
        }
      />

      {/* Catch unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;