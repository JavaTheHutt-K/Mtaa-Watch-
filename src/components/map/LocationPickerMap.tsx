import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number, placeName?: string, subCounty?: string) => void;
}

const PRESET_KENYAN_LOCATIONS = [
  { name: 'Ruiru - Kimbo', subCounty: 'Ruiru', county: 'Kiambu County', lat: -1.1465, lng: 36.9582 },
  { name: 'Nairobi - Ngara / Desai', subCounty: 'Starehe', county: 'Nairobi City County', lat: -1.2764, lng: 36.8285 },
  { name: 'Thika - Makongeni Phase 4', subCounty: 'Thika Town', county: 'Kiambu County', lat: -1.0421, lng: 37.0984 },
  { name: 'Juja - High Point / Gate C', subCounty: 'Juja', county: 'Kiambu County', lat: -1.1072, lng: 37.0145 },
  { name: 'Kasarani - Mwiki Hunters', subCounty: 'Kasarani', county: 'Nairobi City County', lat: -1.2215, lng: 36.9048 },
  { name: 'Kiambu Town - Kirigiti', subCounty: 'Kiambu Town', county: 'Kiambu County', lat: -1.1712, lng: 36.8341 },
  { name: 'Westlands - Sarit Area', subCounty: 'Westlands', county: 'Nairobi City County', lat: -1.2616, lng: 36.8045 },
  { name: 'Embakasi East - Fedha', subCounty: 'Embakasi East', county: 'Nairobi City County', lat: -1.3092, lng: 36.8924 },
];

export const LocationPickerMap: React.FC<LocationPickerProps> = ({ lat, lng, onChange }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 13,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div class="flex items-center justify-center -mt-6">
            <div class="w-8 h-8 bg-teal-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold animate-bounce">
              📍
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 28],
      });

      const marker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onChange(position.lat, position.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position if prop changes externally
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
    }
  }, [lat, lng]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          onChange(userLat, userLng, 'GPS Captured Location', 'Local Sub-County');
        },
        () => {
          // If denied, fallback smoothly
          alert('GPS permission not available. Please pick a location from the map or quick presets below.');
        }
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-teal-600" />
          Pinpoint Location on Map
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="text-xs font-medium text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Navigation className="w-3 h-3" />
          Capture GPS
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
        <div ref={mapContainerRef} style={{ height: '240px', width: '100%' }} />
        <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-600 border border-slate-200 shadow-xs">
          Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-1.5 font-medium">Quick Kenyan Demonstration Locations:</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_KENYAN_LOCATIONS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.lat, preset.lng, preset.name, preset.subCounty)}
              className="text-xs bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              📍 {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
