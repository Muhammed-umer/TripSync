// ./src/pages/AdminAttendance.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const AdminAttendance = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);

  const [showConfirm, setShowConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const votesRef = collection(
    db,
    "attendance",
    "expedition1",
    "votes"
  );

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

  const handleReset = () => {
    setShowConfirm(true);
  };

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

    setTimeout(() => {
      setToastMessage("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1D2A] via-black to-[#0B1D2A] flex items-center justify-center p-6 text-white">

      {/* Toast Message (Top Right) */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-600 px-6 py-3 rounded-xl shadow-xl z-50">
          {toastMessage}
        </div>
      )}

      <div className="w-full max-w-md bg-[#0F1C2E]/90 backdrop-blur-md 
                      border border-white/10 rounded-3xl p-8 shadow-2xl">

        <h1 className="text-2xl font-bold mb-6 text-center text-emerald-400">
          Attendance
        </h1>

        {/* Present Button */}
        <button
          onClick={() => navigate("/admin/attendance/present")}
          className="w-full py-3 bg-green-600 hover:bg-green-500 transition rounded-xl mb-4"
        >
          Present ({presentCount})
        </button>

        {/* Absent Button */}
        <button
          onClick={() => navigate("/admin/attendance/absent")}
          className="w-full py-3 bg-red-600 hover:bg-red-500 transition rounded-xl mb-6"
        >
          Absent ({absentCount})
        </button>

        {/* Reset + Back in Single Row */}
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 transition rounded-xl"
          >
            Reset
          </button>

          <button
            onClick={() => navigate("/admin")}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 transition rounded-xl"
          >
            Back
          </button>
        </div>

      </div>

      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0F1C2E] p-6 rounded-2xl w-80 text-center border border-white/10">
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