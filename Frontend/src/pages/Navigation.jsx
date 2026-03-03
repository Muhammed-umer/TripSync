// ./src/pages/Navigation.jsx
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, ZoomControl, LayerGroup } from "react-leaflet";
import { useLocation } from "./useLocation";
import { db } from "../firebase/firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine"; 
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import MarkerClusterGroup from 'react-leaflet-cluster';
import { ArrowLeft, Target, User, Navigation as NavIcon, Mountain, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchField from "./SearchField";

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

function MapEvents({ onClose }) {
  const map = useMap();
  useEffect(() => {
    map.on('click', onClose);
    return () => map.off('click', onClose);
  }, [map, onClose]);
  return null;
}

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
    const query = `[out:json];(node["tourism"~"attraction|viewpoint"](around:50000,${myLocation.lat},${myLocation.lng});node["natural"~"waterfall|peak"](around:50000,${myLocation.lat},${myLocation.lng}););out;`;
    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();
      setTouristSpots(data.elements);
      setActiveTab('spots'); 
    } catch (err) { alert("Error reaching search service."); }
  };

  const startNavigation = (targetLat, targetLng) => {
    if (!myLocation || !mapRef.current) return;
    if (routingControlRef.current) mapRef.current.removeControl(routingControlRef.current);

    routingControlRef.current = L.Routing.control({
      waypoints: [L.latLng(myLocation.lat, myLocation.lng), L.latLng(targetLat, targetLng)],
      lineOptions: { styles: [{ color: "#3B82F6", weight: 6 }] },
      show: false,
      addWaypoints: false,
    }).addTo(mapRef.current);
    setActiveTab(null); 
  };

  // 🔥 CUSTOM CLUSTER ICON: Displays only the count in a circle
  const createClusterCustomIcon = (cluster) => {
    const count = cluster.getChildCount();
    return L.divIcon({
      html: `
        <div style="
          background: #4f46e5;
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        ">
          ${count}
        </div>`,
      className: 'custom-marker-cluster',
      iconSize: L.point(40, 40, true),
    });
  };

  const formatDistanceDisplay = (meters) => {
    return meters >= 1000 ? (meters / 1000).toFixed(2) + " km" : meters + " m";
  };

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-gray-100 font-sans">
      
      <button 
        onClick={() => navigate("/home")} 
        className="absolute top-5 left-5 z-[1001] bg-white p-3 rounded-full shadow-xl"
      >
        <ArrowLeft size={24} className="text-gray-700" />
      </button>

      <div className="absolute top-20 left-5 z-[1001] flex flex-col gap-3">
        <button 
          onClick={() => setActiveTab(activeTab === 'friends' ? null : 'friends')}
          className={`p-4 rounded-full shadow-2xl transition border-2 ${activeTab === 'friends' ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-white text-indigo-600 border-white'}`}
        >
          <Users size={24} />
        </button>

        <button 
          onClick={fetchNearbySpots}
          className={`p-4 rounded-full shadow-2xl transition border-2 ${activeTab === 'spots' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-white text-emerald-600 border-white'}`}
        >
          <Mountain size={24} />
        </button>
      </div>

      <MapContainer 
        ref={mapRef}
        center={[12.9716, 77.5946]} 
        zoom={15} 
        maxZoom={22}
        zoomControl={false}
        touchZoom="center"
        style={{ height: "100%", width: "100%" }}
      >
        <SearchField />
        <MapEvents onClose={() => setActiveTab(null)} />
        <ZoomControl position="bottomright" />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satellite (Labeled)">
            <LayerGroup>
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" maxNativeZoom={18} maxZoom={22} />
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" opacity={0.8} />
            </LayerGroup>
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Street Map">
            <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" maxNativeZoom={19} maxZoom={22} />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* 🔥 CLUSTER SETTINGS: Use custom icon and enable spiderfy */}
        <MarkerClusterGroup 
          iconCreateFunction={createClusterCustomIcon}
          spiderfyOnMaxZoom={true} 
          showCoverageOnHover={false}
          maxClusterRadius={50} // Radius for clustering
          disableClusteringAtZoom={20} // Only show individual profiles at very high zoom
        >
          {allUsers.map(user => (
            <Marker key={user.id} position={[user.lat, user.lng]} icon={createMarkerIcon(user, usersInfo)}>
               <Popup>
                  <div className="text-center p-1">
                    <p className="font-bold">{usersInfo[user.id]?.username}</p>
                    {myLocation && user.id !== currentUser?.uid && (
                      <div className="mt-2">
                        <p className="text-blue-600 text-xs font-bold mb-1">{formatDistanceDisplay(getDistance(myLocation.lat, myLocation.lng, user.lat, user.lng))} away</p>
                        <button onClick={() => startNavigation(user.lat, user.lng)} className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold">Navigate</button>
                      </div>
                    )}
                  </div>
               </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {touristSpots.map((spot, idx) => (
          <Marker key={idx} position={[spot.lat, spot.lon]} icon={L.divIcon({ html: '📍', className: 'text-2xl' })}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-xs">{spot.tags.name || "Spot"}</p>
                <p className="text-emerald-600 font-bold text-[10px]">{formatDistanceDisplay(myLocation ? getDistance(myLocation.lat, myLocation.lng, spot.lat, spot.lon) : 0)} away</p>
                <button onClick={() => startNavigation(spot.lat, spot.lon)} className="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] mt-1">Navigate</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <button 
        onClick={() => myLocation && mapRef.current.flyTo([myLocation.lat, myLocation.lng], 18)} 
        className="absolute bottom-8 right-16 z-[1000] bg-white p-4 rounded-full shadow-2xl active:scale-90 transition border-2 border-white"
      >
        <Target size={28} className="text-indigo-600" />
      </button>

      {activeTab && (
        <div className="absolute bottom-24 left-6 z-[1002] w-80 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-5 border border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider">
              {activeTab === 'friends' ? 'Active Friends' : 'Tourist Spots'}
            </h3>
            <button onClick={() => setActiveTab(null)}><X size={18} className="text-gray-400"/></button>
          </div>
          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {activeTab === 'friends' ? (
              allUsers.map(user => (
                <div key={user.id} onClick={() => { mapRef.current.flyTo([user.lat, user.lng], 18); setActiveTab(null); }} className="flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-xl cursor-pointer transition">
                  <img src={usersInfo[user.id]?.photoURL || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">{usersInfo[user.id]?.username}</p>
                    <p className="text-indigo-600 text-[11px] font-bold">{formatDistanceDisplay(myLocation ? getDistance(myLocation.lat, myLocation.lng, user.lat, user.lng) : 0)}</p>
                  </div>
                </div>
              ))
            ) : (
              touristSpots.map((spot, idx) => (
                <div key={idx} onClick={() => { mapRef.current.flyTo([spot.lat, spot.lon], 16); setActiveTab(null); }} className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl cursor-pointer transition">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl">📍</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate w-40">{spot.tags.name || "Unknown Spot"}</p>
                    <p className="text-emerald-600 text-[11px] font-bold">{formatDistanceDisplay(myLocation ? getDistance(myLocation.lat, myLocation.lng, spot.lat, spot.lon) : 0)} away</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const createMarkerIcon = (user, usersInfo) => {
  const photo = usersInfo[user.id]?.photoURL;
  return L.divIcon({
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; width: 50px;">
        <div style="background: rgba(0,0,0,0.85); color: white; font-size: 9px; padding: 2px 8px; border-radius: 20px; margin-bottom: 2px; white-space: nowrap; font-weight: 800; border: 1px solid rgba(255,255,255,0.2);">
          ${usersInfo[user.id]?.username || 'User'}
        </div>
        <div style="width: 46px; height: 46px; border-radius: 50%; border: 3px solid white; overflow: hidden; background: #f0f0f0; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          <img src="${photo || 'https://via.placeholder.com/40'}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
      </div>`,
    className: 'custom-user-marker',
    iconSize: [50, 70],
    iconAnchor: [25, 70]
  });
};