// ./src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
<<<<<<< HEAD
import {
  doc,
  getDoc,
} from "firebase/firestore";

import beachImage from "../assets/beach.png";
=======
import { doc, getDoc, collection, addDoc, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";
import vagamonNight from "../assets/vagamon-night.jpg";
>>>>>>> c1a134fffa6d2153c6afd2148a3eb7a92f15df03
import SupportChat from "./SupportChat";
import EmergencyPopup from "../components/EmergencyPopup";
import { useLocation } from "./useLocation";

<<<<<<< HEAD
const Home = () => {
  const navigate = useNavigate();
  const { currentUser, logout, role } = useAuth();

  const [profileData, setProfileData] = useState({});
  const [showProfile, setShowProfile] = useState(false);
=======
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;


  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) *
    Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
};

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const location = useLocation();
  const [profileData, setProfileData] = useState({ photoURL: "" });
  const [emergencyPopup, setEmergencyPopup] = useState({ isOpen: false, message: "" });

  const showEmergencyPopup = (msg) => setEmergencyPopup({ isOpen: true, message: msg });
>>>>>>> c1a134fffa6d2153c6afd2148a3eb7a92f15df03

  useEffect(() => {
    const fetchUser = async () => {
      if (!currentUser) return;
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) setProfileData(userDoc.data());
    };
    fetchUser();
  }, [currentUser]);

