// ./src/pages/Navigation.jsx
import React, { useEffect, useState, useRef } from "react";
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
import { Target, User, Navigation as NavIcon, Mountain, Users, X, LocateFixed, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MapEvents = ({ onClose }) => {
  useMapEvents({
    click() {
      onClose();
    }
  });
  return null;
};

// Icons for tracking
const createProfileIcon = (photoURL, borderColor) => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3px solid ${borderColor};
          background-image: url('${photoURL || "https://ui-avatars.com/api/?name=User"}');
          background-size: cover;
          background-position: center;
          background-color: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          z-index: 2;
        "></div>
        <div style="
          position: absolute;
          bottom: -8px;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 10px solid ${borderColor};
          z-index: 1;
        "></div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48],
  });
};

// Locate Me Component
const LocateControl = ({ position }) => {
  const map = useMap();

  const handleLocate = () => {
    if (position) {
      map.flyTo([position.lat, position.lng], 18, { animate: true, duration: 1.5 });
    }
  };

  return (
    <button
      onClick={handleLocate}
      className="absolute bottom-6 right-6 z-[1000] bg-white p-3 rounded-full shadow-2xl border border-gray-200 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      title="Locate Me"
    >
      <LocateFixed className="text-[#3B82F6] group-hover:text-blue-700 w-6 h-6" />
    </button>
  );
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

  useEffect(() => {
    if (!currentUser) return;

    const tenMinsAgo = Date.now() - 10 * 60 * 1000;
    const q = query(
      collection(db, "emergency_alerts"),
      where("timestamp", ">=", tenMinsAgo)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === "added") {
          const alertData = change.doc.data();
          if (alertData.uid !== currentUser.uid) {

            let senderName = alertData.name;
            if (!senderName || senderName === "Unknown") {
              try {
                const userDoc = await getDoc(doc(db, "users", alertData.uid));
                if (userDoc.exists()) {
                  senderName = userDoc.data().name || userDoc.data().username || "Someone";
                } else {
                  senderName = "Someone";
                }
              } catch (err) {
                senderName = "Someone";
              }
            }

            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const myLat = position.coords.latitude;
                  const myLon = position.coords.longitude;
                  const distance = getDistance(myLat, myLon, alertData.lat, alertData.lng);

                  let distStr = distance >= 1000
                    ? (distance / 1000).toFixed(1) + " km"
                    : Math.round(distance) + " meters";

                  showEmergencyPopup(`EMERGENCY: ${senderName} needs help! They are ${distStr} away from you.`);
                },
                (error) => {
                  console.error("Location error for distance calcs: ", error);
                  showEmergencyPopup(`EMERGENCY: ${senderName} needs help!`);
                },
                { enableHighAccuracy: true }
              );
            } else {
              showEmergencyPopup(`EMERGENCY: ${senderName} needs help!`);
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

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
    const query = `[out:json]; (node["tourism"~"attraction|viewpoint"](around: 50000, ${myLocation.lat}, ${myLocation.lng}); node["natural"~"waterfall|peak"](around: 50000, ${myLocation.lat}, ${myLocation.lng});); out; `;
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
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-black">
      {/* Back Button - Top Left */}
      <button
        onClick={() => navigate("/home")}
        className="absolute top-5 left-5 z-[1001] bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl hover:scale-105 transition"
      >
        <ArrowLeft size={24} className="text-gray-800" />
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
        center={myLocation ? [myLocation.lat, myLocation.lng] : [12.9716, 77.5946]}
        zoom={16}
        zoomControl={false} // Disable default so we can move it
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <MapEvents onClose={() => setActiveTab(null)} />
        <ZoomControl position="bottomleft" />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satellite View">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Street Map">
            <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" maxNativeZoom={19} maxZoom={22} />
          </LayersControl.BaseLayer>
        </LayersControl>

        {myLocation && <LocateControl position={myLocation} />}

        {allUsers.map(user => {
          const isMe = user.id === currentUser?.uid;
          const borderColor = isMe ? "#3B82F6" : "#EF4444"; // Blue for Me, Red for Others
          return (
            <Marker
              key={user.id}
              position={[user.lat, user.lng]}
              icon={createProfileIcon(user.photoURL, borderColor)}
            >
              <Popup className="font-semibold text-gray-800">
                {isMe ? "You" : user.name || "Classmate"}
              </Popup>
            </Marker>
          );
        })}
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
            <button onClick={() => setActiveTab(null)}><X size={18} className="text-gray-400" /></button>
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

const createMarkerIcon = (user, usersInfo, borderColor) => {
  const photo = usersInfo[user.id]?.photoURL;
  return L.divIcon({
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; width: 50px;">
        <div style="background: rgba(0,0,0,0.85); color: white; font-size: 9px; padding: 2px 8px; border-radius: 20px; margin-bottom: 2px; white-space: nowrap; font-weight: 800; border: 1px solid rgba(255,255,255,0.2);">
          ${usersInfo[user.id]?.username || 'User'}
        </div>
        <div style="width: 46px; height: 46px; border-radius: 50%; border: 3px solid ${borderColor}; overflow: hidden; background: #f0f0f0; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          <img src="${photo || 'https://ui-avatars.com/api/?name=User'}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
      </div>`,
    className: 'custom-user-marker',
    iconSize: [50, 70],
    iconAnchor: [25, 70]
  });
};