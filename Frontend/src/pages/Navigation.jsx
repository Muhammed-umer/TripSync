// ./src/pages/Navigation.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, ZoomControl } from "react-leaflet";
import { useLocation } from "./useLocation";
import { db } from "../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { LocateFixed, ArrowLeft } from "lucide-react";

// Icons for tracking
const createIcon = (color) => L.divIcon({
  className: "",
  html: `<svg width="35" height="35" viewBox="0 0 24 24" fill="${color}"><path d="M12 2C8 2 5 5 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-4-3-7-7-7z"/></svg>`,
  iconSize: [35, 35],
  iconAnchor: [17, 35]
});

export default function Navigation() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const myLocation = useLocation();
  const [allUsers, setAllUsers] = useState([]);

  // Listen for all classmates
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users_locations"), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(users);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden">
      {/* Back Button - Top Left */}
      <button 
        onClick={() => navigate("/home")} 
        className="absolute top-5 left-5 z-[1001] bg-white p-3 rounded-full shadow-xl hover:scale-105 transition"
      >
        <ArrowLeft size={24} />
      </button>

      <MapContainer 
        center={myLocation ? [myLocation.lat, myLocation.lng] : [12.9716, 77.5946]} 
        zoom={16} 
        zoomControl={false} // Disable default so we can move it
        style={{ height: "100%", width: "100%" }}
      >
        {/* Zoom Controls - Bottom Left */}
        <ZoomControl position="bottomleft" />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satellite View">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Street View">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
        </LayersControl>

        {allUsers.map(user => (
          <Marker 
            key={user.id} 
            position={[user.lat, user.lng]} 
            icon={user.id === currentUser?.uid ? createIcon("#3B82F6") : createIcon("#EF4444")}
          >
            <Popup>{user.id === currentUser?.uid ? "You" : "Classmate"}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}