// ./src/pages/Admin.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Admin = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  if (role !== "admin") {
    return <h2 className="text-white text-center mt-10">Access Denied</h2>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-2xl w-96 text-center">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

        <button
          onClick={() => navigate("/admin/attendance")}
          className="w-full py-3 bg-blue-600 rounded-xl mb-4"
        >
          Attendance
        </button>

        <button
          onClick={() => navigate("/home")}
          className="w-full py-3 bg-gray-700 rounded-xl"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default Admin;