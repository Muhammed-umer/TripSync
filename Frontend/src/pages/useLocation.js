// ./src/pages/useLocation.js
import { useState, useEffect, useRef } from "react";

export const useLocation = (thresholdMeters = 20) => {
  const [location, setLocation] = useState(null);
  const lastCoords = useRef(null);

  // Helper to calculate distance between two points (Haversine formula)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported");
      return;
    }

    const options = {
      enableHighAccuracy: true, // Uses GPS hardware for precision
      maximumAge: 0,            // Forces a fresh location; ignores 7-8hr old cache
      timeout: 10000,           // Wait 15s for a fresh signal before failing
    };

    const success = (pos) => {
      const { latitude, longitude } = pos.coords;

      // THROTTLE LOGIC:
      // Only update if no location exists OR if student moved > thresholdMeters
      if (
        !lastCoords.current ||
        getDistance(
          lastCoords.current.lat,
          lastCoords.current.lng,
          latitude,
          longitude
        ) > thresholdMeters
      ) {
        const newPos = { lat: latitude, lng: longitude };
        lastCoords.current = newPos;
        setLocation(newPos);
        console.log("Fresh Throttled Update:", newPos);
      }
    };

    const error = (err) => {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    };

    const watcher = navigator.geolocation.watchPosition(success, error, options);

    return () => navigator.geolocation.clearWatch(watcher);
  }, [thresholdMeters]);

  return location;
};