// ./src/pages/useLocation.js
import { useState, useEffect, useRef } from "react";
import { db } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

// Helper to calculate distance between two points in meters
const getMetres = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const { currentUser } = useAuth();
  const watcherRef = useRef(null);
  const lastSyncTime = useRef(0);
  const lastSyncCoords = useRef({ lat: 0, lng: 0 });

  useEffect(() => {
    if (!navigator.geolocation || !currentUser) return;

    watcherRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const now = Date.now();

        // 1. Calculate distance from last sync
        const distanceMoved = getMetres(
          lastSyncCoords.current.lat,
          lastSyncCoords.current.lng,
          latitude,
          longitude
        );

        // 2. Only update Firestore if moved > 10m OR it's been 30 seconds
        // This prevents the "Lag" you experienced with 50 students
        const shouldSync = distanceMoved > 10 || (now - lastSyncTime.current) > 30000;

        const newLocationData = {
          lat: latitude,
          lng: longitude,
          lastSeen: now,
          status: "online"
        };

        // Always update local state for smooth map movement
        setLocation(newLocationData);

        if (shouldSync) {
          lastSyncTime.current = now;
          lastSyncCoords.current = { lat: latitude, lng: longitude };

          try {
            await setDoc(
              doc(db, "users_locations", currentUser.uid),
              newLocationData,
              { merge: true }
            );
          } catch (error) {
            console.error("Sync error:", error);
          }
        }
      },
      (err) => console.error("Geolocation Error:", err),
      {
        enableHighAccuracy: true,
        maximumAge: 5000, // Allow 5-second old cached positions to save battery
        timeout: 15000,
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