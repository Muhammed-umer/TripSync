// ./src/pages/Navigation.jsx
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";
import { useLocation } from "./useLocation";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { LocateFixed } from "lucide-react";

// 🔴 Google-style Red Pin
const RedPinIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      transform: translate(-50%, -100%);
      display:flex;
      justify-content:center;
      align-items:center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg"
        width="40" height="40"
        viewBox="0 0 24 24"
        fill="#EA4335">
        <path d="M12 2C8 2 5 5 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-4-3-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5 14.5 7.6 14.5 9 13.4 11.5 12 11.5z"/>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Auto-follow controller
function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 18);
    }
  }, [position, map]);

  return null;
}

const Navigation = () => {
  const navigate = useNavigate();
  const liveLocation = useLocation();

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);

  // Proper permission check
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionDenied(true);
      setCheckingPermission(false);
      return;
    }

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          setPermissionDenied(result.state === "denied");
          setCheckingPermission(false);
        })
        .catch(() => {
          setCheckingPermission(false);
        });
    } else {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissionDenied(false);
          setCheckingPermission(false);
        },
        () => {
          setPermissionDenied(true);
          setCheckingPermission(false);
        }
      );
    }
  }, []);

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => setPermissionDenied(false),
      () => setPermissionDenied(true)
    );
  };

  const currentPos = liveLocation
    ? [liveLocation.lat, liveLocation.lng]
    : null;

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-gray-100">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/home")}
        className="absolute top-5 left-5 z-[1000]
                   bg-white px-4 py-3 rounded-full shadow-lg"
      >
        ⬅
      </button>

      {/* MAP ALWAYS RENDERS (fallback center prevents black screen) */}
      <MapContainer
        center={currentPos || [12.9716, 77.5946]}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {currentPos && (
          <>
            <Marker position={currentPos} icon={RedPinIcon} />
            <MapController position={currentPos} />
          </>
        )}
      </MapContainer>

      {/* SCOPE BUTTON */}
      {currentPos && (
        <button
          onClick={requestLocation}
          className="absolute bottom-8 right-6 z-[1000]
                     w-14 h-14 bg-white rounded-full
                     shadow-2xl flex items-center justify-center"
        >
          <LocateFixed size={24} />
        </button>
      )}

      {/* LOADING STATE (No black screen) */}
      {!currentPos && !permissionDenied && (
        <div className="absolute inset-0 z-[1500]
                        flex items-center justify-center
                        bg-white/70 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">
              Searching for GPS...
            </p>
          </div>
        </div>
      )}

      {/* PERMISSION DENIED MODAL */}
      {!checkingPermission && permissionDenied && (
        <div className="absolute inset-0 z-[2000] flex items-end bg-black/40">
          <div className="w-full bg-[#202124] text-white rounded-t-3xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-semibold">
              Turn on location services
            </h2>

            <p className="text-sm text-gray-300">
              Your browser has blocked location access.
              Please enable location permission in browser settings.
            </p>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => navigate("/home")}
                className="px-4 py-2 text-gray-300"
              >
                No thanks
              </button>

              <button
                onClick={requestLocation}
                className="px-6 py-2 bg-blue-600 rounded-full"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Navigation;