'use client';

import { useState, useCallback, useEffect } from 'react';
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

  // Toggle Leaflet interactions when explore mode changes
  useEffect(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (!map) return;

    if (mapMode === 'explore') {
      // Full interaction
      try { map.dragging?.enable?.(); } catch {}
      try { map.scrollWheelZoom?.enable?.(); } catch {}
      try { map.doubleClickZoom?.enable?.(); } catch {}
      try { map.boxZoom?.enable?.(); } catch {}
      try { map.keyboard?.enable?.(); } catch {}
      try { map.touchZoom?.enable?.(); } catch {}
      document.body.style.overflow = 'hidden';
    } else {
      // Limited interaction: disable scroll zoom so page scroll works
      try { map.scrollWheelZoom?.disable?.(); } catch {}
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mapMode]);

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

  // Visual mode: blur only outside the map section. Map section is always sharp.
  const inMapSection = inViewMapSection;

  return (
    <div className="relative min-h-screen">
      {/* Fixed map layer — pointer-events auto when in map section */}
      <div className="fixed inset-0 z-0">
        <div
          id="persistent-map"
          className={`w-full h-full bg-[#111] ${inMapSection && mapMode === 'explore' ? 'map-interactive' : 'map-static'}`}
          style={{ pointerEvents: inMapSection ? 'auto' : 'none' }}
        />
      </div>

      {/* Fixed overlay between map and content */}
      <div
        className="fixed inset-0 z-[1]"
        style={{
          background: inMapSection ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.55)',
          backdropFilter: inMapSection ? 'blur(0px)' : 'blur(12px)',
          WebkitBackdropFilter: inMapSection ? 'blur(0px)' : 'blur(12px)',
          transition: 'all 500ms ease',
          pointerEvents: 'none',
        }}
      />

      {/* Sticky navigation */}
      <StickyHeader />

      {/* City/cluster panel */}
      {(selectedCity || selectedCluster) && (
        <CityPanel
          city={selectedCity?.city}
          province={selectedCity?.province}
          cluster={selectedCluster || undefined}
          onClose={closeCityPanel}
        />
      )}

      {/* Scrollable content over map */}
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

      {/* Marker visibility */}
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
