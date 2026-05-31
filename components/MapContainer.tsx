'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix Leaflet's default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface CityPoint {
  id: number;
  province: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  totalRecords: number;
}

interface Props {
  cities: CityPoint[];
  onCityClick: (city: string, province: string | null) => void;
}

export default function MapContainer({ cities, onCityClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [32.427, 53.688],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Label layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Attribution
    L.control.attribution({
      prefix: '<a href="https://accountability.forfreeiran.com">Accountability Archive</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when cities data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Ensure tile layers are still there
    const hasTiles = map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) return;
    });

    // Add city markers
    const markers = cities
      .filter((c) => c.lat && c.lng)
      .map((city) => {
        const size = Math.max(8, Math.min(24, Math.sqrt(city.totalRecords) * 1.5));
        const marker = L.circleMarker([city.lat!, city.lng!], {
          radius: size,
          fillColor: '#8b1e1e',
          color: '#6b1515',
          weight: 1,
          opacity: 0.9,
          fillOpacity: 0.7,
        });

        marker.bindPopup(
          `<div style="text-align:center;font-family:Vazirmatn,sans-serif;font-size:13px">
            <strong>${city.city || 'نامشخص'}</strong><br/>
            <span style="color:#a0a0a0">${city.province || ''}</span><br/>
            <span style="color:#8b1e1e;font-weight:600">${city.totalRecords} سابقه</span>
          </div>`,
          { closeButton: true, className: 'custom-popup' }
        );

        marker.on('click', () => {
          if (city.city) onCityClick(city.city, city.province);
        });

        return marker;
      });

    markers.forEach((m) => m.addTo(map));

    // Fit bounds if we have markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [cities, onCityClick]);

  return <div ref={mapRef} className="w-full h-full" />;
}
