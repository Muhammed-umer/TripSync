// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SupportChat from "./SupportChat";

// Fix for default marker icons in Leaflet + React
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12.5, 41], // The horizontal center (12.5) and the very bottom (41)
  popupAnchor: [0, -41],  // Ensures the popup opens above the pin
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to auto-center map when student moves
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position);
    }
  }, [position, map]);
  return null;
}

const Home = () => {
  const [showMap, setShowMap] = useState(false);
  const [position, setPosition] = useState([12.9716, 77.5946]); // Default: Bangalore
  const lastUpdateRef = useRef({ lat: 0, lng: 0 });

  // Distance calculator to handle Throttling (Haversine formula)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius of Earth in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const dist = getDistance(
          lastUpdateRef.current.lat,
          lastUpdateRef.current.lng,
          latitude,
          longitude
        );

        // THROTTLE: Only update state if user moves > 20 meters
        // This prevents battery drain and constant jitter on the map
        if (dist > 20) {
          console.log(`User moved ${dist.toFixed(2)}m. Updating location...`);
          const newPos = [latitude, longitude];
          setPosition(newPos);
          lastUpdateRef.current = { lat: latitude, lng: longitude };
          
          // Note: In the next phase, you will trigger your Firebase update here.
        }
      },
      (err) => console.error("Location Error:", err),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleEmergency = () => {
    alert("🚨 Emergency triggered! Your coordinates are: " + position.join(", "));
  };

  // --- MAP VIEW RENDER ---
  if (showMap) {
    return (
      <div className="h-screen w-full flex flex-col">
        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-md z-[1000]">
          <h1 className="font-bold">TripSync Live Map</h1>
          <button
            onClick={() => setShowMap(false)}
            className="bg-white text-indigo-600 px-3 py-1 rounded-md text-sm font-medium active:scale-95 transition-transform"
          >
            Back to Home
          </button>
        </div>

        <div className="flex-1 relative">
          <MapContainer
            center={position}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold">You are here</p>
                  <p className="text-xs text-gray-500">Updating every 20m</p>
                </div>
              </Popup>
            </Marker>
            <RecenterMap position={position} />
          </MapContainer>
        </div>
      </div>
    );
  }

  // --- DASHBOARD RENDER ---
 return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 px-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
        Welcome to TripSync
      </h1>

      <p className="text-gray-500 mb-8 text-sm sm:text-base">
        Stay connected with your trip mates
      </p>

      <div className="flex flex-col gap-4">

        <button
          onClick={() => setShowMap(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium shadow-md"
        >
          Navigation
        </button>

        <button
          onClick={handleEmergency}
          className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-lg"
        >
          🚨 Emergency Help
        </button>

      </div>

      <p className="text-xs text-gray-400 mt-6">
        Tap Emergency only in urgent situations.
      </p>
    </div>

    {/* Floating Chat */}
    <SupportChat />
  </div>
  );
};

export default Home;