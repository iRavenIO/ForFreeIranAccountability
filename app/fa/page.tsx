'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import HeroSection from './sections/HeroSection';
import SearchSection from './sections/SearchSection';
import InteractiveMapSection from './sections/InteractiveMapSection';
import MethodologySection from './sections/MethodologySection';
import ContactSection from './sections/ContactSection';
import CityPanel from './sections/CityPanel';
import StickyHeader from './sections/StickyHeader';

type MapMode = 'content' | 'explore';

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

export default function FALandingPage() {
  const [selectedCity, setSelectedCity] = useState<{
    city: string;
    province: string | null;
  } | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<CityCluster | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>('content');
  const [inViewMapSection, setInViewMapSection] = useState(false);
  const savedScrollRef = useRef(0);

  // IntersectionObserver: detect when user scrolls into map section
  useEffect(() => {
    const el = document.getElementById('map-section');
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInViewMapSection(entry.isIntersecting),
      { rootMargin: '-30% 0px -40% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ====================================================================
  // MapInteractionController — NO CSS layout changes, only JS scroll lock
  // ====================================================================
  useEffect(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (!map) return;

    if (mapMode === 'explore') {
      // Full map interaction
      try { map.dragging?.enable?.(); } catch {}
      try { map.scrollWheelZoom?.enable?.(); } catch {}
      try { map.doubleClickZoom?.enable?.(); } catch {}
      try { map.boxZoom?.enable?.(); } catch {}
      try { map.keyboard?.enable?.(); } catch {}
      try { map.touchZoom?.enable?.(); } catch {}

      // Save current scroll position
      savedScrollRef.current = window.scrollY;

      // Lock scroll by restoring position instantly on every scroll event
      // No CSS change means no layout shift → Leaflet tiles stay intact
      const lockScroll = () => {
        window.scrollTo(0, savedScrollRef.current);
      };
      window.addEventListener('scroll', lockScroll, { passive: false });

      // Force Leaflet to recalculate after any potential layout shift
      const t0 = setTimeout(() => map.invalidateSize(), 0);
      const t1 = setTimeout(() => map.invalidateSize(), 100);
      const t2 = setTimeout(() => map.invalidateSize(), 300);

      return () => {
        window.removeEventListener('scroll', lockScroll);
        clearTimeout(t0); clearTimeout(t1); clearTimeout(t2);
      };
    } else {
      // Content mode
      try { map.scrollWheelZoom?.disable?.(); } catch {}
      try { map.doubleClickZoom?.disable?.(); } catch {}
      try { map.boxZoom?.disable?.(); } catch {}
      try { map.keyboard?.disable?.(); } catch {}

      // Force recalculate
      const timer = setTimeout(() => map.invalidateSize(), 100);
      return () => clearTimeout(timer);
    }
  }, [mapMode]);

  // Invalidate Leaflet when entering map section
  useEffect(() => {
    if (!inViewMapSection) return;
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (!map) return;
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [inViewMapSection]);

  // Invalidate when panel opens/closes
  useEffect(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (!map) return;
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [selectedCity, selectedCluster]);

  const handleCityClick = useCallback(
    (cityName: string, province: string | null) => {
      setSelectedCity({ city: cityName, province });
      setSelectedCluster(null);
    },
    []
  );

  const handleClusterClick = useCallback((cluster: CityCluster) => {
    setSelectedCluster(cluster);
    setSelectedCity(null);
  }, []);

  const closeCityPanel = useCallback(() => {
    setSelectedCity(null);
    setSelectedCluster(null);
  }, []);

  const isExplore = mapMode === 'explore';
  const inMap = inViewMapSection;

  return (
    <div className="relative min-h-screen">
      {/* ======================================================== */}
      {/* Fixed map layer */}
      {/* ======================================================== */}
      <div className="fixed inset-0 z-0">
        <div
          id="persistent-map"
          className={`w-full h-full ${inMap && isExplore ? 'map-interactive' : 'map-static'}`}
          style={{ pointerEvents: inMap ? 'auto' : 'none' }}
        />
      </div>

      {/* ======================================================== */}
      {/* Overlay — REMOVED from DOM in map section */}
      {/* ======================================================== */}
      {!inMap && (
        <div
          className="fixed inset-0 z-[1]"
          style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ======================================================== */}
      {/* Sticky navigation */}
      {/* ======================================================== */}
      <StickyHeader />

      {/* ======================================================== */}
      {/* City/cluster slide-over panel */}
      {/* ======================================================== */}
      {(selectedCity || selectedCluster) && (
        <CityPanel
          city={selectedCity?.city}
          province={selectedCity?.province}
          cluster={selectedCluster || undefined}
          onClose={closeCityPanel}
        />
      )}

      {/* ======================================================== */}
      {/* Scrollable content sections */}
      {/* ======================================================== */}
      <div className="relative z-10">
        <HeroSection
          onCityClick={handleCityClick}
          onClusterClick={handleClusterClick}
        />

        <SearchSection />

        <InteractiveMapSection
          mapMode={mapMode}
          onMapModeChange={setMapMode}
          onClusterClick={handleClusterClick}
        />

        <MethodologySection />

        <ContactSection />
      </div>

      {/* ======================================================== */}
      {/* Marker visibility CSS */}
      {/* ======================================================== */}
      <style jsx global>{`
        .map-static .marker-container {
          opacity: 0.35;
        }
        .map-static .marker-pulse-ring,
        .map-static .marker-glow {
          opacity: 0.25;
        }
        .map-interactive .marker-container {
          opacity: 1;
        }
        .map-interactive .marker-pulse-ring,
        .map-interactive .marker-glow {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
