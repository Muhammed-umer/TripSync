// ./src/pages/AdminPresent.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminPresent = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState([]);

  useEffect(() => {
    if (role !== "admin") return;

    const votesRef = collection(
      db,
      "attendance",
      "expedition1",
      "votes"
    );

    const unsubscribe = onSnapshot(votesRef, (snapshot) => {
      const presentUsers = snapshot.docs
        .map(doc => doc.data())
        .filter(data => data.status === "present");

      setList(presentUsers);
    });

    return () => unsubscribe();
  }, [role]);

  if (role !== "admin") {
    return <h2 className="text-white text-center mt-10">Access Denied</h2>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1D2A] via-black to-[#0B1D2A] flex items-center justify-center p-6 text-white">

      <div className="w-full max-w-md bg-[#0F1C2E]/90 backdrop-blur-md 
                      border border-white/10 rounded-3xl p-8 shadow-2xl">

        <h1 className="text-2xl font-bold mb-6 text-center text-emerald-400">
          Present List ({list.length})
        </h1>

        <div className="bg-[#0B1D2A] rounded-2xl p-5 border border-white/10 max-h-60 overflow-y-auto mb-6">

          {list.length === 0 ? (
            <p className="text-center text-gray-400">
              No users marked present.
            </p>
          ) : (
            <ul className="list-disc list-inside space-y-2 text-left">
              {list.map((user, index) => (
                <li key={index}>
                  {user.username}
                </li>
              ))}
            </ul>
          )}

        </div>

        <button
          onClick={() => navigate("/admin/attendance")}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 transition rounded-xl"
        >
          Back
        </button>

      </div>
    </div>
  );
};

export default AdminPresent;