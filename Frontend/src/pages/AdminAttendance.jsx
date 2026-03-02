// ./src/pages/AdminAttendance.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import campfireBg from "../assets/campfire.png";

const AdminAttendance = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const votesRef = collection(db, "attendance", "expedition1", "votes");

  const fetchCounts = async () => {
    const snapshot = await getDocs(votesRef);

    let present = 0;
    let absent = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === "present") present++;
      if (data.status === "absent") absent++;
    });

    setPresentCount(present);
    setAbsentCount(absent);
  };

  useEffect(() => {
    if (role === "admin") {
      fetchCounts();
    }
  }, [role]);

  if (role !== "admin") {
    return (
      <h2 className="text-white text-center mt-10">
        Access Denied
      </h2>
    );
  }

  const handleReset = () => setShowConfirm(true);

  const confirmReset = async () => {
    const snapshot = await getDocs(votesRef);

    for (const voteDoc of snapshot.docs) {
      await deleteDoc(
        doc(db, "attendance", "expedition1", "votes", voteDoc.id)
      );
    }

    setPresentCount(0);
    setAbsentCount(0);
    setShowConfirm(false);

    setToastMessage("Attendance Reset Successfully");
    setTimeout(() => setToastMessage(""), 2000);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative flex items-center justify-center p-6"
      style={{ backgroundImage: `url(${campfireBg})` }}
    >
      {/* Soft overlay (lighter now) */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-500 px-6 py-3 rounded-xl shadow-xl z-50 text-white">
          {toastMessage}
        </div>
      )}

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md
                      bg-white/10 backdrop-blur-md
                      border border-white/20
                      rounded-3xl p-8 shadow-2xl text-white">

        <h1 className="text-3xl font-bold mb-6 text-center text-orange-300">
          Expedition Attendance
        </h1>

        {/* Present */}
        <button
          onClick={() => navigate("/admin/attendance/present")}
          className="w-full py-3 
                     bg-gradient-to-r from-green-500 to-emerald-600
                     hover:from-green-400 hover:to-emerald-500
                     transition rounded-xl mb-4 font-semibold"
        >
          Present ({presentCount})
        </button>

        {/* Absent */}
        <button
          onClick={() => navigate("/admin/attendance/absent")}
          className="w-full py-3 
                     bg-gradient-to-r from-red-500 to-orange-600
                     hover:from-red-400 hover:to-orange-500
                     transition rounded-xl mb-6 font-semibold"
        >
          Absent ({absentCount})
        </button>

        {/* Reset + Back */}
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="flex-1 py-3 
                       bg-gradient-to-r from-yellow-500 to-amber-600
                       hover:from-yellow-400 hover:to-amber-500
                       transition rounded-xl font-semibold"
          >
            Reset
          </button>

          <button
            onClick={() => navigate("/admin")}
            className="flex-1 py-3 
                       bg-gray-700/80 hover:bg-gray-600
                       transition rounded-xl font-semibold"
          >
            Back
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl w-80 text-center border border-white/20 text-white">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to reset attendance?
            </h2>

            <div className="flex gap-4">
              <button
                onClick={confirmReset}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 transition rounded-xl"
              >
                Confirm
              </button>

              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 transition rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAttendance;