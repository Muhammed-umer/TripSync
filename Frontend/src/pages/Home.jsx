import { useLocation } from "./useLocation"; 

// src/pages/Home.jsx
import  { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet + React
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

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position);
  }, [position, map]);
  return null;
}

const Home = () => {
  const [showMap, setShowMap] = useState(false);
  const liveLocation = useLocation(20); 

  const currentPos = liveLocation ? [liveLocation.lat, liveLocation.lng] : [12.9716, 77.5946];

  const handleEmergency = () => {
    alert("🚨 Emergency triggered! Coordinates: " + currentPos.join(", "));
  };

  if (showMap) {
    return (
      <div className="h-screen w-full flex flex-col">
        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-md z-[1000]">
          <h1 className="font-bold">TripSync Live Map</h1>
          <button onClick={() => setShowMap(false)} className="bg-white text-indigo-600 px-3 py-1 rounded-md text-sm font-medium">
            Back
          </button>
        </div>

        <div className="flex-1 relative">
          <MapContainer center={currentPos} zoom={16} style={{ height: "100%", width: "100%" }}>
            
            <LayersControl position="topright">
              {/* Standard Street View */}
              <LayersControl.BaseLayer checked name="Street View">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              </LayersControl.BaseLayer>

              {/* Satellite View (Esri World Imagery) */}
              <LayersControl.BaseLayer name="Satellite View">
                <TileLayer
                  attribution='© <a href="https://www.esri.com/">Esri</a>'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {liveLocation && (
              <Marker position={currentPos}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold">You are here</p>
                    {/* Deep link for future navigation to others */}
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentPos[0]},${currentPos[1]}&travelmode=walking`)}
                      className="mt-2 bg-indigo-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Open in Google Maps
                    </button>
                  </div>
                </Popup>
              </Marker>
            )}
            <RecenterMap position={currentPos} />
          </MapContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 px-4 text-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">Welcome to TripSync</h1>
        <div className="flex flex-col gap-4 mt-8">
          <button className="bg-indigo-600 text-white py-3 rounded-lg font-medium">💬 Group Chat</button>
          <button onClick={() => setShowMap(true)} className="bg-purple-600 text-white py-3 rounded-lg font-medium">Navigation</button>
          <button onClick={handleEmergency} className="bg-red-600 text-white py-3 rounded-lg font-bold animate-pulse">🚨 Emergency Help</button>
        </div>
      </div>
    </div>
  );
};

export default Home;