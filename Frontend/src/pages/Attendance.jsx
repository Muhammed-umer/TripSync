// ./src/pages/Attendance.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

const Attendance = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [username, setUsername] = useState("");
  const [votes, setVotes] = useState({
    present: [],
    absent: [],
  });

  const [vote, setVote] = useState(null);

  const attendanceRef = doc(db, "attendance", "expedition1");

  // 🔹 Fetch username from users collection
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

  // 🔹 Real-time listener
  useEffect(() => {
    if (!username) return;

    const unsubscribe = onSnapshot(attendanceRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        const presentList = data.present || [];
        const absentList = data.absent || [];

        setVotes({
          present: presentList,
          absent: absentList,
        });

        if (presentList.some((u) => u.username === username)) {
          setVote("present");
        } else if (absentList.some((u) => u.username === username)) {
          setVote("absent");
        } else {
          setVote(null);
        }
      }
    });

    return () => unsubscribe();
  }, [username]);

  const handleVote = async (option) => {
  if (!username) return;

  const docSnap = await getDoc(attendanceRef);

  if (!docSnap.exists()) {
    console.error("Attendance document does not exist!");
    return;
  }

  const data = docSnap.data();

  const presentList = data.present || [];
  const absentList = data.absent || [];

  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Remove user from both lists
  const updatedPresent = presentList.filter(
    (u) => u.username !== username
  );

  const updatedAbsent = absentList.filter(
    (u) => u.username !== username
  );

  const voteObject = {
    username,
    time: timeString,
  };

  if (option === "present") {
    updatedPresent.push(voteObject);
  } else {
    updatedAbsent.push(voteObject);
  }

  await updateDoc(attendanceRef, {
    present: updatedPresent,
    absent: updatedAbsent,
  });
};

  const totalVotes = votes.present.length + votes.absent.length;

  const getPercentage = (count) => {
    if (totalVotes === 0) return 0;
    return ((count / totalVotes) * 100).toFixed(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1D2A] via-black to-[#0B1D2A] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0F1C2E]/90 backdrop-blur-md 
                      border border-white/10 rounded-3xl p-8 shadow-2xl text-white">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-emerald-300">
            Attendance Poll
          </h2>
          <button
            onClick={() => navigate("/home")}
            className="text-sm bg-emerald-600 px-4 py-1 rounded-lg hover:bg-emerald-500 transition"
          >
            Back
          </button>
        </div>

        <p className="text-sm mb-6 text-cyan-200">
          Are you attending today’s expedition?
        </p>

        {/* PRESENT */}
<div
  onClick={() => handleVote("present")}
  className={`cursor-pointer rounded-xl border p-4 mb-6 transition
    ${vote === "present"
      ? "border-emerald-400 bg-emerald-500/10"
      : "border-emerald-400/30 hover:bg-white/5"}
  `}
>
  <div className="flex justify-between items-center">
    <span className="font-semibold">
      Present ({votes.present.length})
    </span>
  </div>

  <div className="mt-4 text-xs space-y-2">
    {votes.present.map((user, i) => (
      <div key={i} className="flex justify-between">
        <span>• {user.username}</span>
        <span className="text-gray-400">{user.time}</span>
      </div>
    ))}
  </div>
</div>

        {/* ABSENT */}
<div
  onClick={() => handleVote("absent")}
  className={`cursor-pointer rounded-xl border p-4 transition
    ${vote === "absent"
      ? "border-red-400 bg-red-500/10"
      : "border-red-400/30 hover:bg-white/5"}
  `}
>
  <div className="flex justify-between items-center">
    <span className="font-semibold">
      Absent ({votes.absent.length})
    </span>
  </div>

  <div className="mt-4 text-xs space-y-2">
    {votes.absent.map((user, i) => (
      <div key={i} className="flex justify-between">
        <span>• {user.username}</span>
        <span className="text-gray-400">{user.time}</span>
      </div>
    ))}
  </div>
</div>

      </div>
    </div>
  );
};

export default Attendance;