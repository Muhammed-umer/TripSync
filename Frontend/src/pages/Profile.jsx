// ./src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import boatImg from "../assets/boat.png";
import bgImage from "../assets/beach.png";

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, logout, role } = useAuth();

  const [username, setUsername] = useState(
    localStorage.getItem("profileUsername") || ""
  );

  const [photoURL, setPhotoURL] = useState(
    localStorage.getItem("profilePhoto") || ""
  );

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUsername(data.username || "");
        setPhotoURL(data.photoURL || "");

        localStorage.setItem("profileUsername", data.username || "");
        localStorage.setItem("profilePhoto", data.photoURL || "");
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <>
      <div
        className="min-h-screen flex flex-col bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Page Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 flex flex-col min-h-screen">

          {/* Center Section */}
          <div className="flex-1 flex items-center justify-center px-4">

            {/* 🔥 IMAGE BACKGROUND CARD WITH HOVER EFFECT */}
            <div
              className="relative w-full max-w-md rounded-3xl overflow-hidden
                         backdrop-blur-lg
                         border border-emerald-400/30
                         transition-all duration-500 ease-out
                         hover:-translate-y-3 hover:scale-[1.02]
                         hover:shadow-[0_30px_70px_rgba(0,0,0,0.8)]
                         group"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Dark overlay inside card */}
              <div className="absolute inset-0 bg-black/65 group-hover:bg-black/55 transition-all duration-500"></div>

              <div className="relative z-10 p-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold tracking-wide 
               bg-gradient-to-r from-emerald-300 to-teal-400 
               bg-clip-text text-transparent">
                    🌴 Kerala Vibes
                  </h2>

                  <button
                    onClick={() => navigate("/home")}
                    className="text-sm text-sky-300 hover:text-sky-200 transition"
                  >
                    Back
                  </button>
                </div>

                {/* Profile Info */}
                <div className="flex flex-col items-center space-y-4 mb-6">

                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover
                                 border-4 border-emerald-400
                                 transition duration-500
                                 hover:shadow-[0_0_30px_rgba(0,255,170,0.6)]
                                 hover:scale-105"
                      onClick={() => setShowPreview(true)}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-emerald-400 
                                    flex items-center justify-center text-white">
                      No Image
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-cyan-300 tracking-wide">
                    {username}
                  </h3>

                  <p className="text-sm text-amber-200/80">
                    {currentUser.email}
                  </p>
                </div>

                {/* Admin Button */}
                {role === "admin" && (
                  <button
                    onClick={() => navigate("/admin")}
                    className="w-full mb-4
           bg-gradient-to-r from-sky-500 to-cyan-600
           hover:from-sky-400 hover:to-cyan-500
           text-white py-3 rounded-xl font-semibold
           transition-all duration-300
           hover:shadow-[0_10px_25px_rgba(0,200,255,0.5)]
           hover:-translate-y-1"
                  >
                    Admin Panel
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="w-full
           bg-gradient-to-r from-emerald-600 to-green-700
           hover:from-emerald-500 hover:to-green-600
           text-white py-3 rounded-xl font-semibold
           transition-all duration-300
           hover:shadow-[0_10px_25px_rgba(0,255,150,0.4)]
           hover:-translate-y-1"
                >
                  Logout
                </button>

              </div>
            </div>
          </div>

          {/* Boat Section */}
          <div className="relative w-full h-32 
                          bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700
                          overflow-hidden">

            <div
              className="absolute bottom-4"
              style={{ animation: "boatMove 18s linear infinite" }}
            >
              <img
                src={boatImg}
                alt="Boat"
                className="w-48 object-contain"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Image Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm 
                     flex items-center justify-center z-50"
          onClick={() => setShowPreview(false)}
        >
          <img
            src={photoURL}
            alt="Preview"
            className="max-h-[90%] max-w-[90%] rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
};

export default Profile;