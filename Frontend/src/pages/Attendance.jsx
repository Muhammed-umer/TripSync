// ./src/pages/Attendance.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

const Attendance = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [username, setUsername] = useState("");
  const [vote, setVote] = useState(null);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);

  const votesRef = collection(
    db,
    "attendance",
    "expedition1",
    "votes"
  );

  // Get username
  useEffect(() => {
    const fetchUsername = async () => {
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        setUsername(userDoc.data().username);
      }
    };

    fetchUsername();
  }, [currentUser]);

  // Real-time vote listener
  useEffect(() => {
    const unsubscribe = onSnapshot(votesRef, (snapshot) => {
      let present = 0;
      let absent = 0;
      let userVote = null;

      snapshot.forEach((doc) => {
        const data = doc.data();

        if (data.status === "present") present++;
        if (data.status === "absent") absent++;

        if (doc.id === currentUser?.uid) {
          userVote = data.status;
        }
      });

      setPresentCount(present);
      setAbsentCount(absent);
      setVote(userVote);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleVote = async (status) => {
  if (!currentUser || vote) {
    alert("You have already voted.");
    return;
  }

  const voteRef = doc(
    db,
    "attendance",
    "expedition1",
    "votes",
    currentUser.uid
  );

  await setDoc(voteRef, {
    status,
    username,              // 🔥 ADD THIS
    timestamp: serverTimestamp()
  });
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-2xl w-96">

        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">Attendance Poll</h2>
          <button onClick={() => navigate("/home")}>Back</button>
        </div>

        {!vote ? (
  <>
    <div
      onClick={() => handleVote("present")}
      className="p-4 mb-4 rounded-xl border border-green-400/30 cursor-pointer"
    >
      Present ({presentCount})
    </div>

    <div
      onClick={() => handleVote("absent")}
      className="p-4 rounded-xl border border-red-400/30 cursor-pointer"
    >
      Absent ({absentCount})
    </div>
  </>
) : (
  <div className="p-4 rounded-xl border border-blue-400 bg-blue-500/10 text-center">
    You marked yourself as <strong className="capitalize">{vote}</strong>
  </div>
)}

      </div>
    </div>
  );
};

export default Attendance;