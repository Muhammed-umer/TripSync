// ./src/pages/Login.jsx
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      let emailToLogin = identifier;

      // If user typed username
      if (!identifier.includes("@")) {
        const q = query(
          collection(db, "users"),
          where("username", "==", identifier)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          alert("Username not found");
          return;
        }

        emailToLogin = snapshot.docs[0].data().email;
      }

      await signInWithEmailAndPassword(auth, emailToLogin, password);

      navigate("/home");

    } catch (error) {
      console.error(error);
      alert("Invalid credentials");
    }
  };

  const handleForgotPassword = async () => {
    if (!identifier) {
      alert("Enter your email first");
      return;
    }

    try {
      let emailToReset = identifier;

      // If username entered, convert to email
      if (!identifier.includes("@")) {
        const q = query(
          collection(db, "users"),
          where("username", "==", identifier)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          alert("Username not found");
          return;
        }

        emailToReset = snapshot.docs[0].data().email;
      }

      await sendPasswordResetEmail(auth, emailToReset);
      alert("Password reset email sent");

    } catch (error) {
      console.error(error);
      alert("Failed to send reset email");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-xl font-bold text-center mb-6">Login</h2>

        <input
          type="text"
          placeholder="Username or Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full p-2 border mb-4 rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        {/* Forgot Password placed BETWEEN password and login */}
        <div className="text-right mt-2 mb-4">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-blue-600 text-sm hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}