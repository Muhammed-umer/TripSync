// ./src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import {
  doc,
  getDoc,
} from "firebase/firestore";

import beachImage from "../assets/beach.png";
import SupportChat from "./SupportChat";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, logout, role } = useAuth();

  const [profileData, setProfileData] = useState({});
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!currentUser) return;
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) setProfileData(userDoc.data());
    };
    fetchUser();
  }, [currentUser]);

  const handleEmergency = () => {
    alert("Emergency triggered");
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  return (
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