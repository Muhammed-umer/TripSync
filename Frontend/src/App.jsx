// ./src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging"; // Added for FCM
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

    // --- 📱 Firebase Cloud Messaging (FCM) Setup ---
    const setupFCM = async () => {
      try {
        const messaging = getMessaging();
        
        // 1. Request Browser/Phone Permission
        const permission = await Notification.requestPermission();
        
        if (permission === "granted") {
          // 2. Get the unique device token
          // REPLACE 'YOUR_VAPID_PUBLIC_KEY' with the key from your Firebase Console
          const token = await getToken(messaging, { 
            vapidKey: "YOUR_VAPID_PUBLIC_KEY" 
          });

          if (token) {
            // 3. Save the token to the user's document to target this specific device
            await updateDoc(doc(db, "users", currentUser.uid), {
              fcmToken: token
            });
          }
        }
      } catch (error) {
        console.error("Error setting up push notifications:", error);
      }
    };

    setupFCM();

    // --- 🚨 Global Emergency Alert Listener (Foreground) ---
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
            new Notification("🚨 EMERGENCY ALERT", {
              body: `${alertData.senderName} needs help immediately!`,
              icon: alertData.senderPhoto || "/logo192.png"
            });
          }
        }
      });
    });

    // --- 💬 Global New Message Listener (Foreground) ---
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
          
          if (msg.senderId !== currentUser.uid && msgTime > initialLoadTime) {
            new Notification("New Message", {
              body: msg.text,
              icon: "/logo192.png"
            });
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
      <Route path="/" element={currentUser ? <Navigate to="/home" replace /> : <Login />} />

      {/* Protected Routes */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/navigation" element={<ProtectedRoute><Navigation /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute><AdminAttendance /></ProtectedRoute>} />
      <Route path="/admin/attendance/present" element={<ProtectedRoute><AdminPresent /></ProtectedRoute>} />
      <Route path="/admin/attendance/absent" element={<ProtectedRoute><AdminAbsent /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;