import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

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

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setUsername(data.username || "");
          setPhotoURL(data.photoURL || "");

          localStorage.setItem("profileUsername", data.username || "");
          localStorage.setItem("profilePhoto", data.photoURL || "");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Profile
            </h2>

            <button
              onClick={() => navigate("/home")}
              className="text-sm text-indigo-600 hover:underline"
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
                className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500 shadow-lg cursor-pointer"
                onClick={() => setShowPreview(true)}   // 🔥 open modal
              />
            ) : (
              <div className="w-28 h-28 rounded-full border-4 border-indigo-500 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-800">
              {username}
            </h3>

            <p className="text-gray-500 text-sm">
              {currentUser.email}
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition shadow-md"
          >
            Logout
          </button>

        </div>
      </div>

      {/* 🔥 Image Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowPreview(false)}
        >
          <img
            src={photoURL}
            alt="Preview"
            className="max-h-[90%] max-w-[90%] rounded-lg shadow-2xl"
          />
        </div>
      )}
    </>
  );
};

export default Profile;