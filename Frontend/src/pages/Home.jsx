// ./src/pages/Home.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import confetti from "canvas-confetti";

import beachImage from "../assets/beach.png";
import SupportChat from "./SupportChat";
import bannerImg from "../assets/banner.png";
import flagImg from "../assets/flag.png";

const Home = () => {

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [profileData, setProfileData] = useState({});
  const [showProfile, setShowProfile] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

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
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ["#ff0055", "#ffcc00", "#33ff00"],
        zIndex: 300
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ["#ff0055", "#ffcc00", "#33ff00"],
        zIndex: 300
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }

    })();
  };

  return (
    <div
      className="relative min-h-screen flex justify-center items-start py-6 md:py-10 bg-cover bg-center overflow-x-hidden"
      style={{
        backgroundImage: `url(${beachImage})`,
        backgroundAttachment: "fixed"
      }}
    >

      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* HEADER AREA */}

      <div
        className={`absolute top-2 left-0 right-0 w-full z-30 pointer-events-none transition-opacity duration-300 ${
          chatOpen
            ? "opacity-0 invisible md:opacity-100 md:visible"
            : "opacity-100 visible"
        }`}
      >

        <div className="max-w-6xl mx-auto px-4 flex justify-between items-start gap-4">

          {/* FLAG SECTION */}

          <div className="flex items-start">

            {/* Stick */}

            <div className="w-2 h-28 md:h-48 bg-gradient-to-b from-zinc-300 to-zinc-700 rounded-full shadow-lg"></div>

            {/* Flag */}

            <div className="relative w-28 h-20 md:w-56 md:h-36 overflow-hidden rounded-sm shadow-2xl border-y border-r border-white/10 animate-flagWave origin-left -ml-1 mt-1">

              <img
                src={flagImg}
                alt="Tamil Nadu flag waving"
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10"></div>

            </div>

          </div>

          {/* BUTTON */}

          <div className="flex-1 flex justify-center items-start mt-14 md:mt-4 pointer-events-auto">

            <button
              onClick={triggerFlowers}
              className="whitespace-nowrap px-4 py-2 md:px-12 md:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] md:text-xl font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/50 hover:scale-110 active:scale-95 transition-all mx-2"
            >
              View Banner
            </button>

          </div>

          <div className="w-16 md:hidden"></div>

        </div>

      </div>

      {/* BANNER MODAL */}

      {showBanner && (

        <div
          className="fixed inset-0 z-[200] flex justify-center items-start pt-20 md:pt-12 px-2 md:px-6 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowBanner(false)}
        >

          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-4 right-4 z-[210] bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-2xl hover:bg-red-700 border border-white/20"
          >
            ✕ CLOSE
          </button>

          <div
            className="relative w-full max-w-[95vw] md:max-w-[480px] animate-unroll shadow-[0_0_100px_rgba(0,0,0,0.8)] origin-top rounded-b-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            <img
              src={bannerImg}
              alt="Event Banner"
              className="w-full h-auto max-h-[85vh] object-contain border-x-4 border-b-4 border-white/20"
            />

          </div>

        </div>

      )}

      {/* DASHBOARD */}

      <div className="relative w-full max-w-6xl px-4 z-10 mt-28 md:mt-36">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* LEFT PANEL */}

          <div className="relative w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 mx-auto bg-black/20 backdrop-blur-md">

            <div className="relative z-10">

              <div className="px-8 py-6 flex justify-between items-center">

                <div>
                  <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
                    TripSync
                  </h1>

                  <p className="text-sm text-yellow-200 font-bold tracking-widest">
                    CSE Warriors '26
                  </p>
                </div>

                <div
                  onClick={() => setShowProfile(true)}
                  className="w-12 h-12 rounded-xl border-2 border-cyan-400 overflow-hidden cursor-pointer hover:scale-110 transition shadow-lg"
                >

                  <img
                    src={
                      profileData.photoURL ||
                      `https://ui-avatars.com/api/?name=${currentUser?.email}`
                    }
                    className="w-full h-full object-cover"
                    alt="User Profile"
                  />

                </div>

              </div>

              <div className="p-8 space-y-8">

                <div
                  onClick={() => navigate("/navigation")}
                  className="w-full h-44 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:bg-white/10 shadow-inner"
                >
                  📍 Open Live Navigation Map
                </div>

                <div className="grid grid-cols-2 gap-6">

                  <button
                    onClick={() => navigate("/attendance")}
                    className="h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl text-white font-bold shadow-lg"
                  >
                    📝 Attendance
                  </button>

                  <button className="h-32 bg-gradient-to-r from-red-600 to-red-500 rounded-3xl text-white font-bold shadow-lg">
                    🚨 Emergency
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* CHAT */}

          <div className="w-full max-w-md mx-auto lg:mx-0">
            <SupportChat onToggle={setChatOpen} />
          </div>

        </div>

      </div>

      <style>{`

        @keyframes flagWave {
          0%,100% { transform: skewY(0deg); }
          50% { transform: skewY(8deg) scaleX(1.05); }
        }

        @keyframes unroll {
          0% { transform: scaleY(0); opacity:0 }
          100% { transform: scaleY(1); opacity:1 }
        }

        .animate-flagWave {
          animation: flagWave 4s ease-in-out infinite;
        }

        .animate-unroll {
          animation: unroll 1.5s cubic-bezier(0.1,0.8,0.2,1) forwards;
        }

      `}</style>

    </div>
  );
};

export default Home;