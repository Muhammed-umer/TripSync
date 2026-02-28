// ./src/pages/Home.jsx

<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
import vagamonNight from "../assets/vagamon-night.jpg";
>>>>>>> Stashed changes
=======
import vagamonNight from "../assets/vagamon-night.jpg";
>>>>>>> Stashed changes
import React, { useState, useEffect } from "react";
import vagamonNight from "../assets/vagamon-night.jpg";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from "react-leaflet";
import { useLocation } from "./useLocation";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SupportChat from "./SupportChat";
import SearchField from "./SearchField";

// Fix Leaflet default marker icon
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

// Map recenter helper
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

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  // ================= FULL SCREEN MAP =================
  if (showMap) {
    return (
      <div className="h-screen w-full flex flex-col bg-white overflow-hidden">
        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-lg z-[1002]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMap(false)}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              ⬅️
            </button>
            <h1 className="font-bold text-lg">Live Navigation</h1>
          </div>
          <span className="text-xs bg-green-400 text-black px-3 py-1 rounded-full font-bold animate-pulse">
            LIVE
          </span>
=======
=======
>>>>>>> Stashed changes
  // ================= MAP VIEW =================
  if (showMap) {
    return (
      <div className="h-screen w-full flex flex-col">
        <div className="bg-indigo-900 p-4 text-white flex justify-between items-center shadow-md z-[1000]">
          <h1 className="font-bold tracking-wide">TripSync Live Map</h1>
          <button
            onClick={() => setShowMap(false)}
            className="bg-white text-indigo-900 px-3 py-1 rounded-md text-sm font-medium"
          >
            Back
          </button>
>>>>>>> Stashed changes
        </div>

        <div className="flex-1 relative">
          <MapContainer center={currentPos} zoom={16} style={{ height: "100%", width: "100%" }}>
            <SearchField />

            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Street View">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Satellite View">
                <TileLayer
                  attribution="© Esri"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {liveLocation && (
              <Marker position={currentPos}>
                <Popup>
<<<<<<< Updated upstream
                  <b>You are here</b>
=======
                  <div className="text-center">
                    <p className="font-bold">You are here</p>
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${currentPos[0]},${currentPos[1]}&travelmode=walking`
                        )
                      }
                      className="mt-2 bg-indigo-900 text-white px-2 py-1 rounded text-xs"
                    >
                      Open in Google Maps
                    </button>
                  </div>
>>>>>>> Stashed changes
                </Popup>
              </Marker>
            )}

            <MapController position={currentPos} />
          </MapContainer>
        </div>
      </div>
    );
  }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  // ================= DASHBOARD =================
  return (
    <div
      className="relative min-h-screen bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: `url(${vagamonNight})` }}
    >
      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-indigo-950/70 to-black/80"></div>

      <div className="relative z-10 flex flex-col items-center">

        {/* Top Banner */}
        <div className="w-full bg-indigo-600/90 backdrop-blur-md pt-8 pb-16 px-6 rounded-b-[3rem] shadow-xl">
          <div className="max-w-md mx-auto flex justify-between items-center text-white">
            <div>
              <h1 className="text-3xl font-black">TripSync</h1>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">
                College Expedition '26
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 flex items-center justify-center">
              🚀
            </div>
          </div>
        </div>

        <div className="w-full max-w-md px-6 -mt-10 space-y-6 pb-24">

          {/* Map Preview Card */}
          <div
            onClick={() => setShowMap(true)}
            className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl overflow-hidden cursor-pointer border border-white/30"
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
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-lg flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl">
                💬
              </div>
              <span className="text-xs font-bold text-gray-700">Group Chat</span>
            </button>

            <button
              onClick={handleEmergency}
              className="bg-red-500/90 backdrop-blur-md p-5 rounded-3xl shadow-lg flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center text-2xl animate-pulse">
                🚨
              </div>
              <span className="text-xs font-bold text-white">Emergency Help</span>
            </button>
          </div>

          {/* Expedition Card */}
          <div className="bg-indigo-900/80 backdrop-blur-md rounded-[2rem] p-6 text-white shadow-2xl border border-white/10">
            <h3 className="font-black text-lg mb-1">Current Expedition</h3>
            <p className="text-indigo-300 text-[10px] font-bold uppercase mb-4">
              Destination: Vagamon Hills
            </p>

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
        </div>

        <SupportChat />
=======
  // ================= HOME SCREEN =================
  return (
  <div
    className="relative min-h-screen bg-cover bg-center"
    style={{ backgroundImage: `url(${vagamonNight})` }}
  >
    {/* Slightly Softer Overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-indigo-950/50 to-black/70"></div>

    {/* Main Layout */}
    <div className="relative z-10 min-h-screen flex items-center px-6">

      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-12">

        {/* Navigation Card */}
        <div className="flex-1 flex justify-center">
          <div className="
            bg-white/5 backdrop-blur-2xl
            border border-white/20
            rounded-3xl shadow-2xl
            px-12 py-12 w-full max-w-xl
            text-center text-white">

            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Welcome to TripSync 🛣️
            </h1>

            <p className="text-white/80 mb-8 text-base">
              Stay connected with your trip mates
            </p>

            <div className="flex flex-col gap-5">
              <button
                onClick={() => setShowMap(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-700
                hover:from-indigo-500 hover:to-purple-600
                text-white py-3 rounded-xl font-medium shadow-lg transition duration-300"
              >
                Navigation
              </button>

              <button
                onClick={handleEmergency}
                className="bg-gradient-to-r from-red-600 to-red-700
                hover:from-red-500 hover:to-red-600
                text-white py-3 rounded-xl font-bold shadow-lg transition duration-300"
              >
                🚨 Emergency Help
              </button>
            </div>

            <p className="text-sm text-white/60 mt-6">
              Use Emergency only in urgent situations.
            </p>
          </div>
        </div>

        {/* Chat Section */}
        <div className="w-full lg:w-[380px] flex justify-center lg:justify-end">
          <SupportChat />
        </div>

>>>>>>> Stashed changes
=======
  // ================= HOME SCREEN =================
  return (
  <div
    className="relative min-h-screen bg-cover bg-center"
    style={{ backgroundImage: `url(${vagamonNight})` }}
  >
    {/* Slightly Softer Overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-indigo-950/50 to-black/70"></div>

    {/* Main Layout */}
    <div className="relative z-10 min-h-screen flex items-center px-6">

      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-12">

        {/* Navigation Card */}
        <div className="flex-1 flex justify-center">
          <div className="
            bg-white/5 backdrop-blur-2xl
            border border-white/20
            rounded-3xl shadow-2xl
            px-12 py-12 w-full max-w-xl
            text-center text-white">

            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Welcome to TripSync 🛣️
            </h1>

            <p className="text-white/80 mb-8 text-base">
              Stay connected with your trip mates
            </p>

            <div className="flex flex-col gap-5">
              <button
                onClick={() => setShowMap(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-700
                hover:from-indigo-500 hover:to-purple-600
                text-white py-3 rounded-xl font-medium shadow-lg transition duration-300"
              >
                Navigation
              </button>

              <button
                onClick={handleEmergency}
                className="bg-gradient-to-r from-red-600 to-red-700
                hover:from-red-500 hover:to-red-600
                text-white py-3 rounded-xl font-bold shadow-lg transition duration-300"
              >
                🚨 Emergency Help
              </button>
            </div>

            <p className="text-sm text-white/60 mt-6">
              Use Emergency only in urgent situations.
            </p>
          </div>
        </div>

        {/* Chat Section */}
        <div className="w-full lg:w-[380px] flex justify-center lg:justify-end">
          <SupportChat />
        </div>

>>>>>>> Stashed changes
      </div>
    </div>
  </div>
);
};

export default Home;