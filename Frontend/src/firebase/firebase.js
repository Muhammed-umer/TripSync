// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6Xy8egFjo0IBgrKn2sSv997uwHel2Ls4",
  authDomain: "tripsync-6eff1.firebaseapp.com",
  projectId: "tripsync-6eff1",
  storageBucket: "tripsync-6eff1.firebasestorage.app",
  messagingSenderId: "138670764849",
  appId: "1:138670764849:web:350db1a958413e5846f610"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);