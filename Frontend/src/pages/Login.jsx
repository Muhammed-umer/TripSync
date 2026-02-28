// ./src/pages/Login.jsx

import keralaBg from "../assets/kerala.jpg";
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
  const [toast, setToast] = useState(null); // { message, type }

  const navigate = useNavigate();

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      let emailToLogin = identifier;

      if (!identifier.includes("@")) {
        const q = query(
          collection(db, "users"),
          where("username", "==", identifier)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          showToast("Username not found", "error");
          return;
        }

        emailToLogin = snapshot.docs[0].data().email;
      }

      await signInWithEmailAndPassword(auth, emailToLogin, password);

      showToast("Login successful!", "success");

      setTimeout(() => {
        navigate("/home");
      }, 1000);

    } catch {
      showToast("Invalid credentials", "error");
    }
  };

  const handleForgotPassword = async () => {
    if (!identifier) {
      showToast("Enter email or username first", "error");
      return;
    }

    try {
      let emailToReset = identifier;

      if (!identifier.includes("@")) {
        const q = query(
          collection(db, "users"),
          where("username", "==", identifier)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          showToast("Username not found", "error");
          return;
        }

        emailToReset = snapshot.docs[0].data().email;
      }

      await sendPasswordResetEmail(auth, emailToReset);
      showToast("Password reset email sent", "success");

    } catch {
      showToast("Failed to send reset email", "error");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${keralaBg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-emerald-950/60 to-black/80"></div>

      {/* Toast (Top Right) */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl backdrop-blur-lg border transition-all duration-300
          ${
            toast.type === "error"
              ? "bg-red-600/20 border-red-500/40 text-red-300"
              : "bg-emerald-600/20 border-emerald-400/40 text-emerald-300"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Login Card */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md p-10 rounded-3xl
        backdrop-blur-xl
        bg-black/40
        border border-emerald-800/40
        shadow-2xl shadow-black/60
        text-white"
      >
        {/* Updated Title Color */}
        <h2 className="text-4xl font-extrabold text-center mb-2 tracking-wide text-emerald-300 drop-shadow-lg">
          TripSync Kerala
        </h2>

        <p className="text-center text-sm text-emerald-200/80 mb-8 tracking-wide">
          Discover God’s Own Country 🚣‍♂️🌅
        </p>

        <div className="space-y-6">
          <input
            type="text"
            placeholder="Username or Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-3 rounded-xl
            bg-emerald-900/40
            border border-emerald-700/40
            text-white
            placeholder-emerald-200/70
            focus:outline-none
            focus:ring-2
            focus:ring-emerald-400
            focus:bg-emerald-800/50
            transition duration-300"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl
            bg-emerald-900/40
            border border-emerald-700/40
            text-white
            placeholder-emerald-200/70
            focus:outline-none
            focus:ring-2
            focus:ring-emerald-400
            focus:bg-emerald-800/50
            transition duration-300"
            required
          />
        </div>

        <div className="text-right mt-4 mb-6">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-emerald-300 hover:text-emerald-200 transition"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl
          bg-gradient-to-r from-emerald-600 to-teal-700
          hover:from-emerald-500 hover:to-teal-600
          transition duration-300
          font-semibold tracking-wide
          shadow-lg shadow-emerald-900/40
          active:scale-95"
        >
          Login
        </button>
      </form>
    </div>
  );
}