// ./src/pages/useLocation.js
import { useState, useEffect, useRef } from "react";

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const watcherRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    watcherRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
      },
      (err) => console.log(err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,     // FAST MODE
        timeout: 5000,
      }
    );

    return () => {
      if (watcherRef.current) {
        navigator.geolocation.clearWatch(watcherRef.current);
      }
    };
  }, []);

  return location;
};