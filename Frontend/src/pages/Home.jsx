// ./src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import { doc, getDoc, collection, addDoc, onSnapshot, query, where } from "firebase/firestore";
import vagamonNight from "../assets/vagamon-night.jpg";
import SupportChat from "./SupportChat";

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
  const [profileData, setProfileData] = useState({ photoURL: "" });

  useEffect(() => {
    const fetchUser = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) setProfileData(userDoc.data());
      }
    };
    fetchUser();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const tenMinsAgo = Date.now() - 10 * 60 * 1000;
    const q = query(
      collection(db, "emergency_alerts"),
      where("timestamp", ">=", tenMinsAgo)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const alertData = change.doc.data();
          if (alertData.senderId !== currentUser.uid) {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const myLat = position.coords.latitude;
                  const myLon = position.coords.longitude;
                  const distance = calculateDistance(myLat, myLon, alertData.latitude, alertData.longitude);

                  let distStr = distance >= 1000
                    ? (distance / 1000).toFixed(1) + " km"
                    : Math.round(distance) + " meters";

                  alert(`EMERGENCY: ${alertData.senderName} needs help! They are ${distStr} away from you.`);
                },
                (error) => {
                  console.error("Location error for distance calcs: ", error);
                  alert(`EMERGENCY: ${alertData.senderName} needs help!`);
                },
                { enableHighAccuracy: true }
              );
            } else {
              alert(`EMERGENCY: ${alertData.senderName} needs help!`);
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleEmergency = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await addDoc(collection(db, "emergency_alerts"), {
            senderId: currentUser.uid,
            senderName: profileData.name || profileData.displayName || currentUser?.displayName || "Unknown",
            senderPhoto: profileData.photoURL || currentUser?.photoURL || "",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now()
          });
          alert("Emergency alert sent successfully!");
        } catch (error) {
          console.error("Error sending alert: ", error);
          alert("Failed to send emergency alert.");
        }
      },
      (error) => {
        console.error("Error getting location: ", error);
        alert("Failed to get location for emergency alert.");
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center overflow-x-hidden" style={{ backgroundImage: `url(${vagamonNight})` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-[#0B1D2A]/50 to-black/70"></div>

      <div className="relative z-10 w-[92%] max-w-6xl mx-auto py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Dashboard Card */}
          <div className="bg-[#0F1C2E]/80 backdrop-blur-md border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl w-full max-w-lg mx-auto">

            {/* Header with Profile Pic */}
            <div className="bg-gradient-to-r from-[#1B4332] to-[#0F3460] px-8 py-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-cyan-200">TripSync</h1>
                <p className="text-cyan-100 text-[10px] font-bold uppercase tracking-widest">College Expedition '26</p>
              </div>
              <div
                onClick={() => navigate("/profile")}
                className="w-12 h-12 rounded-xl border-2 border-cyan-400 overflow-hidden cursor-pointer hover:scale-110 transition shadow-lg"
              >
                {profileData.photoURL ? (
                  <img src={profileData.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-cyan-400 flex items-center justify-center font-bold">👤</div>
                )}
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Map Preview Card - Fixed Sizing */}
              <div
                onClick={() => navigate("/navigation")}
                className="w-full h-48 bg-black rounded-[2rem] overflow-hidden cursor-pointer border border-white/10 shadow-xl flex items-center justify-center hover:opacity-90 transition"
              >
                <span className="text-white text-lg font-bold">Open Live Navigation Map</span>
              </div>

              {/* Action Buttons - Fixed Sizing */}
              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => navigate("/attendance")}
                  className="h-36 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-xl hover:scale-[1.03] transition"
                >
                  <div className="text-3xl mb-2">📝</div>
                  <span className="font-bold text-sm">Attendance</span>
                </button>

                <button
                  onClick={handleEmergency}
                  className="h-36 bg-gradient-to-r from-red-600 to-red-500 rounded-[2rem] flex flex-col items-center justify-center text-white shadow-xl hover:scale-[1.03] transition"
                >
                  <div className="text-3xl mb-2 animate-pulse">🚨</div>
                  <span className="font-bold text-sm">Emergency</span>
                </button>
              </div>

              {/* Expedition Progress */}
              <div className="w-full bg-gradient-to-r from-[#1E3A5F] to-[#0F3460] rounded-[2rem] p-6 text-white border border-white/10 shadow-lg">
                <h3 className="font-black text-md text-cyan-200 mb-4">Current Expedition</h3>
                <div className="w-full h-2 bg-white/10 rounded-full">
                  <div className="h-full bg-emerald-400 rounded-full w-3/4"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <SupportChat />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;