// ./src/pages/SearchField.jsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

const SearchField = () => {
  const map = useMap();

  useEffect(() => {
    // Uses the OpenStreetMap (Nominatim) service
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider: provider,
      style: "bar", 
      showMarker: true,
      showPopup: true,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: "Search for a waterfall or mountain...",
    });

    map.addControl(searchControl);
    
    // Cleanup when user goes back to Home page
    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
};

export default SearchField;