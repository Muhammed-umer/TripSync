// ./src/pages/Admin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import trekkingBg from "../assets/trekking.png";

const Admin = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h2 className="text-2xl font-semibold">Access Denied</h2>
      </div>
    );
  }

  const handleResetAttendance = async () => {
    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "attendance"));

      const resetPromises = snapshot.docs.map((docSnap) =>
        updateDoc(doc(db, "attendance", docSnap.id), {
          present: [],
          absent: []
        })
      );

      await Promise.all(resetPromises);

      setLoading(false);
      setShowConfirm(false);
      setShowToast(true);

      setTimeout(() => setShowToast(false), 3000);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${trekkingBg})` }}
    >
      {/* Page Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70"></div>

      {/* 🔥 Toast (Premium Style) */}
      {showToast && (
        <div className="fixed top-6 right-6 bg-emerald-600/90 backdrop-blur-lg text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/20 animate-slideIn z-50">
          Attendance Reset Successfully
        </div>
      )}

      {/* 🔥 Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-3xl p-8 w-[340px] text-center shadow-2xl animate-scaleIn">

            <h2 className="text-xl font-bold mb-3 tracking-wide">
              Reset Attendance?
            </h2>

            <p className="text-sm text-white/70 mb-6">
              This action will permanently clear all present and absent records.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition"
              >
                Cancel
              </button>

              <button
                onClick={handleResetAttendance}
                disabled={loading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition shadow-lg"
              >
                {loading ? "Resetting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 Admin Card */}
      <div className="relative w-[420px] h-[520px] rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/20">

        <img
          src={trekkingBg}
          alt="Trekking"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70"></div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-white text-center">

          <h1 className="text-3xl font-bold mb-12 tracking-wide">
            Admin Control
          </h1>

          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-3 bg-red-600 hover:bg-red-700 transition-all duration-300 rounded-2xl mb-6 font-semibold shadow-lg hover:scale-[1.02]"
          >
            Reset Attendance
          </button>

          <button
            onClick={() => navigate("/home")}
            className="w-full py-3 bg-white/10 hover:bg-white/20 transition-all duration-300 rounded-2xl font-medium border border-white/20"
          >
            Back
          </button>

        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }

          @keyframes scaleIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }

          .animate-slideIn {
            animation: slideIn 0.4s ease-out;
          }

          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default Admin;