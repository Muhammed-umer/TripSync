// ./src/pages/useLocation.js
import { useState, useEffect, useRef } from "react";
import { db } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const { currentUser } = useAuth();
  const watcherRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation || !currentUser) return;

    watcherRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const newCoords = { lat: latitude, lng: longitude, lastSeen: Date.now() };
        setLocation(newCoords);

        // Sync to Firestore so others can see you
        try {
          await setDoc(doc(db, "users_locations", currentUser.uid), newCoords, { merge: true });
        } catch (error) {
          console.error("Location sync failed:", error);
        }
      },
      (err) => console.log(err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => {
      if (watcherRef.current) {
        navigator.geolocation.clearWatch(watcherRef.current);
      }
    };
  }, [currentUser]);

  return location;
};