// ./src/pages/Home.jsx
import React, { useState, useEffect, useRef } from "react";
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
  limit,
  where
} from "firebase/firestore";
import confetti from "canvas-confetti";

import beachImage from "../assets/beach.png";
import SupportChat from "./SupportChat";
import bannerImg from "../assets/banner.png";
import flagImg from "../assets/flag.png";

// --- DYNAMIC TRIP TIMER COMPONENT ---
const TripTimer = () => {
  const [timeLeft, setTimeLeft] = useState({});
  const [tripState, setTripState] = useState("BEFORE"); // BEFORE, DURING, AFTER

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Trip starts: Tomorrow (Friday Mar 6) at 8:00 PM
      const startTime = new Date("2026-03-06T20:00:00");
      // Trip ends: Monday morning at 6:00 AM
      const endTime = new Date("2026-03-09T06:00:00");

      let targetDate = startTime;
      let state = "BEFORE";

      if (now > startTime && now < endTime) {
        targetDate = endTime;
        state = "DURING";
      } else if (now >= endTime) {
        state = "AFTER";
      }

      setTripState(state);

      const difference = targetDate - now;
      let time = {};

      if (difference > 0) {
        time = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return time;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (tripState === "AFTER") {
    return (
      <div className="w-full bg-slate-900/60 border border-emerald-500/30 p-6 rounded-3xl text-white backdrop-blur-md text-center">
        <h3 className="text-emerald-400 font-black italic tracking-widest uppercase">Trip Completed</h3>
        <p className="text-xs font-bold mt-2 uppercase">Hope everyone reached home safely! ❤️</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/60 border border-white/10 p-6 rounded-3xl text-white backdrop-blur-md">
      <h3 className={`font-black mb-3 tracking-tighter uppercase ${tripState === "BEFORE" ? "text-yellow-400" : "text-emerald-400"}`}>
        {tripState === "BEFORE" ? "🚀 Be ready for the trip!" : "✨ Enjoy well & create memories!"}
      </h3>
      
      <div className="flex justify-between items-center gap-2 mb-4">
        {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
          <div key={unit} className="flex-1 bg-black/40 rounded-xl p-2 border border-white/5 text-center">
            <div className="text-xl font-black">{timeLeft[unit] || 0}</div>
            <div className="text-[8px] uppercase opacity-60 font-bold">{unit}</div>
          </div>
        ))}
      </div>

      <p className="text-[10px] font-bold tracking-widest uppercase opacity-80 italic leading-tight text-center">
        {tripState === "BEFORE" 
          ? "Pack your bags and check your gear!" 
          : "This is our first and last trip together. Make it count!"}
      </p>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, logout, role } = useAuth();

  const [profileData, setProfileData] = useState({});
  const [showProfile, setShowProfile] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const [emergencyPopup, setEmergencyPopup] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const lastProcessedAlert = useRef(0);

  // 1. Initialize Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  // 2. Optimized Emergency Listener (Throttled)
  useEffect(() => {
    if (!currentUser) return;
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const q = query(
      collection(db, "emergencies"), 
      where("timestamp", ">=", oneMinuteAgo),
      orderBy("timestamp", "desc"), 
      limit(1)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;
      const data = snapshot.docs[0].data();
      const now = Date.now();
      
      if (now - lastProcessedAlert.current < 5000) return; // 5s throttle

      if (data.uid !== currentUser?.uid) {
        lastProcessedAlert.current = now;
        let distanceText = "Calculating...";
        if (userCoords && data.lat && data.lng) {
          const R = 6371; 
          const dLat = (data.lat - userCoords.lat) * (Math.PI / 180);
          const dLon = (data.lng - userCoords.lng) * (Math.PI / 180);
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(userCoords.lat * (Math.PI / 180)) * Math.cos(data.lat * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
          const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distanceText = `${d.toFixed(2)} km away`;
        }
        setEmergencyPopup({ ...data, distanceText });
      }
    });
    return () => unsubscribe();
  }, [currentUser, userCoords]);

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
    const end = Date.now() + 3000;
    (function frame() {
      confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors: ["#ff0055", "#ffcc00", "#33ff00"] });
      confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors: ["#ff0055", "#ffcc00", "#33ff00"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const handleEmergency = async () => {
    if (!userCoords) return alert("Enable location for emergency alerts.");
    try {
      await addDoc(collection(db, "emergencies"), {
        uid: currentUser.uid,
        name: profileData.username || "TripMate",
        lat: userCoords.lat,
        lng: userCoords.lng,
        timestamp: serverTimestamp()
      });
      alert("Emergency alert sent!");
    } catch (err) { console.error(err); }
  };

  return (
    <div className="relative min-h-screen flex justify-center items-start py-6 md:py-10 bg-cover bg-center overflow-x-hidden" style={{ backgroundImage: `url(${beachImage})`, backgroundAttachment: "fixed" }}>
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* --- EMERGENCY POPUP --- */}
      {emergencyPopup && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl border-t-8 border-red-500 animate-in zoom-in duration-300">
            <div className="text-7xl mb-4 animate-bounce">🚨</div>
            <h2 className="text-3xl font-black text-red-600 mb-2">HELP NEEDED!</h2>
            <p className="text-gray-900 font-extrabold text-xl">{emergencyPopup.name}</p>
            <div className="my-6 p-4 bg-red-50 rounded-2xl border-2 border-red-100">
              <p className="text-red-700 font-bold text-lg">📍 {emergencyPopup.distanceText}</p>
            </div>
            <button onClick={() => setEmergencyPopup(null)} className="w-full bg-red-600 text-white font-black py-4 rounded-2xl transition-all active:scale-95">DISMISS</button>
          </div>
        </div>
      )}

      {/* --- PROFILE MODAL --- */}
      {showProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProfile(false)}></div>
          <div className="relative w-full max-w-sm bg-zinc-900/95 border border-white/10 rounded-[2.5rem] p-8 text-center animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowProfile(false)} className="absolute top-6 right-6 text-white/50 hover:text-white">✕</button>
            <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-cyan-400 overflow-hidden">
               <img src={profileData.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.email}`} className="w-full h-full object-cover" alt="Profile" />
            </div>
            <h3 className="text-white font-bold text-xl mb-1">{profileData.username || currentUser?.displayName}</h3>
            <p className="text-yellow-200 text-sm mb-8 opacity-80">{currentUser?.email}</p>
            <div className="space-y-3">
              {role === "admin" && <button onClick={() => navigate("/admin")} className="w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold">Admin Panel</button>}
              <button onClick={() => logout()} className="w-full bg-red-600 text-white py-3 rounded-2xl font-semibold">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className={`absolute top-2 left-0 right-0 w-full z-30 pointer-events-none transition-opacity duration-300 ${chatOpen ? "opacity-0 invisible md:opacity-100 md:visible" : "opacity-100 visible"}`}>
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-start">
          <div className="flex items-start">
            <div className="w-2 h-28 md:h-48 bg-gradient-to-b from-zinc-300 to-zinc-700 rounded-full shadow-lg"></div>
            <div className="relative w-28 h-20 md:w-56 md:h-36 overflow-hidden rounded-sm animate-flagWave origin-left -ml-1 mt-1 shadow-2xl">
              <img src={flagImg} alt="Flag" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex-1 flex justify-center items-start mt-14 md:mt-4 pointer-events-auto">
            <button onClick={triggerFlowers} className="whitespace-nowrap px-4 py-2 md:px-12 md:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] md:text-xl font-black uppercase tracking-widest rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all mx-2">View Banner</button>
          </div>
          <div className="w-16 md:hidden"></div>
        </div>
      </div>

      {/* --- BANNER --- */}
      {showBanner && (
        <div className="fixed inset-0 z-[200] flex justify-center items-start pt-20 backdrop-blur-md animate-fadeIn" onClick={() => setShowBanner(false)}>
          <button className="absolute top-4 right-4 z-[210] bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-2xl">✕ CLOSE</button>
          <div className="relative w-full max-w-[95vw] md:max-w-[480px] animate-unroll shadow-2xl origin-top rounded-b-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={bannerImg} alt="Banner" className="w-full h-auto max-h-[85vh] object-contain" />
          </div>
        </div>
      )}

      {/* --- DASHBOARD --- */}
      <div className="relative w-full max-w-6xl px-4 z-10 mt-28 md:mt-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 mx-auto bg-black/20 backdrop-blur-md">
            <div className="px-8 py-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase">TripSync</h1>
                <p className="text-sm text-yellow-200 font-bold tracking-widest">CSE Warriors '26</p>
              </div>
              <div onClick={() => setShowProfile(true)} className="w-12 h-12 rounded-xl border-2 border-cyan-400 overflow-hidden cursor-pointer hover:scale-110 transition shadow-lg">
                <img src={profileData.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.email}`} className="w-full h-full object-cover" alt="" />
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              <div onClick={() => navigate("/navigation")} className="w-full h-44 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:bg-white/10 shadow-inner">📍 Open Live Navigation Map</div>
              <div className="grid grid-cols-2 gap-6">
                <button onClick={() => navigate("/attendance")} className="h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl text-white font-bold shadow-lg">📝 Attendance</button>
                <button onClick={handleEmergency} className="h-32 bg-gradient-to-r from-red-600 to-red-500 rounded-3xl text-white font-bold shadow-lg active:scale-95 transition-all">🚨 Emergency</button>
              </div>

              {/* DYNAMIC TRIP TIMER */}
              <TripTimer />
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