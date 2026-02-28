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
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-indigo-950/70 to-black/80"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* LEFT MAIN GLASS CARD */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] p-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] space-y-10">

            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-white">
                  TripSync
                </h1>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">
                  College Expedition '26
                </p>
              </div>

              <div
                onClick={() => navigate("/profile")}
                className="w-12 h-12 bg-white/20 rounded-2xl border border-white/30 flex items-center justify-center cursor-pointer hover:scale-110 transition text-white"
              >
                👤
              </div>
            </div>

            {/* Map Preview */}
            <div
              onClick={() => setShowMap(true)}
              className="rounded-[2rem] overflow-hidden cursor-pointer shadow-xl"
            >
              <div className="h-48">
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

            {/* Emergency */}
            <div className="flex justify-center">
              <button
                onClick={handleEmergency}
                className="w-44 h-44 bg-red-500 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center gap-4 text-white hover:scale-105 transition"
              >
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-3xl animate-pulse">
                  🚨
                </div>
                <span className="font-bold">Emergency Help</span>
              </button>
            </div>

            {/* Expedition */}
            <div className="bg-indigo-900/70 rounded-[2rem] p-6 text-white">
              <h3 className="font-black text-lg mb-1">
                Current Expedition
              </h3>
              <p className="text-indigo-300 text-xs font-bold uppercase mb-4">
                Destination: Vagamon Hills
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Distance Progress</span>
                  <span>75%</span>
                </div>

                <div className="w-full h-2 bg-white/10 rounded-full">
                  <div className="h-full bg-green-400 rounded-full w-3/4 shadow-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CHAT */}
          <div className="flex justify-end">
            <SupportChat />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;