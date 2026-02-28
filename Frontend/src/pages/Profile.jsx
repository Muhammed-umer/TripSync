import React from "react";
import { useNavigate } from "react-router-dom";
import vagamonNight from "../assets/vagamon-night.jpg";

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${vagamonNight})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-indigo-950/70 to-black/80"></div>

      <div className="relative z-10 flex justify-center items-center h-screen">
        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] p-10 w-96 text-white shadow-2xl space-y-6">

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Profile</h2>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-indigo-300 hover:text-white"
            >
              Back
            </button>
          </div>

          <div className="text-center space-y-3">
            <div className="w-24 h-24 bg-indigo-600 rounded-full mx-auto flex items-center justify-center text-3xl font-bold">
              T
            </div>

            <h3 className="text-lg font-bold">Tamilvani</h3>
            <p className="text-indigo-300 text-sm">Member</p>
          </div>

          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> tamil@example.com</p>
            <p><strong>Status:</strong> Active</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;