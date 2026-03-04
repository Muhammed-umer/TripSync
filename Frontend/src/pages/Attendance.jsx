// src/pages/Attendance.jsx

import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import campfireBg from "../assets/campfire.png";

const Attendance = () => {

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [username, setUsername] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [presentList, setPresentList] = useState([]);
  const [absentList, setAbsentList] = useState([]);
  const [clicked, setClicked] = useState(false);

  /* ---------------- Load Users ---------------- */

  useEffect(() => {

    const fetchUsers = async () => {

      const snapshot = await getDocs(collection(db, "users"));

      const users = snapshot.docs
        .map(doc => doc.data().username)
        .filter(Boolean);

      setAllUsers(users);

    };

    fetchUsers();

  }, []);

  /* ---------------- Current Username ---------------- */

  useEffect(() => {

    const fetchCurrentUser = async () => {

      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));

      if (userDoc.exists()) {
        setUsername(userDoc.data().username);
      }

    };

    fetchCurrentUser();

  }, [currentUser]);

  /* ---------------- Load Attendance ---------------- */

  useEffect(() => {

    const loadAttendance = async () => {

      const docRef = doc(db, "attendance", "today");
      const snap = await getDoc(docRef);

      let present = [];

      if (snap.exists()) {
        present = snap.data().present || [];
      }

      setPresentList(present);

      if (present.includes(username)) {
        setClicked(true);
      }

      const absent = allUsers
        .filter(name => !present.includes(name))
        .sort((a, b) => a.localeCompare(b));

      setAbsentList(absent);

    };

    if (allUsers.length > 0) loadAttendance();

  }, [allUsers, username]);

  /* ---------------- Mark Present ---------------- */

  const markPresent = async () => {

    if (clicked || !username) return;

    const docRef = doc(db, "attendance", "today");

    await setDoc(
      docRef,
      { present: arrayUnion(username) },
      { merge: true }
    );

    const updatedPresent = [...presentList, username];

    setPresentList(updatedPresent);

    const updatedAbsent = allUsers
      .filter(name => !updatedPresent.includes(name))
      .sort((a, b) => a.localeCompare(b));

    setAbsentList(updatedAbsent);

    setClicked(true);

  };

  return (

    <div className="min-h-screen bg-[#0F1C2E] text-white p-10">

      {/* -------- Title -------- */}

      <h1 className="text-4xl font-extrabold text-center mb-6 
               bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 
               bg-clip-text text-transparent drop-shadow-lg">
  Attendance
</h1>

      {/* -------- Buttons -------- */}

      <div className="flex justify-center gap-4 mb-10">

  {/* Present Button */}
  <button
    onClick={markPresent}
    disabled={clicked}
    className={`px-7 py-3 rounded-xl font-semibold text-white transition ${
      clicked
        ? "bg-gray-500 cursor-not-allowed"
        : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 shadow-lg"
    }`}
  >
    Present
  </button>

  {/* Back Button */}
  <button
    onClick={() => navigate("/home")}
    className="px-7 py-3 rounded-xl font-semibold text-white
               bg-gradient-to-r from-blue-500 to-indigo-600
               hover:from-blue-400 hover:to-indigo-500
               transition shadow-lg"
  >
    Back
  </button>

</div>

      {/* -------- Lists -------- */}

      <div className="grid grid-cols-2 gap-10">

        {/* -------- Absent Card -------- */}

        <div
          className="relative p-6 rounded-2xl overflow-hidden border border-orange-400/40 shadow-[0_0_25px_rgba(255,140,0,0.35)]"
          style={{
            backgroundImage: `url(${campfireBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >

          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70"></div>

          <div className="relative z-10">

            <h2 className="text-red-400 mb-4 text-xl font-semibold">
              Absent List
            </h2>

            <ol className="list-decimal list-inside space-y-2">

              {absentList.map((name, index) => (
                <li key={index}>{name}</li>
              ))}

            </ol>

          </div>

        </div>

        {/* -------- Present Card -------- */}

        <div
          className="relative p-6 rounded-2xl overflow-hidden border border-orange-400/40 shadow-[0_0_25px_rgba(255,140,0,0.35)]"
          style={{
            backgroundImage: `url(${campfireBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >

          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70"></div>

          <div className="relative z-10">

            <h2 className="text-emerald-400 mb-4 text-xl font-semibold">
              Present List
            </h2>

            <ol className="list-decimal list-inside space-y-2">

              {presentList.map((name, index) => (
                <li key={index}>{name}</li>
              ))}

            </ol>

          </div>

        </div>

      </div>

    </div>

  );

};

export default Attendance;