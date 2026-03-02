// ./src/pages/Admin.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import trekkingBg from "../assets/trekking.png";

const Admin = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h2 className="text-2xl font-semibold">Access Denied</h2>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${trekkingBg})` }}
    >
      {/* Soft dark overlay for page */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Card */}
      <div className="relative w-[420px] h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-white/20">

        {/* Same Image Inside Card */}
        <img
          src={trekkingBg}
          alt="Trekking"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Card Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-white text-center">

          <h1 className="text-3xl font-bold mb-8 tracking-wide">
            Admin Panel
          </h1>

          <button
            onClick={() => navigate("/admin/attendance")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition-all duration-300 rounded-2xl mb-4 font-medium shadow-lg"
          >
            Attendance
          </button>

          <button
            onClick={() => navigate("/home")}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 transition-all duration-300 rounded-2xl font-medium"
          >
            Back
          </button>

        </div>
      </div>
    </div>
  );
};

export default Admin;