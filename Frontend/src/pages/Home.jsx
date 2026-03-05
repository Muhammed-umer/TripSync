import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit
} from "firebase/firestore";

import beachImage from "../assets/beach.png";
import SupportChat from "./SupportChat";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, logout, role } = useAuth();

  const [profileData, setProfileData] = useState({});
  const [showProfile, setShowProfile] = useState(false);
  
  // State for the real-time Emergency Popup
  const [emergencyPopup, setEmergencyPopup] = useState(null);
  const [userCoords, setUserCoords] = useState(null);

  // 1. Initialize Location Tracking
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  // 2. Real-time Listener (The "Notification" logic for all users)
  useEffect(() => {
    const q = query(collection(db, "emergencies"), orderBy("timestamp", "desc"), limit(1));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;

      const doc = snapshot.docs[0];
      const data = doc.data();
      
      // Safety check: only show if created in the last 60 seconds
      const now = Date.now();
      const alertTime = data.timestamp?.toMillis() || now;
      const isNew = now - alertTime < 60000;

      if (isNew && data.uid !== currentUser?.uid) {
        let distanceText = "Calculating distance...";
        if (userCoords && data.lat && data.lng) {
          const d = calculateDistance(userCoords.lat, userCoords.lng, data.lat, data.lng);
          distanceText = `${d.toFixed(2)} km away`;
        }
        setEmergencyPopup({ ...data, distanceText });
      }
    });

    return () => unsubscribe();
  }, [currentUser, userCoords]);

  // Haversine Formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!currentUser) return;
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) setProfileData(userDoc.data());
    };
    fetchUser();
  }, [currentUser]);

  // THE EMERGENCY TRIGGER
  const handleEmergency = async () => {
    const sendAlert = async (lat, lng) => {
      try {
        await addDoc(collection(db, "emergencies"), {
          uid: currentUser.uid,
          name: profileData.username || currentUser.displayName || "A TripMate",
          lat,
          lng,
          timestamp: serverTimestamp()
        });
        alert("Alert sent to all users!");
      } catch (err) {
        console.error("Firebase Error:", err);
      }
    };

    if (userCoords) {
      await sendAlert(userCoords.lat, userCoords.lng);
    } else {
      // Try to get location one last time if it's missing
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          await sendAlert(coords.lat, coords.lng);
        },
        () => alert("Please enable location services to use the Emergency button.")
      );
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start py-10 bg-cover bg-center" style={{ backgroundImage: `url(${beachImage})` }}>
      
      {/* --- EMERGENCY POPUP UI --- */}
      {emergencyPopup && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.5)] border-t-8 border-red-500">
            <div className="text-7xl mb-4 animate-bounce">🚨</div>
            <h2 className="text-3xl font-black text-red-600 mb-2">HELP NEEDED!</h2>
            <p className="text-gray-900 font-extrabold text-xl">{emergencyPopup.name}</p>
            <div className="my-6 p-4 bg-red-50 rounded-2xl border-2 border-red-100">
              <p className="text-red-700 font-bold text-lg">📍 {emergencyPopup.distanceText}</p>
            </div>
            <button 
              onClick={() => setEmergencyPopup(null)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl border border-white/30 mx-auto" style={{ backgroundImage: `url(${beachImage})`, backgroundSize: "cover" }}>
            <div className="absolute inset-0 bg-black/25"></div>
            <div className="relative z-10">
              <div className="px-8 py-6 flex justify-between items-center text-white">
                <div>
                  <h1 className="text-2xl font-bold">TripSync</h1>
                  <p className="text-sm text-yellow-200">College Expedition '26</p>
                </div>
                <div onClick={() => setShowProfile(!showProfile)} className="w-12 h-12 rounded-xl border-2 border-cyan-400 overflow-hidden cursor-pointer">
                  {profileData.photoURL ? <img src={profileData.photoURL} className="w-full h-full object-cover" /> : "👤"}
                </div>
              </div>

              <div className="p-8 space-y-8">
                {showProfile && (
                  <div className="bg-black/40 p-6 rounded-3xl text-center border border-white/20">
                     <h3 className="text-white mb-4">{profileData.username || currentUser.displayName}</h3>
                     <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-xl">Logout</button>
                  </div>
                )}

                <div onClick={() => navigate("/navigation")} className="w-full h-44 bg-black/40 rounded-3xl flex items-center justify-center text-white font-semibold cursor-pointer">
                  Open Live Navigation Map
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <button onClick={() => navigate("/attendance")} className="h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl text-white font-semibold">📝 Attendance</button>
                  <button onClick={handleEmergency} className="h-32 bg-gradient-to-r from-red-600 to-red-500 rounded-3xl text-white font-semibold">🚨 Emergency</button>
                </div>

                <div className="w-full bg-slate-900/80 p-6 rounded-3xl text-white">
                  <h3 className="text-cyan-200 font-bold mb-2">Current Expedition</h3>
                  <p className="text-xs mb-4">VAGAMON HILLS</p>
                  <div className="w-full h-2 bg-white/20 rounded-full"><div className="h-full bg-emerald-400 w-[75%] rounded-full"></div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full max-w-md mx-auto">
            <SupportChat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;