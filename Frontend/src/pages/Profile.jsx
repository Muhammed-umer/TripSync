import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import boatImg from "../assets/boat.png";

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

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
    <div className="min-h-screen flex flex-col 
                    bg-gradient-to-br from-emerald-200 via-green-100 to-teal-200">

      {/* Centered Card Section */}
      <div className="flex-1 flex items-center justify-center px-4">

        <div className="backdrop-blur-xl bg-white/60 border border-white/40
                        w-full max-w-md rounded-3xl shadow-2xl p-8">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-emerald-900">
              🌴 Kerala Vibes
            </h2>

            <button
              onClick={() => navigate("/home")}
              className="text-sm text-emerald-700 hover:underline"
            >
              Back
            </button>
          </div>

          <div className="flex flex-col items-center space-y-4 mb-6">

            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover 
                           border-4 border-emerald-600 shadow-xl
                           cursor-pointer transition duration-300
                           hover:scale-105"
                onClick={() => setShowPreview(true)}
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-emerald-600 
                              flex items-center justify-center text-gray-600">
                No Image
              </div>
            )}

            <h3 className="text-lg font-semibold text-emerald-900">
              {username}
            </h3>

            <p className="text-gray-700 text-sm">
              {currentUser.email}
            </p>
          </div>

          <button
            onClick={logout}
            className="w-full bg-emerald-700 hover:bg-emerald-800
                       text-white py-3 rounded-xl font-semibold"
          >
            Logout
          </button>
        </div>

      </div>

      {/* 🌊 Water Section */}
<div className="relative w-full h-32 
                bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600
                overflow-hidden">

  <div
    className="absolute bottom-4"
    style={{
      animation: "boatMove 18s linear infinite"
    }}
  >
    <img
      src={boatImg}
      alt="Boat"
      className="w-48 object-contain"
    />
  </div>

</div>

    </div>

    {/* Image Modal */}
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