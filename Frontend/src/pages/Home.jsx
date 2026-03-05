// ./src/pages/Home.jsx
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
import confetti from "canvas-confetti";

import beachImage from "../assets/beach.png";
import SupportChat from "./SupportChat";
import bannerImg from "../assets/banner.png";
import flagImg from "../assets/flag.png";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, logout, role } = useAuth(); // Added role for Admin Panel access

  const [profileData, setProfileData] = useState({});
  const [showProfile, setShowProfile] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // State for the real-time Emergency Popup
  const [emergencyPopup, setEmergencyPopup] = useState(null);
  const [userCoords, setUserCoords] = useState(null);

  // 1. Initialize Location Tracking for Emergency distance calculation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  // 2. Real-time Emergency Listener
  useEffect(() => {
    const q = query(collection(db, "emergencies"), orderBy("timestamp", "desc"), limit(1));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;

      const emergencyDoc = snapshot.docs[0];
      const data = emergencyDoc.data();
      
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

  // Haversine Formula for distance
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

  const triggerFlowers = () => {
    setShowBanner(true);
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 2, angle: 60, spread: 55, origin: { x: 0, y: 0.8 },
        colors: ["#ff0055", "#ffcc00", "#33ff00"], zIndex: 300
      });
      confetti({
        particleCount: 2, angle: 120, spread: 55, origin: { x: 1, y: 0.8 },
        colors: ["#ff0055", "#ffcc00", "#33ff00"], zIndex: 300
      });
      if (Date.now() < end) { requestAnimationFrame(frame); }
    })();
  };

  const handleEmergency = async () => {
    const sendAlert = async (lat, lng) => {
      try {
        await addDoc(collection(db, "emergencies"), {
          uid: currentUser.uid,
          name: profileData.username || currentUser.displayName || "A TripMate",
          lat, lng,
          timestamp: serverTimestamp()
        });
        alert("Alert sent to all users!");
      } catch (err) { console.error("Firebase Error:", err); }
    };

    if (userCoords) {
      await sendAlert(userCoords.lat, userCoords.lng);
    } else {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          await sendAlert(coords.lat, coords.lng);
        },
        () => alert("Please enable location services for Emergency button.")
      );
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  return (
    <div
      className="relative min-h-screen flex justify-center items-start py-6 md:py-10 bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: `url(${beachImage})`, backgroundAttachment: "fixed" }}
    >
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* --- EMERGENCY POPUP UI --- */}
      {emergencyPopup && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.5)] border-t-8 border-red-500 animate-in zoom-in duration-300">
            <div className="text-7xl mb-4 animate-bounce">🚨</div>
            <h2 className="text-3xl font-black text-red-600 mb-2">HELP NEEDED!</h2>
            <p className="text-gray-900 font-extrabold text-xl">{emergencyPopup.name}</p>
            <div className="my-6 p-4 bg-red-50 rounded-2xl border-2 border-red-100">
              <p className="text-red-700 font-bold text-lg">📍 {emergencyPopup.distanceText}</p>
            </div>
            <button onClick={() => setEmergencyPopup(null)} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95">DISMISS</button>
          </div>
        </div>
      )}

      {/* --- 🔥 PROFILE OVERLAY MODAL --- */}
      {showProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProfile(false)}></div>
          <div className="relative w-full max-w-sm bg-zinc-900/95 border border-white/10 rounded-[2.5rem] p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowProfile(false)} className="absolute top-6 right-6 text-white/50 hover:text-white text-xl">✕</button>
            <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-cyan-400 overflow-hidden shadow-lg">
               <img src={profileData.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.email}`} className="w-full h-full object-cover" alt="Profile" />
            </div>
            <h3 className="text-white font-bold text-xl mb-1">{profileData.username || currentUser?.displayName}</h3>
            <p className="text-yellow-200 text-sm mb-8 opacity-80 font-medium">{currentUser?.email}</p>
            <div className="space-y-3">
              {role === "admin" && (
                <button onClick={() => navigate("/admin")} className="w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold hover:bg-blue-500 transition">Admin Panel</button>
              )}
              <button onClick={handleLogout} className="w-full bg-red-600 text-white py-3 rounded-2xl font-semibold hover:bg-red-500 transition shadow-lg">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER AREA */}
      <div className={`absolute top-2 left-0 right-0 w-full z-30 pointer-events-none transition-opacity duration-300 ${chatOpen ? "opacity-0 invisible md:opacity-100 md:visible" : "opacity-100 visible"}`}>
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-start gap-4">
          <div className="flex items-start">
            <div className="w-2 h-28 md:h-48 bg-gradient-to-b from-zinc-300 to-zinc-700 rounded-full shadow-lg"></div>
            <div className="relative w-28 h-20 md:w-56 md:h-36 overflow-hidden rounded-sm shadow-2xl border-y border-r border-white/10 animate-flagWave origin-left -ml-1 mt-1">
              <img src={flagImg} alt="Flag" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10"></div>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-start mt-14 md:mt-4 pointer-events-auto">
            <button onClick={triggerFlowers} className="whitespace-nowrap px-4 py-2 md:px-12 md:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] md:text-xl font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/50 hover:scale-110 active:scale-95 transition-all mx-2">View Banner</button>
          </div>
          <div className="w-16 md:hidden"></div>
        </div>
      </div>

      {/* BANNER MODAL */}
      {showBanner && (
        <div className="fixed inset-0 z-[200] flex justify-center items-start pt-20 md:pt-12 px-2 md:px-6 backdrop-blur-md animate-fadeIn" onClick={() => setShowBanner(false)}>
          <button onClick={() => setShowBanner(false)} className="absolute top-4 right-4 z-[210] bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-2xl hover:bg-red-700 border border-white/20">✕ CLOSE</button>
          <div className="relative w-full max-w-[95vw] md:max-w-[480px] animate-unroll shadow-[0_0_100px_rgba(0,0,0,0.8)] origin-top rounded-b-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={bannerImg} alt="Banner" className="w-full h-auto max-h-[85vh] object-contain border-x-4 border-b-4 border-white/20" />
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      <div className="relative w-full max-w-6xl px-4 z-10 mt-28 md:mt-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 mx-auto bg-black/20 backdrop-blur-md">
            <div className="relative z-10">
              <div className="px-8 py-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-white tracking-tighter uppercase">TripSync</h1>
                  <p className="text-sm text-yellow-200 font-bold tracking-widest">CSE Warriors '26</p>
                </div>
                <div onClick={() => setShowProfile(true)} className="w-12 h-12 rounded-xl border-2 border-cyan-400 overflow-hidden cursor-pointer hover:scale-110 transition shadow-lg">
                  <img src={profileData.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.email}`} className="w-full h-full object-cover" alt="User Profile" />
                </div>
              </div>
              <div className="p-8 space-y-8">
                <div onClick={() => navigate("/navigation")} className="w-full h-44 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:bg-white/10 shadow-inner">📍 Open Live Navigation Map</div>
                <div className="grid grid-cols-2 gap-6">
                  <button onClick={() => navigate("/attendance")} className="h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl text-white font-bold shadow-lg">📝 Attendance</button>
                  <button onClick={handleEmergency} className="h-32 bg-gradient-to-r from-red-600 to-red-500 rounded-3xl text-white font-bold shadow-lg active:scale-95 transition-all">🚨 Emergency</button>
                </div>
                <div className="w-full bg-slate-900/60 border border-white/10 p-6 rounded-3xl text-white backdrop-blur-md">
                  <h3 className="text-cyan-200 font-bold mb-2">Current Expedition</h3>
                  <p className="text-xs font-black mb-4 tracking-widest uppercase">VAGAMON HILLS</p>
                  <div className="w-full h-2 bg-white/20 rounded-full">
                    <div className="h-full bg-emerald-400 w-[75%] rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <SupportChat onToggle={setChatOpen} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flagWave { 0%,100% { transform: skewY(0deg); } 50% { transform: skewY(8deg) scaleX(1.05); } }
        @keyframes unroll { 0% { transform: scaleY(0); opacity:0 } 100% { transform: scaleY(1); opacity:1 } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-flagWave { animation: flagWave 4s ease-in-out infinite; }
        .animate-unroll { animation: unroll 1.5s cubic-bezier(0.1, 0.8, 0.2, 1) forwards; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Home;