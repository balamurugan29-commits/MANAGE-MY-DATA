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
  "Ludhiana": { lat: 30.9010, lng: 75.8573 },
  
  // Tamil Nadu districts
  "Ariyalur": { lat: 11.1401, lng: 79.0786 },
  "Chengalpattu": { lat: 12.6841, lng: 79.9836 },
  "Cuddalore": { lat: 11.7480, lng: 79.7714 },
  "Dharmapuri": { lat: 12.1265, lng: 78.1565 },
  "Dindigul": { lat: 10.3673, lng: 77.9803 },
  "Erode": { lat: 11.3410, lng: 77.7172 },
  "Kallakurichi": { lat: 11.7383, lng: 78.9639 },
  "Kanchipuram": { lat: 12.8342, lng: 79.7036 },
  "Kanniyakumari": { lat: 8.0883, lng: 77.5385 },
  "Karur": { lat: 10.9601, lng: 78.0766 },
  "Krishnagiri": { lat: 12.5266, lng: 78.2152 },
  "Madurai": { lat: 9.9252, lng: 78.1198 },
  "Mayiladuthurai": { lat: 11.1085, lng: 79.6543 },
  "Nagapattinam": { lat: 10.7656, lng: 79.8436 },
  "Namakkal": { lat: 11.2189, lng: 78.1672 },
  "Nilgiris": { lat: 11.4102, lng: 76.6950 },
  "Perambalur": { lat: 11.2342, lng: 78.8820 },
  "Pudukkottai": { lat: 10.3796, lng: 78.8208 },
  "Ramanathapuram": { lat: 9.3639, lng: 78.8394 },
  "Ranipet": { lat: 12.9270, lng: 79.3328 },
  "Salem": { lat: 11.6643, lng: 78.1460 },
  "Sivaganga": { lat: 9.8433, lng: 78.4803 },
  "Tenkasi": { lat: 8.9593, lng: 77.3139 },
  "Thanjavur": { lat: 10.7870, lng: 79.1378 },
  "Theni": { lat: 10.0104, lng: 77.4748 },
  "Thoothukudi": { lat: 8.7642, lng: 78.1348 },
  "Tiruchirappalli": { lat: 10.7905, lng: 78.7047 },
  "Tirunelveli": { lat: 8.7139, lng: 77.7567 },
  "Tirupathur": { lat: 12.4934, lng: 78.5678 },
  "Tiruppur": { lat: 11.1085, lng: 77.3411 },
  "Tiruvallur": { lat: 13.1438, lng: 79.9077 },
  "Tiruvannamalai": { lat: 12.2253, lng: 79.0747 },
  "Tiruvarur": { lat: 10.7711, lng: 79.6420 },
  "Vellore": { lat: 12.9165, lng: 79.1325 },
  "Viluppuram": { lat: 11.9401, lng: 79.4861 },
  "Virudhunagar": { lat: 9.5680, lng: 77.9624 }
};

