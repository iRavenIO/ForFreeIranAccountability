'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MAP_TILE_CONFIG, APP_NAME, APP_TAGLINE, IRAN_CENTER } from '@/lib/constants';

interface ClusterCity {
  city: string;
  province: string | null;
  count: number;
}

interface CityCluster {
  lat: number;
  lng: number;
  totalRecords: number;
  precisionType: string;
  cities: ClusterCity[];
}

type SourceFilter = 'all' | 'basij' | 'sepah' | 'lec';

interface Props {
  onCityClick: (city: string, province: string | null) => void;
  onClusterClick?: (cluster: CityCluster) => void;
}

export default function HeroSection({ onCityClick, onClusterClick }: Props) {
  const [clusters, setClusters] = useState<CityCluster[]>([]);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const mapInitRef = useRef(false);
  const markerLayerRef = useRef<any>(null);

  // Load clustered city data
  const loadMarkers = useCallback(
    async (filter: SourceFilter) => {
      try {
        let url = '/api/map/cities';
        if (filter !== 'all') {
          const sourceMap: Record<SourceFilter, string> = {
            all: '',
            basij: 'Basij',
            sepah: 'Sepah',
            lec: 'LEC',
          };
          url = `/api/map/cities?source=${sourceMap[filter]}`;
        }
        const res = await fetch(url);
        const json = await res.json();
        setClusters(json.data || []);
      } catch {
        // silent
      }
    },
    []
  );

  useEffect(() => {
    loadMarkers(sourceFilter);
  }, [sourceFilter, loadMarkers]);

  // Listen for source filter events from toolbar
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.filter) {
        setSourceFilter(detail.filter);
      }
    };
    window.addEventListener('map-source-filter', handler);
    return () => window.removeEventListener('map-source-filter', handler);
  }, []);

  // Initialize map once
  useEffect(() => {
    if (typeof window === 'undefined' || mapInitRef.current) return;
    let cancelled = false;

    import('leaflet').then((mod) => {
      if (cancelled) return;
      const L = mod.default || mod;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map('persistent-map', {
        center: IRAN_CENTER,
        zoom: 5.2,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
      });

      L.tileLayer(MAP_TILE_CONFIG.dark.tiles, {
        subdomains: MAP_TILE_CONFIG.dark.subdomains,
        maxZoom: 19,
      }).addTo(map);

      L.tileLayer(MAP_TILE_CONFIG.dark.labels, {
        subdomains: MAP_TILE_CONFIG.dark.subdomains,
      }).addTo(map);

      L.control.attribution({
        prefix: '<a href="https://accountability.forfreeiran.com" style="color:#6b6b6b;font-size:10px">Accountability Archive</a>',
        position: 'bottomleft',
      }).addTo(map);

      mapInitRef.current = true;
      (window as any).__ACCOUNTABILITY_MAP__ = map;
    });

    return () => { cancelled = true; };
  }, []);

  // Add animated divIcon markers
  useEffect(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (!map || clusters.length === 0) return;

    let cancelled = false;

    import('leaflet').then((mod) => {
      if (cancelled) return;
      const L = mod.default || mod;

      // Clear previous marker layer
      if (markerLayerRef.current) {
        map.removeLayer(markerLayerRef.current);
      }

      const markerGroup = L.layerGroup().addTo(map);
      markerLayerRef.current = markerGroup;

      clusters.forEach((cluster) => {
        const count = cluster.totalRecords;
        const size = Math.max(12, Math.min(40, Math.sqrt(count) * 1.8));
        const countText = count > 999
          ? `${(count / 1000).toFixed(1)}k`
          : count.toLocaleString('fa-IR');

        const icon = L.divIcon({
          className: 'red-marker-icon',
          html: `<div class="marker-container marker-load-anim" style="--marker-size:${size}px; --marker-delay:${Math.random() * 0.5}s">
            <div class="marker-pulse-ring"></div>
            <div class="marker-core">
              <span class="marker-count">${countText}</span>
            </div>
            <div class="marker-glow"></div>
          </div>`,
          iconSize: [size * 2, size * 2],
          iconAnchor: [size, size],
          popupAnchor: [0, -size],
        });

        const marker = L.marker([cluster.lat, cluster.lng], { icon }).addTo(markerGroup);

        // Tooltip
        const cityList = cluster.cities
          .slice(0, 3)
          .map((c) => c.city)
          .join('، ');
        const more =
          cluster.cities.length > 3 ? ` و ${cluster.cities.length - 3} شهر دیگر` : '';
        marker.bindTooltip(
          `<div style="text-align:center;font-family:Vazirmatn,sans-serif;direction:rtl;min-width:80px">
            <strong style="font-size:14px;color:#8b1e1e">${countText}</strong><br/>
            <span style="color:#a0a0a0;font-size:11px">سابقه</span><br/>
            <span style="color:#ccc;font-size:10px">${cityList}${more}</span>
          </div>`,
          { direction: 'top', offset: L.point(0, -6) }
        );

        marker.on('click', () => {
          if (cluster.cities.length === 1) {
            const c = cluster.cities[0];
            if (c.city) onCityClick(c.city, c.province);
          } else if (onClusterClick) {
            onClusterClick(cluster);
          }
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [clusters, onCityClick, onClusterClick]);

  return (
    <section
      id="hero-section"
      className="relative min-h-screen flex items-center justify-center px-4 pt-14"
    >
      {/* Hero content */}
      <div className="relative z-[2] text-center max-w-3xl mx-auto pt-16 pb-24">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
          {APP_NAME}
        </h1>
        <p className="text-xl md:text-2xl text-[#a0a0a0] mb-8 leading-relaxed">
          {APP_TAGLINE}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#search-section"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#search-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#8b1e1e] text-white font-semibold text-lg hover:bg-[#a32525] transition-all shadow-lg shadow-[#8b1e1e]/30"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            جستجو
          </a>
        </div>

        <div className="mt-16 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="2">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </div>

      {/* Marker animation styles */}
      <style jsx global>{`
        /* Marker animation keyframes */
        @keyframes marker-load {
          0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
          70% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        @keyframes marker-pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }

        .red-marker-icon {
          background: none !important;
          border: none !important;
        }

        .marker-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: marker-load 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          animation-delay: var(--marker-delay, 0s);
        }

        .marker-pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: calc(var(--marker-size) * 2);
          height: calc(var(--marker-size) * 2);
          border-radius: 50%;
          background: rgba(139, 30, 30, 0.15);
          animation: marker-pulse 3s ease-out infinite;
          animation-delay: var(--marker-delay, 0s);
        }

        .marker-core {
          position: relative;
          width: var(--marker-size);
          height: var(--marker-size);
          border-radius: 50%;
          background: #8b1e1e;
          border: 2px solid #5a1212;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(139, 30, 30, 0.4);
        }

        .marker-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: calc(var(--marker-size) * 1.4);
          height: calc(var(--marker-size) * 1.4);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,30,30,0.2) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .marker-count {
          color: white;
          font-size: calc(var(--marker-size) * 0.38);
          font-weight: 700;
          font-family: Vazirmatn, sans-serif;
          direction: rtl;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          pointer-events: none;
          user-select: none;
        }
      `}</style>
    </section>
  );
}
