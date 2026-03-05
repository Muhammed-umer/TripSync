// ./src/pages/Navigation.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, LayersControl, ZoomControl, LayerGroup } from "react-leaflet";
import { useLocation } from "./useLocation";
import { db } from "../firebase/firebase";
import { collection, onSnapshot, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import EmergencyPopup from "../components/EmergencyPopup";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Target, Mountain, Users, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchField from "./SearchField";

// 🔹 Optimized Distance Helper (Haversine)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// 🔹 Human-readable relative time
const formatLastSeen = (timestamp) => {
  if (!timestamp) return "Unknown";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return "Offline";
};

function MapAutoCenter({ coords }) {
  const map = useMap();
  const hasFixed = useRef(false);
  useEffect(() => {
    if (coords && !hasFixed.current) {
      map.setView([coords.lat, coords.lng], 17, { animate: true });
      hasFixed.current = true;
    }
  }, [coords, map]);
  return null;
}

const MapEvents = ({ onClose }) => {
  useMapEvents({ click() { onClose(); } });
  return null;
};

export default function Navigation() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const myLocation = useLocation();
  const [allUsers, setAllUsers] = useState([]);
  const [usersInfo, setUsersInfo] = useState({});
  const [touristSpots, setTouristSpots] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const [emergencyPopup, setEmergencyPopup] = useState({ isOpen: false, message: "" });

  const showEmergencyPopup = (msg) => setEmergencyPopup({ isOpen: true, message: msg });

  // 1. Listen for Emergencies
  useEffect(() => {
    if (!currentUser) return;
    const tenMinsAgo = Date.now() - 10 * 60 * 1000;
    const q = query(collection(db, "emergencies"), where("timestamp", ">=", tenMinsAgo));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === "added") {
          const alertData = change.doc.data();
          if (alertData.uid !== currentUser.uid) {
            let senderName = alertData.name || "Classmate";
            const distance = myLocation ? getDistance(myLocation.lat, myLocation.lng, alertData.lat, alertData.lng) : null;
            const distStr = distance ? (distance >= 1000 ? (distance / 1000).toFixed(1) + " km" : Math.round(distance) + " m") : "calculating...";
            showEmergencyPopup(`🚨 EMERGENCY: ${senderName} needs help! They are ${distStr} away.`);
          }
        }
      }
    });
    return () => unsubscribe();
  }, [currentUser, myLocation]);

  // 2. Fetch User Profiles & Real-time Locations
  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const info = {};
      snapshot.forEach((doc) => { info[doc.id] = doc.data(); });
      setUsersInfo(info);
    };
    fetchUsers();
    return onSnapshot(collection(db, "users_locations"), (snapshot) => {
      setAllUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const fetchNearbySpots = async () => {
    if (!myLocation) return;
    const queryStr = `[out:json]; (node["tourism"~"attraction|viewpoint"](around: 50000, ${myLocation.lat}, ${myLocation.lng}); node["natural"~"waterfall|peak"](around: 50000, ${myLocation.lat}, ${myLocation.lng});); out; `;
    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(queryStr)}`);
      const data = await response.json();
      setTouristSpots(data.elements);
      setActiveTab('spots');
    } catch (err) { console.error("Search error:", err); }
  };

  const startNavigation = (targetLat, targetLng) => {
    if (!myLocation || !mapRef.current) return;
    if (routingControlRef.current) mapRef.current.removeControl(routingControlRef.current);
    routingControlRef.current = L.Routing.control({
      waypoints: [L.latLng(myLocation.lat, myLocation.lng), L.latLng(targetLat, targetLng)],
      lineOptions: { styles: [{ color: "#4f46e5", weight: 6, opacity: 0.8 }] },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false
    }).addTo(mapRef.current);
    setActiveTab(null);
  };

  const formatDist = (m) => m >= 1000 ? (m / 1000).toFixed(2) + " km" : Math.round(m) + " m";

  // 3. Render Markers with Presence Logic
  const userMarkers = useMemo(() => {
    return allUsers.map(user => {
      const isMe = user.id === currentUser?.uid;
      const info = usersInfo[user.id] || {};
      
      // Determine if the user is "Offline" (no update in last 3 minutes)
      const isInactive = (Date.now() - (user.lastSeen || 0)) > 180000;
      const borderColor = isMe ? "#3B82F6" : (isInactive ? "#9CA3AF" : "#EF4444");
      const opacity = isInactive ? 0.6 : 1; 

      const dist = myLocation ? getDistance(myLocation.lat, myLocation.lng, user.lat, user.lng) : 0;

      return (
        <Marker 
          key={user.id} 
          position={[user.lat, user.lng]} 
          icon={createMarkerIcon(user, usersInfo, borderColor, opacity)}
        >
          <Popup autoPan={false}>
            <div className="text-center p-1 min-w-[130px]">
              <p className="font-bold text-indigo-900">{isMe ? "You" : info.username || "Classmate"}</p>
              <p className="text-[10px] text-gray-500 mb-2">Last seen: {formatLastSeen(user.lastSeen)}</p>
              {!isMe && (
                <div className="mt-2 border-t pt-2">
                  <p className="text-blue-600 font-bold text-xs">{formatDist(dist)} away</p>
                  <button 
                    onClick={() => startNavigation(user.lat, user.lng)} 
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold mt-2 w-full transition active:scale-95"
                  >
                    Navigate
                  </button>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [allUsers, myLocation, usersInfo, currentUser]);

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-black font-sans">
      <button onClick={() => navigate("/home")} className="absolute top-5 left-5 z-[1001] bg-white p-3 rounded-full shadow-xl active:scale-90 transition">
        <ArrowLeft size={24} className="text-gray-700" />
      </button>

      <div className="absolute top-20 left-5 z-[1001] flex flex-col gap-3">
        <button onClick={() => setActiveTab(activeTab === 'friends' ? null : 'friends')} className={`p-4 rounded-full shadow-2xl transition border-2 ${activeTab === 'friends' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}><Users size={24} /></button>
        <button onClick={fetchNearbySpots} className={`p-4 rounded-full shadow-2xl transition border-2 ${activeTab === 'spots' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600'}`}><Mountain size={24} /></button>
      </div>

      <MapContainer ref={mapRef} center={[10.2313, 76.9204]} zoom={15} maxZoom={22} zoomControl={false} style={{ height: "100%", width: "100%" }}>
        <MapAutoCenter coords={myLocation} />
        <SearchField />
        <MapEvents onClose={() => setActiveTab(null)} />
        <ZoomControl position="bottomleft" />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satellite">
            <LayerGroup>
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" maxNativeZoom={18} maxZoom={22} />
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" opacity={0.7} />
            </LayerGroup>
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Terrain">
            <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" maxNativeZoom={19} maxZoom={22} />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MarkerClusterGroup spiderfyOnMaxZoom={true} showCoverageOnHover={false}>
          {userMarkers}
        </MarkerClusterGroup>
      </MapContainer>

      <button onClick={() => myLocation && mapRef.current.flyTo([myLocation.lat, myLocation.lng], 18)} className="absolute bottom-8 right-16 z-[1000] bg-white p-4 rounded-full shadow-2xl active:scale-90 transition border-2 border-white">
        <Target size={28} className="text-indigo-600" />
      </button>

      {activeTab && (
        <div className="absolute bottom-24 left-6 z-[1002] w-80 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-5 border border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider">{activeTab === 'friends' ? 'Who\'s Nearby' : 'Tourist Spots'}</h3>
            <button onClick={() => setActiveTab(null)}><X size={18} className="text-gray-400" /></button>
          </div>
          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {activeTab === 'friends' ? (
              allUsers.map(user => {
                const isInactive = (Date.now() - (user.lastSeen || 0)) > 180000;
                const dist = myLocation ? getDistance(myLocation.lat, myLocation.lng, user.lat, user.lng) : 0;
                return (
                  <div key={user.id} onClick={() => { mapRef.current.flyTo([user.lat, user.lng], 18); setActiveTab(null); }} className={`flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-xl cursor-pointer transition ${isInactive ? 'opacity-60' : ''}`}>
                    <img src={usersInfo[user.id]?.photoURL || 'https://ui-avatars.com/api/?name=User'} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100" alt="" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900">{usersInfo[user.id]?.username || "User"}</p>
                      <p className="text-indigo-600 text-[10px] font-bold">{formatDist(dist)} • {formatLastSeen(user.lastSeen)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              touristSpots.map((spot, idx) => {
                const dist = myLocation ? getDistance(myLocation.lat, myLocation.lng, spot.lat, spot.lon) : 0;
                return (
                  <div key={idx} onClick={() => { mapRef.current.flyTo([spot.lat, spot.lon], 16); setActiveTab(null); }} className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl cursor-pointer transition">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl">📍</div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate w-40">{spot.tags.name || "Viewpoint"}</p>
                      <p className="text-emerald-600 text-[10px] font-bold">{formatDist(dist)} away</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      <EmergencyPopup isOpen={emergencyPopup.isOpen} message={emergencyPopup.message} onClose={() => setEmergencyPopup({ isOpen: false, message: "" })} />
    </div>
  );
}

const createMarkerIcon = (user, usersInfo, borderColor, opacity) => {
  const photo = usersInfo[user.id]?.photoURL;
  const name = usersInfo[user.id]?.username || "User";
  return L.divIcon({
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; width: 50px; opacity: ${opacity}; transition: opacity 0.5s;">
        <div style="background: rgba(0,0,0,0.85); color: white; font-size: 9px; padding: 2px 8px; border-radius: 20px; margin-bottom: 2px; white-space: nowrap; font-weight: 800; border: 1px solid rgba(255,255,255,0.2);">${name}</div>
        <div style="width: 44px; height: 44px; border-radius: 50%; border: 3px solid ${borderColor}; overflow: hidden; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          <img src="${photo || 'https://ui-avatars.com/api/?name=' + name}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
      </div>`,
    className: 'custom-user-marker',
    iconSize: [50, 70],
    iconAnchor: [25, 70]
  });
};