// ./src/pages/AdminAbsent.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminAbsent = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState([]);

  useEffect(() => {
    if (role !== "admin") return;

    const fetchData = async () => {
      const snapshot = await getDocs(
        collection(db, "attendance", "expedition1", "votes")
      );

      const absentUsers = snapshot.docs
        .map(doc => doc.data())
        .filter(data => data.status === "absent");

      setList(absentUsers);
    };

    fetchData();
  }, [role]);

  if (role !== "admin") {
    return <h2 className="text-white text-center mt-10">Access Denied</h2>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-2xl w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Absent List
        </h1>

        {list.length === 0 ? (
          <p className="text-center">No users</p>
        ) : (
          list.map((user, index) => (
            <div key={index} className="border-b py-2">
              {user.username}
            </div>
          ))
        )}

        <button
          onClick={() => navigate("/admin/attendance")}
          className="w-full py-3 bg-gray-700 rounded-xl mt-6"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default AdminAbsent;