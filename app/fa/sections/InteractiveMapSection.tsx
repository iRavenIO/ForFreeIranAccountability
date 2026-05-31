'use client';

import { useCallback, useState, useEffect } from 'react';
import MapToolbar, { type SourceFilter } from './MapToolbar';

interface ClusterCity { city: string; province: string | null; count: number; }
interface CityCluster { lat: number; lng: number; totalRecords: number; precisionType: string; cities: ClusterCity[]; }

interface Props { onClusterClick?: (cluster: CityCluster) => void; }

export default function InteractiveMapSection({ onClusterClick }: Props) {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [clustersEnabled, setClustersEnabled] = useState(true);
  const [labelsEnabled, setLabelsEnabled] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);

  // Toggle Leaflet dragging
  useEffect(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (!map) return;
    try {
      if (dragEnabled) map.dragging?.enable?.();
      else map.dragging?.disable?.();
    } catch {}
  }, [dragEnabled]);

  const handleZoomIn = useCallback(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (map) map.setZoom(map.getZoom() + 1);
  }, []);
  const handleZoomOut = useCallback(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (map) map.setZoom(map.getZoom() - 1);
  }, []);
  const handleReset = useCallback(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (map) map.setView([32.4279, 53.688], 5.2);
  }, []);
  const handleSourceFilter = useCallback((filter: SourceFilter) => {
    setSourceFilter(filter);
    window.dispatchEvent(new CustomEvent('map-source-filter', { detail: { filter } }));
  }, []);
  const handleToggleClusters = useCallback(() => setClustersEnabled((p) => !p), []);
  const handleToggleLabels = useCallback(() => setLabelsEnabled((p) => !p), []);
  const handleToggleDrag = useCallback(() => setDragEnabled((p) => !p), []);

  return (
    <section id="map-section" className="relative min-h-screen">
      <MapToolbar
        sourceFilter={sourceFilter}
        clustersEnabled={clustersEnabled}
        labelsEnabled={labelsEnabled}
        dragEnabled={dragEnabled}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onSourceFilter={handleSourceFilter}
        onToggleClusters={handleToggleClusters}
        onToggleLabels={handleToggleLabels}
        onToggleDrag={handleToggleDrag}
      />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1] pointer-events-none">
        <div className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-lg px-4 py-2 text-center shadow-md">
          <h3 className="text-white font-semibold text-xs">نقشه تعاملی</h3>
          <p className="text-[#6b6b6b] text-[9px] mt-0.5">برای بررسی، نقاط قرمز را کلیک کنید</p>
        </div>
      </div>
    </section>
  );
}
