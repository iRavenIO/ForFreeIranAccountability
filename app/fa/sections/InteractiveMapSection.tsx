'use client';

import { useCallback, useEffect, useState } from 'react';
import MapToolbar, { type MapMode, type SourceFilter } from './MapToolbar';

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

interface Props {
  mapMode: MapMode;
  onMapModeChange: (mode: MapMode) => void;
  onClusterClick?: (cluster: CityCluster) => void;
}

export default function InteractiveMapSection({
  mapMode,
  onMapModeChange,
  onClusterClick,
}: Props) {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [clustersEnabled, setClustersEnabled] = useState(true);
  const [labelsEnabled, setLabelsEnabled] = useState(false);
  const isExploreActive = mapMode === 'explore';

  // Lock/unlock body scroll based on map mode
  useEffect(() => {
    if (isExploreActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isExploreActive]);

  // ESC to exit explore mode
  useEffect(() => {
    if (!isExploreActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMapModeChange('content');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isExploreActive, onMapModeChange]);

  const toggleMapMode = useCallback(() => {
    onMapModeChange(isExploreActive ? 'content' : 'explore');
  }, [isExploreActive, onMapModeChange]);

  const handleZoomIn = useCallback(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (map) {
      map.setZoom(map.getZoom() + 1);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (map) {
      map.setZoom(map.getZoom() - 1);
    }
  }, []);

  const handleReset = useCallback(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (map) map.setView([32.4279, 53.688], 5.2);
  }, []);

  const handleSourceFilter = useCallback(
    (filter: SourceFilter) => {
      setSourceFilter(filter);
      // Trigger marker reload in HeroSection via window event
      window.dispatchEvent(
        new CustomEvent('map-source-filter', { detail: { filter } })
      );
    },
    []
  );

  const handleToggleClusters = useCallback(() => {
    setClustersEnabled((prev) => !prev);
  }, []);

  const handleToggleLabels = useCallback(() => {
    setLabelsEnabled((prev) => !prev);
  }, []);

  return (
    <section id="map-section" className="relative min-h-screen">
      {/* Map toolbar — floating left-side vertical bar */}
      <MapToolbar
        mapMode={mapMode}
        sourceFilter={sourceFilter}
        clustersEnabled={clustersEnabled}
        labelsEnabled={labelsEnabled}
        onToggleMapMode={toggleMapMode}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onSourceFilter={handleSourceFilter}
        onToggleClusters={handleToggleClusters}
        onToggleLabels={handleToggleLabels}
      />

      {/* Status label when in explore mode */}
      {isExploreActive && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[9990] animate-fadeIn">
          <span className="bg-[#8b1e1e]/80 backdrop-blur-sm border border-[#8b1e1e] text-white text-xs px-5 py-2 rounded-full shadow-lg">
            حالت تعامل با نقشه فعال است
          </span>
        </div>
      )}

      {/* Floating title card (compact, top-right) */}
      <div className="absolute top-24 right-4 z-[2]">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-3 text-right shadow-lg">
          <h3 className="text-white font-semibold text-sm">نقشه تعاملی</h3>
          <p className="text-[#6b6b6b] text-[10px] mt-0.5">
            {isExploreActive
              ? 'نقشه در حالت کاوش — ESC برای خروج'
              : 'برای کاوش، حالت نقشه را فعال کنید'}
          </p>
        </div>
      </div>

      {/* Exit explore button (floating) */}
      {isExploreActive && (
        <button
          onClick={() => onMapModeChange('content')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[9990] bg-black/70 backdrop-blur-md border border-white/20 text-white text-sm px-6 py-3 rounded-xl hover:bg-white/10 hover:border-[#8b1e1e] transition-all shadow-lg animate-fadeIn flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          خروج از حالت نقشه
        </button>
      )}

      {/* CSS for fadeIn animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -4px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </section>
  );
}