// Exact latitude/longitude mapping for Areas inside Indian Cities
const AREA_COORDINATES = {
  "Chennai": {
    "Anna Nagar": { lat: 13.0850, lng: 80.2101 },
    "Guindy": { lat: 13.0067, lng: 80.2206 },
    "Tambaram": { lat: 12.9249, lng: 80.1247 },
    "Adyar": { lat: 13.0012, lng: 80.2565 },
    "T. Nagar": { lat: 13.0418, lng: 80.2341 },
    "Velachery": { lat: 12.9815, lng: 80.2196 }
  },
  "Delhi": {
    "Connaught Place": { lat: 28.6304, lng: 77.2177 },
    "Dwarka": { lat: 28.5823, lng: 77.0500 },
    "Saket": { lat: 28.5244, lng: 77.2103 },
    "Karol Bagh": { lat: 28.6506, lng: 77.1897 },
    "Vasant Kunj": { lat: 28.5292, lng: 77.1512 },
    "Okhla": { lat: 28.5359, lng: 77.2831 }
  },
  "Mumbai": {
    "Andheri": { lat: 19.1136, lng: 72.8697 },
    "Bandra": { lat: 19.0596, lng: 72.8295 },
    "Colaba": { lat: 18.9067, lng: 72.8147 },
    "Borivali": { lat: 19.2307, lng: 72.8567 },
    "Dadar": { lat: 19.0178, lng: 72.8478 },
    "Worli": { lat: 19.0176, lng: 72.8189 }
  },
  "Bengaluru": {
    "Koramangala": { lat: 12.9352, lng: 77.6244 },
    "Indiranagar": { lat: 12.9719, lng: 77.6412 },
    "Jayanagar": { lat: 12.9307, lng: 77.5838 },
    "Whitefield": { lat: 12.9698, lng: 77.7500 },
    "Electronic City": { lat: 12.8485, lng: 77.6601 },
    "HSR Layout": { lat: 12.9121, lng: 77.6446 }
  },
  "Coimbatore": {
    "Gandhipuram": { lat: 11.0182, lng: 76.9682 },
    "RS Puram": { lat: 11.0115, lng: 76.9456 },
    "Peelamedu": { lat: 11.0267, lng: 77.0186 },
    "Saibaba Colony": { lat: 11.0234, lng: 76.9472 },
    "Saravanampatti": { lat: 11.0789, lng: 77.0012 }
  },
  "Pune": {
    "Kothrud": { lat: 18.5074, lng: 73.8077 },
    "Koregaon Park": { lat: 18.5362, lng: 73.8930 },
    "Hinjawadi": { lat: 18.5913, lng: 73.7389 },
    "Viman Nagar": { lat: 18.5679, lng: 73.9143 },
    "Baner": { lat: 18.5590, lng: 73.7787 }
  },
  "Hyderabad": {
    "Gachibowli": { lat: 17.4401, lng: 78.3489 },
    "Madhapur": { lat: 17.4483, lng: 78.3741 },
    "Jubilee Hills": { lat: 17.4325, lng: 78.4071 },
    "Banjara Hills": { lat: 17.4173, lng: 78.4316 },
    "Secunderabad": { lat: 17.4399, lng: 78.4983 }
  },
  "Kolkata": {
    "Salt Lake": { lat: 22.5804, lng: 88.4217 },
    "New Town": { lat: 22.5878, lng: 88.4724 },
    "Park Street": { lat: 22.5530, lng: 88.3524 },
    "Howrah": { lat: 22.5815, lng: 88.3079 },
    "Tollygunge": { lat: 22.4930, lng: 88.3473 }
  },
  "Jaipur": {
    "Malviya Nagar": { lat: 26.8529, lng: 75.8036 },
    "Vaishali Nagar": { lat: 26.9079, lng: 75.7380 },
    "Mansarovar": { lat: 26.8579, lng: 75.7601 },
    "C-Scheme": { lat: 26.9101, lng: 75.8020 }
  },
  "Surat": {
    "Adajan": { lat: 21.1960, lng: 72.7950 },
    "Varachha": { lat: 21.2120, lng: 72.8622 },
    "Piplod": { lat: 21.1751, lng: 72.7758 },
    "Vesu": { lat: 21.1396, lng: 72.7830 }
  },
  "Ahmedabad": {
    "Satellite": { lat: 23.0298, lng: 72.5273 },
    "C G Road": { lat: 23.0269, lng: 72.5620 },
    "Vastrapur": { lat: 23.0373, lng: 72.5281 },
    "Bodakdev": { lat: 23.0378, lng: 72.5119 }
  },
  "Noida": {
    "Sector 62": { lat: 28.6219, lng: 77.3639 },
    "Sector 18": { lat: 28.5708, lng: 77.3261 },
    "Sector 15": { lat: 28.5786, lng: 77.3119 },
    "Sector 63": { lat: 28.6282, lng: 77.3827 }
  },
  "Gurugram": {
    "DLF Phase 3": { lat: 28.4909, lng: 77.0898 },
    "Sector 29": { lat: 28.4682, lng: 77.0637 },
    "Sohna Road": { lat: 28.4069, lng: 77.0424 },
    "Golf Course Road": { lat: 28.4419, lng: 77.0980 }
  },
  "Vadodara": {
    "Alkapuri": { lat: 22.3129, lng: 73.1678 },
    "Gotri": { lat: 22.3279, lng: 73.1360 },
    "Manjalpur": { lat: 22.2858, lng: 73.1932 },
    "Sayajigunj": { lat: 22.3102, lng: 73.1812 }
  },
  "Ludhiana": {
    "Model Town": { lat: 30.8931, lng: 75.8362 },
    "Civil Lines": { lat: 30.9168, lng: 75.8450 },
    "Sarabha Nagar": { lat: 30.9022, lng: 75.8188 }
  }
};

export default function MapComponent({ listings, selectedCityName, selectedAreaName }) {
  const mapContainerRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // If Leaflet library is not loaded on the window yet, abort
    if (!window.L) return;

    let center = { lat: 20.5937, lng: 78.9629 }; // Center of India
    let zoom = 5;

    // Check if user filtered by a specific area
    if (selectedCityName && selectedAreaName && AREA_COORDINATES[selectedCityName] && AREA_COORDINATES[selectedCityName][selectedAreaName]) {
      center = AREA_COORDINATES[selectedCityName][selectedAreaName];
      zoom = 14;
    } else if (selectedCityName && CITY_COORDINATES[selectedCityName]) {
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

        let markerLat = cityCoords.lat + latOffset;
        let markerLng = cityCoords.lng + lngOffset;

        // Try to match area or address to a known area in the city to position it precisely
        let matchedArea = null;
        if (cityName && AREA_COORDINATES[cityName]) {
          const areas = Object.keys(AREA_COORDINATES[cityName]);
          
          // 1. Direct match with item.area
          const itemAreaLower = (item.area || '').toLowerCase().trim();
          if (itemAreaLower) {
            for (const area of areas) {
              if (itemAreaLower === area.toLowerCase() || itemAreaLower.includes(area.toLowerCase())) {
                matchedArea = area;
                break;
              }
            }
          }

          // 2. Fallback to matching within item.address
          if (!matchedArea) {
            const addressLower = (item.address || '').toLowerCase();
            for (const area of areas) {
              if (addressLower.includes(area.toLowerCase())) {
                matchedArea = area;
                break;
              }
            }
          }
        }

        if (matchedArea && cityName && AREA_COORDINATES[cityName][matchedArea]) {
          const areaCoords = AREA_COORDINATES[cityName][matchedArea];
          // Add a very small random jitter so pins in the exact same area don't overlap completely
          const jitterLat = (Math.sin(item.id * 15.3) * 0.001);
          const jitterLng = (Math.cos(item.id * 19.8) * 0.001);
          markerLat = areaCoords.lat + jitterLat;
          markerLng = areaCoords.lng + jitterLng;
        }

        // Leaflet custom marker pin styled with custom CSS
        const iconHtml = `
          <div style="
            background-color: #6366f1;
            color: #ffffff;
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
              <a href="#/listings/${item.id}" style="color: #6366f1; text-decoration: none; font-weight: bold; hover: underline;">
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

  }, [listings, selectedCityName, selectedAreaName]);

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