<<<<<<< HEAD
  const handleEmergency = () => {
    alert("Emergency triggered");
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
=======
  useEffect(() => {
    if (!currentUser) return;

    const tenMinsAgo = Date.now() - 10 * 60 * 1000;
    const q = query(
      collection(db, "emergencies"),
      where("timestamp", ">=", tenMinsAgo)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === "added") {
          const alertData = change.doc.data();
          if (alertData.uid !== currentUser.uid) {

            // 4. Fallback: If name is missing, fetch from 'users' collection
            let senderName = alertData.name;
            if (!senderName || senderName === "Unknown") {
              try {
                const userDoc = await getDoc(doc(db, "users", alertData.uid));
                if (userDoc.exists()) {
                  senderName = userDoc.data().name || userDoc.data().username || "Someone";
                } else {
                  senderName = "Someone";
                }
              } catch (err) {
                senderName = "Someone";
              }
            }

            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const myLat = position.coords.latitude;
                  const myLon = position.coords.longitude;
                  const distance = calculateDistance(myLat, myLon, alertData.lat, alertData.lng);

                  let distStr = distance >= 1000
                    ? (distance / 1000).toFixed(1) + " km"
                    : Math.round(distance) + " meters";

                  showEmergencyPopup(`EMERGENCY: ${senderName} needs help! They are ${distStr} away from you.`);
                },
                (error) => {
                  console.error("Location error for distance calcs: ", error);
                  showEmergencyPopup(`EMERGENCY: ${senderName} needs help!`);
                },
                { enableHighAccuracy: true }
              );
            } else {
              showEmergencyPopup(`EMERGENCY: ${senderName} needs help!`);
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleEmergency = async () => {
    if (!location) {
      showEmergencyPopup("Getting precise location... Please try again in a few seconds.");
      return;
    }

    try {
      const { lat, lng } = location;

      // 1. Store only required fields when triggering emergency
      await addDoc(collection(db, "emergencies"), {
        uid: currentUser.uid,
        name: currentUser.displayName || profileData.name || profileData.username || "Unknown",
        lat,
        lng,
        timestamp: serverTimestamp()
      });

      showEmergencyPopup(`🚨 Emergency triggered successfully! Friends and nearby users have been notified.`);
    } catch (error) {
      console.error("Error sending alert: ", error);
      showEmergencyPopup("Failed to send emergency alert.");
>>>>>>> c1a134fffa6d2153c6afd2148a3eb7a92f15df03
    }
  };

  return (
<<<<<<< HEAD
    <div
      className="min-h-screen flex justify-center items-start py-10 bg-cover bg-center"
      style={{
        backgroundImage: `url(${beachImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
=======
    <div className="relative min-h-screen bg-cover bg-center overflow-x-hidden" style={{ backgroundImage: `url(${vagamonNight})` }}>
      <EmergencyPopup
        isOpen={emergencyPopup.isOpen}
        message={emergencyPopup.message}
        onClose={() => setEmergencyPopup({ ...emergencyPopup, isOpen: false })}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-[#0B1D2A]/50 to-black/70"></div>
>>>>>>> c1a134fffa6d2153c6afd2148a3eb7a92f15df03

          {/* MAIN CARD */}
          <div
            className="relative w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl border border-white/30 mx-auto"
            style={{
              backgroundImage: `url(${beachImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(1.08) contrast(1.05)",
            }}
          >
            <div className="absolute inset-0 bg-black/25"></div>

            <div className="relative z-10">

              {/* Header */}
              <div className="px-8 py-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">TripSync</h1>
                  <p className="text-sm text-yellow-200">
                    College Expedition '26
                  </p>
                </div>

                <div
                  onClick={() => setShowProfile(!showProfile)}
                  className="w-12 h-12 rounded-xl border-2 border-cyan-400 overflow-hidden cursor-pointer hover:scale-110 transition"
                >
                  {profileData.photoURL ? (
                    <img
                      src={profileData.photoURL}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-cyan-400 flex items-center justify-center">
                      👤
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-8">

                {/* Profile Popup */}
                {showProfile && (
                  <div className="relative w-full bg-black/30 rounded-3xl p-6 text-center border border-white/40">
                    <button
                      onClick={() => setShowProfile(false)}
                      className="absolute top-4 right-4 text-white text-lg"
                    >
                      ✕
                    </button>

                    {profileData.photoURL && (
                      <img
                        src={profileData.photoURL}
                        alt="Profile"
                        className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-cyan-400 object-cover"
                      />
                    )}

                    <h3 className="text-white font-bold text-lg">
                      {profileData.username || currentUser.displayName}
                    </h3>

                    <p className="text-yellow-200 text-sm mb-4">
                      {currentUser.email}
                    </p>

                    {role === "admin" && (
                      <button
                        onClick={() => navigate("/admin")}
                        className="w-full mb-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-xl"
                      >
                        Admin Panel
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2 rounded-xl"
                    >
                      Logout
                    </button>
                  </div>
                )}

                {/* Navigation */}
                <div
                  onClick={() => navigate("/navigation")}
                  className="w-full h-44 bg-black/40 rounded-3xl flex items-center justify-center text-white font-semibold cursor-pointer"
                >
                  Open Live Navigation Map
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-6">
                  <button
                    onClick={() => navigate("/attendance")}
                    className="h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl text-white font-semibold shadow-lg"
                  >
                    📝 Attendance
                  </button>

                  <button
                    onClick={handleEmergency}
                    className="h-32 bg-gradient-to-r from-red-600 to-red-500 rounded-3xl text-white font-semibold shadow-lg"
                  >
                    🚨 Emergency
                  </button>
                </div>

                {/* Current Expedition */}
                <div className="w-full bg-gradient-to-r from-[#1E3A5F]/80 to-[#0F3460]/80 backdrop-blur-md rounded-3xl p-6 text-white border border-white/20 shadow-xl">

                  <h3 className="font-bold text-lg text-cyan-200 mb-2">
                    Current Expedition
                  </h3>

                  <p className="text-xs text-cyan-100 mb-4">
                    DESTINATION: VAGAMON HILLS
                  </p>

                  <div className="flex justify-between text-sm mb-2">
                    <span>Distance Progress</span>
                    <span>75%</span>
                  </div>

                  <div className="w-full h-2 bg-white/20 rounded-full">
                    <div className="h-full bg-emerald-400 rounded-full w-[75%]"></div>
                  </div>

                </div>

              </div>
            </div>
          </div>

          {/* Support Chat */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <SupportChat />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;