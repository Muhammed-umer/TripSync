import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Profile
          </h2>

          <button
            onClick={() => navigate("/home")}
            className="text-sm text-indigo-600 hover:underline"
          >
            Back
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center space-y-4 mb-6">

          <img
            src={
              currentUser?.photoURL ||
              "https://i.pravatar.cc/150?img=12"
            }
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
          />

          <h3 className="text-lg font-semibold text-gray-800">
            {currentUser?.displayName || "User"}
          </h3>

          <p className="text-gray-500 text-sm">
            {currentUser?.email}
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition shadow-md"
        >
          Logout
        </button>

      </div>
    </div>
  );
};

export default Profile;