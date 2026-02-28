// ./src/pages/ChangePassword.jsx
import { useState } from "react";
import { auth, db } from "../firebase/firebase";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleChange = async () => {
    await updatePassword(auth.currentUser, newPassword);

    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      mustChangePassword: false
    });

    navigate("/home");
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="mb-4 font-bold">Change Password</h2>

        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-2 mb-3 rounded"
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button
          onClick={handleChange}
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Update Password
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;