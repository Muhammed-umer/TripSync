// ./src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import vagamonNight from "../assets/vagamon-night.jpg";
import SupportChat from "./SupportChat";

const Home = () => {
  const navigate = useNavigate();

  const handleEmergency = () => {
    alert("Emergency triggered!");
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${vagamonNight})` }}
    >
      {/* Night Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-[#0B1D2A]/50 to-black/70"></div>

      {/* Controlled Width Container */}
      <div className="relative z-10 
                      w-[92%] sm:w-[90%] lg:w-[85%] 
                      max-w-6xl 
                      mx-auto 
                      px-4 sm:px-6 lg:px-0 
                      py-16">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* ================= LEFT MAIN TOUR CARD ================= */}
          <div className="bg-[#0F1C2E]/80 backdrop-blur-md 
                          border border-white/10 
                          rounded-[3rem] 
                          overflow-hidden 
                          shadow-[0_40px_100px_rgba(0,0,0,0.8)] 
                          w-full 
                          max-w-lg 
                          mx-auto">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-[#1B4332] to-[#0F3460] 
                            px-8 py-8 
                            flex justify-between items-center">

              <div>
                <h1 className="text-2xl font-black text-cyan-200 drop-shadow-md">
                  TripSync
                </h1>
                <p className="text-cyan-100 text-xs font-bold uppercase tracking-widest">
                  College Expedition '26
                </p>
              </div>

              <div
                onClick={() => navigate("/profile")}
                className="w-12 h-12 bg-gradient-to-br 
                           from-cyan-400 to-teal-300 
                           rounded-xl 
                           shadow-lg 
                           flex items-center 
                           justify-center 
                           cursor-pointer 
                           hover:scale-110 
                           transition 
                           text-black font-bold"
              >
                👤
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-10 space-y-10">

              {/* MAP PREVIEW */}
              <div
                onClick={() => navigate("/navigation")}
                className="w-full 
                           rounded-[2rem] 
                           overflow-hidden 
                           cursor-pointer 
                           shadow-xl 
                           border border-white/10"
              >
                <div className="h-48 bg-black 
                                flex items-center justify-center 
                                text-white text-lg font-bold">
                  Open Live Navigation Map
                </div>
              </div>

              {/* EMERGENCY BUTTON */}
              <button
                onClick={handleEmergency}
                className="w-full h-36 
                           bg-gradient-to-r from-red-600 to-red-500 
                           rounded-[2rem] 
                           shadow-2xl 
                           flex flex-col 
                           items-center 
                           justify-center 
                           gap-4 
                           text-white 
                           hover:scale-[1.02] 
                           transition"
              >
                <div className="w-14 h-14 bg-red-700 
                                rounded-2xl 
                                flex items-center 
                                justify-center 
                                text-3xl 
                                animate-pulse">
                  🚨
                </div>
                <span className="font-bold text-lg">
                  Emergency Help
                </span>
              </button>

              {/* CURRENT EXPEDITION */}
              <div className="w-full 
                              bg-gradient-to-r from-[#1E3A5F] to-[#0F3460] 
                              rounded-[2rem] 
                              p-8 
                              text-white 
                              shadow-xl 
                              border border-white/10">

                <div className="mb-4">
                  <h3 className="font-black text-lg text-cyan-200">
                    Current Expedition
                  </h3>
                  <p className="text-cyan-100 text-xs font-bold uppercase mt-1">
                    Destination: Vagamon Hills
                  </p>
                </div>

                <div className="w-full h-[1px] bg-cyan-300/30 mb-6 rounded-full"></div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-semibold text-cyan-100">
                    <span>Distance Progress</span>
                    <span>75%</span>
                  </div>

                  <div className="w-full h-3 bg-white/10 rounded-full">
                    <div className="h-full bg-emerald-400 rounded-full w-3/4"></div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* CHAT SECTION */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <SupportChat />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;