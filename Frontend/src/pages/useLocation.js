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

        try {
          await setDoc(doc(db, "users_locations", currentUser.uid), newCoords, { merge: true });
        } catch (error) {
          console.error("Sync error:", error);
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => watcherRef.current && navigator.geolocation.clearWatch(watcherRef.current);
  }, [currentUser]);

  return location;
};