// ./src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from "react-leaflet";
import { useLocation } from "./useLocation"; 
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SupportChat from "./SupportChat";
import SearchField from "./SearchField"; // Integrated geosearch

// Fix Leaflet marker icon
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -41],
});
L.Marker.prototype.options.icon = DefaultIcon;
// Fix Leaflet z-index issue
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    .leaflet-pane,
    .leaflet-top,
    .leaflet-bottom {
      z-index: 0 !important;
    }
  `;
  document.head.appendChild(style);
}
// Helper to recenter map
function MapController({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

const Home = () => {
  const [showMap, setShowMap] = useState(false);
  const liveLocation = useLocation(20);

  const currentPos = liveLocation
    ? [liveLocation.lat, liveLocation.lng]
    : [12.9716, 77.5946];

  const handleEmergency = () => {
    alert("🚨 Emergency triggered! Coordinates: " + currentPos.join(", "));
  };

  // --- FULL SCREEN MAP VIEW ---
  if (showMap) {
    return (
      <div className="h-screen w-full flex flex-col bg-white overflow-hidden">
        {/* Navigation Header */}
        <div className="bg-indigo-600 p-3 sm:p-4 text-white flex justify-between items-center shadow-lg z-[1002]">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowMap(false)} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              ⬅️
            </button>
            <h1 className="font-bold text-sm sm:text-lg truncate">Live Navigation</h1>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] bg-green-400 text-black px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
          </div>
        </div>

        <div className="flex-1 relative">
          <MapContainer center={currentPos} zoom={16} style={{ height: "100%", width: "100%" }}>
            {/* The SearchField handles its own UI positioning via leaflet-geosearch */}
            <SearchField />

            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Street View">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satellite View">
                <TileLayer attribution='© Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              </LayersControl.BaseLayer>
            </LayersControl>

            {liveLocation && (
              <Marker position={currentPos}>
                <Popup><b>You are here</b></Popup>
              </Marker>
            )}

            <MapController position={currentPos} />
          </MapContainer>

          {/* Floating "Locate Me" Button - Bottom Right */}
          <button 
            onClick={() => liveLocation && window.dispatchEvent(new Event('resize'))}
            className="absolute bottom-8 right-4 sm:right-6 z-[1000] bg-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center border border-gray-100 active:scale-90 transition-transform text-xl"
            aria-label="Locate Me"
          >
            🎯
          </button>
        </div>
      </div>
    );
  }

  // --- RESPONSIVE DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center overflow-x-hidden">
      {/* Top Banner */}
      <div className="w-full bg-indigo-600 pt-8 pb-16 px-6 rounded-b-[3rem] shadow-xl">
        <div className="max-w-md mx-auto flex justify-between items-center text-white">
          <div>
            <h1 className="text-3xl font-black">TripSync</h1>
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">College Expedition '26</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 flex items-center justify-center">
             🚀
          </div>
        </div>
      </div>

      <div className="w-full max-w-md px-6 -mt-10 space-y-6 pb-24">
        {/* Mini Map Preview Card */}
        <div 
          onClick={() => setShowMap(true)}
          className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden cursor-pointer border border-gray-100 group transition-all hover:shadow-indigo-200/50"
        >
          <div className="h-44 relative overflow-hidden">
            <MapContainer 
              center={currentPos} 
              zoom={14} 
              zoomControl={false} 
              dragging={false} 
              touchZoom={false} 
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={currentPos} />
            </MapContainer>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-5">
               <span className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold shadow-lg text-xs flex items-center gap-2">
                 📍 Tap to Open Map
               </span>
            </div>
          </div>
          <div className="p-5 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Status: Tracking Live</p>
              <p className="text-sm font-bold text-gray-800">Explore Nearby Points</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
               🗺️
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl">💬</div>
            <span className="text-xs font-bold text-gray-600">Group Chat</span>
          </button>
          
          <button 
             onClick={handleEmergency}
             className="bg-red-50 p-5 rounded-3xl shadow-sm border border-red-100 hover:bg-red-100 transition-all flex flex-col items-center gap-3 group"
          >
            <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg group-active:scale-95 animate-pulse">🚨</div>
            <span className="text-xs font-bold text-red-600 tracking-tighter">Emergency Help</span>
          </button>
        </div>

        {/* Real-time Itinerary Innovation */}
        <div className="bg-indigo-900 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-black text-lg mb-1">Current Expedition</h3>
            <p className="text-indigo-300 text-[10px] font-bold uppercase mb-4">Destination: Vepanapalli Falls</p>
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                    <span>Distance Progress</span>
                    <span>75%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full">
                    <div className="h-full bg-green-400 rounded-full w-3/4 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                </div>
            </div>
          </div>
          {/* Abstract background shape */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
        </div>
      </div>

      <SupportChat />
    </div>
  );
};

export default Home;