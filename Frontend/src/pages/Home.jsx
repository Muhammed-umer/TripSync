import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import vagamonNight from "../assets/vagamon-night.jpg";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import { useLocation } from "./useLocation";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SupportChat from "./SupportChat";

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

function MapController({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

const Home = () => {
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const liveLocation = useLocation(20);

  const currentPos = liveLocation
    ? [liveLocation.lat, liveLocation.lng]
    : [12.9716, 77.5946];

  const handleEmergency = () => {
    alert("Emergency triggered! Coordinates: " + currentPos.join(", "));
  };

  if (showMap) {
    return (
      <div className="h-screen w-full">
        <MapContainer
          center={currentPos}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={currentPos}>
            <Popup>You are here</Popup>
          </Marker>
          <MapController position={currentPos} />
        </MapContainer>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${vagamonNight})` }}
    >
      {/* Night Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-[#0B1D2A]/50 to-black/70"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* ================= LEFT MAIN TOUR CARD ================= */}
          <div className="bg-[#0F1C2E]/80 backdrop-blur-md border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] w-full max-w-xl mx-auto">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-[#1B4332] to-[#0F3460] px-10 py-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-cyan-200 drop-shadow-md">
                  TripSync
                </h1>
                <p className="text-cyan-100 text-xs font-bold uppercase tracking-widest">
                  College Expedition '26
                </p>
              </div>

              {/* PROFILE BUTTON */}
              <div
                onClick={() => navigate("/profile")}
                className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-teal-300 rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition text-black font-bold"
              >
                👤
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-12 space-y-12">

              {/* MAP */}
              <div
                onClick={() => setShowMap(true)}
                className="w-full rounded-[2rem] overflow-hidden cursor-pointer shadow-xl border border-white/10"
              >
                <div className="h-52">
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
                </div>
              </div>

              {/* EMERGENCY BUTTON */}
              <button
                onClick={handleEmergency}
                className="w-full h-40 bg-gradient-to-r from-red-600 to-red-500 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center gap-4 text-white hover:scale-[1.02] transition"
              >
                <div className="w-14 h-14 bg-red-700 rounded-2xl flex items-center justify-center text-3xl animate-pulse">
                  🚨
                </div>
                <span className="font-bold text-lg">
                  Emergency Help
                </span>
              </button>

              {/* CURRENT EXPEDITION */}
              <div className="w-full bg-gradient-to-r from-[#1E3A5F] to-[#0F3460] rounded-[2rem] p-8 text-white shadow-xl border border-white/10">

                <div className="mb-4">
                  <h3 className="font-black text-lg text-cyan-200">
                    Current Expedition
                  </h3>
                  <p className="text-cyan-100 text-xs font-bold uppercase mt-1">
                    Destination: Vagamon Hills
                  </p>
                </div>

                <div className="w-full h-[1px] bg-cyan-300/30 mb-6 rounded-full"></div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-semibold text-cyan-100">
                    <span>Distance Progress</span>
                    <span>75%</span>
                  </div>

                  <div className="w-full h-3 bg-white/10 rounded-full">
                    <div className="h-full bg-emerald-400 rounded-full w-3/4 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ================= RIGHT CHAT ================= */}
          <div className="flex justify-end">
            <SupportChat />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;