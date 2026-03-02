// ./src/pages/Navigation.jsx
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, ZoomControl } from "react-leaflet";
import { useLocation } from "./useLocation";
import { db } from "../firebase/firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine"; 
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Navigation as NavIcon } from "lucide-react";
import MarkerClusterGroup from 'react-leaflet-cluster';
import SearchField from "./SearchField";

// Component to handle Initial Auto-Center
function MapController({ coords }) {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (coords && !hasCentered.current) {
      map.flyTo([coords.lat, coords.lng], 17, { animate: true });
      hasCentered.current = true;
    }
  }, [coords, map]);

  return null;
}

export default function Navigation() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const myLocation = useLocation(); // Uses high-accuracy GPS
  const [allUsers, setAllUsers] = useState([]);
  const [usersInfo, setUsersInfo] = useState({});
  const routingControlRef = useRef(null);
  const mapRef = useRef(null);

  // 🔹 Fetch User Profiles for Marker Icons
  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const info = {};
      snapshot.forEach(doc => {
        info[doc.id] = { 
            username: doc.data().username, 
            photoURL: doc.data().photoURL 
        };
      });
      setUsersInfo(info);
    };
    fetchUsers();
  }, []);

  // 🔹 Real-time Location Listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users_locations"), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(users);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Distance Calculator
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };

  // 🔹 Start Google Maps-style Routing
  const startNavigation = (targetLat, targetLng) => {
    if (!myLocation || !mapRef.current) return;
    if (routingControlRef.current) mapRef.current.removeControl(routingControlRef.current);

    routingControlRef.current = L.Routing.control({
      waypoints: [L.latLng(myLocation.lat, myLocation.lng), L.latLng(targetLat, targetLng)],
      lineOptions: { styles: [{ color: "#3B82F6", weight: 6, opacity: 0.8 }] },
      routeWhileDragging: false,
      addWaypoints: false,
      show: false // Hide text instructions for cleaner UI
    }).addTo(mapRef.current);
  };

  // 🔹 Create Custom Photo Marker
  const createCustomMarker = (userId, timestamp) => {
    const photo = usersInfo[userId]?.photoURL;
    const name = usersInfo[userId]?.username || "User";
    const isMe = userId === currentUser?.uid;
    const diff = Math.floor((Date.now() - timestamp) / 60000);
    const isOffline = diff > 2;
    
    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="background: rgba(0,0,0,0.8); color: white; font-size: 10px; padding: 2px 8px; border-radius: 10px; margin-bottom: 4px; white-space: nowrap;">
            ${name}${isMe ? ' (You)' : ''}
          </div>
          <div style="width: 44px; height: 44px; border-radius: 50%; border: 3px solid ${isMe ? '#3B82F6' : (isOffline ? '#94a3b8' : '#EF4444')}; overflow: hidden; background: white; shadow: 0 4px 10px rgba(0,0,0,0.3);">
            <img src="${photo || 'https://via.placeholder.com/40'}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 10px solid ${isMe ? '#3B82F6' : (isOffline ? '#94a3b8' : '#EF4444')};"></div>
        </div>`,
      iconSize: [60, 85],
      iconAnchor: [30, 85]
    });
  };

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden">
      {/* Top Header Controls */}
      <button 
        onClick={() => navigate("/home")} 
        className="absolute top-5 left-5 z-[1001] bg-white p-3 rounded-full shadow-xl"
      >
        <ArrowLeft size={24} />
      </button>

      <MapContainer 
        ref={mapRef}
        center={[12.9716, 77.5946]} 
        zoom={16} 
        maxZoom={19} // Fix: Allows deeper zoom
        zoomControl={false} 
        style={{ height: "100%", width: "100%" }}
      >
        <ZoomControl position="bottomleft" />
        <SearchField /> {/* Integrated Search */}
        <MapController coords={myLocation} />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satellite View">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Street View (Landmarks)">
            <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Marker Clustering (Spiderfy logic) */}
        <MarkerClusterGroup spiderfyOnMaxZoom={true} maxClusterRadius={30}>
          {allUsers.map(user => {
            const dist = myLocation ? calculateDistance(myLocation.lat, myLocation.lng, user.lat, user.lng) : 0;
            const diff = Math.floor((Date.now() - user.lastSeen) / 60000);

            return (
              <Marker key={user.id} position={[user.lat, user.lng]} icon={createCustomMarker(user.id, user.lastSeen)}>
                <Popup>
                  <div className="text-center p-1">
                    <p className="font-bold text-lg">{usersInfo[user.id]?.username}</p>
                    <p className="text-xs text-gray-500 mb-2">{diff > 2 ? `${diff}m ago` : "Online Now"}</p>
                    {user.id !== currentUser?.uid && (
                      <>
                        <p className="text-blue-600 font-bold mb-3">{dist} meters away</p>
                        <button 
                          onClick={() => startNavigation(user.lat, user.lng)}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold w-full justify-center"
                        >
                          <NavIcon size={14} /> Start Navigation
                        </button>
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Floating Locate Me Button */}
      <button 
        onClick={() => myLocation && mapRef.current.flyTo([myLocation.lat, myLocation.lng], 18)}
        className="absolute bottom-8 right-6 z-[1000] bg-white p-4 rounded-full shadow-2xl active:scale-90 transition-transform"
      >
        <Target size={28} className="text-blue-600" />
      </button>               
    </div>                  
  );             
} 