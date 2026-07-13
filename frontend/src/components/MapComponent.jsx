import React, { useEffect, useRef } from 'react';

// Exact latitude/longitude mapping for Indian Cities
const CITY_COORDINATES = {
  "Delhi": { lat: 28.6139, lng: 77.2090 },
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Bengaluru": { lat: 12.9716, lng: 77.5946 },
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Surat": { lat: 21.1702, lng: 72.8311 },
  "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "Pune": { lat: 18.5204, lng: 73.8567 },
  "Hyderabad": { lat: 17.3850, lng: 78.4867 },
  "Kolkata": { lat: 22.5726, lng: 88.3639 },
  "Jaipur": { lat: 26.9124, lng: 75.7873 },
  "Coimbatore": { lat: 11.0168, lng: 76.9558 },
  "Noida": { lat: 28.5355, lng: 77.3910 },
  "Gurugram": { lat: 28.4595, lng: 77.0266 },
  "Vadodara": { lat: 22.3072, lng: 73.1812 },
  "Ludhiana": { lat: 30.9010, lng: 75.8573 }
};

export default function MapComponent({ listings, selectedCityName }) {
  const mapContainerRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // If Leaflet library is not loaded on the window yet, abort
    if (!window.L) return;

    let center = { lat: 20.5937, lng: 78.9629 }; // Center of India
    let zoom = 5;

    // Check if user filtered by a specific city
    if (selectedCityName && CITY_COORDINATES[selectedCityName]) {
      center = CITY_COORDINATES[selectedCityName];
      zoom = 12;
    } else if (listings && listings.length > 0) {
      // Fallback: Center on the first listing's city
      const firstCity = listings[0].city?.name;
      if (firstCity && CITY_COORDINATES[firstCity]) {
        center = CITY_COORDINATES[firstCity];
        zoom = 10;
      }
    }

    // Initialize the Leaflet map container once
    if (!leafletMapInstance.current) {
      leafletMapInstance.current = window.L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([center.lat, center.lng], zoom);

      // Bind OpenStreetMap tile layers
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMapInstance.current);
    } else {
      // Re-center if map exists
      leafletMapInstance.current.setView([center.lat, center.lng], zoom);
    }

    const map = leafletMapInstance.current;

    // Clean existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Plot pins for all listings
    if (listings && listings.length > 0) {
      listings.forEach(item => {
        const cityName = item.city?.name;
        if (!cityName) return;

        const cityCoords = CITY_COORDINATES[cityName] || { lat: 20.5937, lng: 78.9629 };
        
        // Generate pseudo-random offset based on business ID to separate overlapping pins in the same city
        let latOffset = (Math.sin(item.id * 7.5) * 0.008);
        let lngOffset = (Math.cos(item.id * 11.2) * 0.008);

        // Precise location mapping (e.g., Anna Nagar in Chennai)
        const address = (item.address || '').toLowerCase();
        if (cityName === 'Chennai' && address.includes('anna nagar')) {
          // Adjust coordinates relative to Chennai center to place pin directly in Anna Nagar coordinates
          latOffset = 0.0040;  // North offset
          lngOffset = -0.0520; // West offset
        }

        const markerLat = cityCoords.lat + latOffset;
        const markerLng = cityCoords.lng + lngOffset;

        // Leaflet custom marker pin styled with custom CSS
        const iconHtml = `
          <div style="
            background-color: #fbbf24;
            color: #0f172a;
            border: 2px solid #ffffff;
            border-radius: 50%;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            ${item.name.charAt(0)}
          </div>
        `;

        const customIcon = window.L.divIcon({
          html: iconHtml,
          className: 'custom-map-icon',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = window.L.marker([markerLat, markerLng], { icon: customIcon }).addTo(map);

        // Custom HTML tooltip content
        const popupContent = `
          <div style="font-family: 'Inter', sans-serif; min-width: 160px; padding: 0.15rem;">
            <span style="font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; font-weight: 600; display: block; margin-bottom: 2px;">
              ${item.category?.name || 'B2B LISTING'}
            </span>
            <h4 style="margin: 0; font-size: 0.85rem; color: #0f172a;">
              <a href="#/listings/${item.id}" style="color: #1e3a8a; text-decoration: none; font-weight: bold; hover: underline;">
                ${item.name}
              </a>
            </h4>
            <div style="font-size: 0.75rem; color: #475569; margin-top: 4px; display: flex; align-items: center; gap: 3px;">
              📍 ${item.address || (cityName + ', ' + item.city?.state)}
            </div>
            ${item.rating > 0 ? `<div style="font-size: 0.75rem; color: #d97706; margin-top: 4px; font-weight: 600;">★ ${item.rating.toFixed(1)} Rating</div>` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      });
    }

  }, [listings, selectedCityName]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        height: '100%', 
        width: '100%', 
        borderRadius: '12px', 
        border: '1px solid #e2e8f0', 
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        minHeight: '300px'
      }} 
    />
  );
}
