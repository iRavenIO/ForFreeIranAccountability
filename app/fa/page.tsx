'use client';

import { useState, useCallback, useEffect } from 'react';
import HeroSection from './sections/HeroSection';
import SearchSection from './sections/SearchSection';
import InteractiveMapSection from './sections/InteractiveMapSection';
import MethodologySection from './sections/MethodologySection';
import ContactSection from './sections/ContactSection';
import CityPanel from './sections/CityPanel';
import StickyHeader from './sections/StickyHeader';

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
  const [inViewMapSection, setInViewMapSection] = useState(false);

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

  useEffect(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (!map) return;
    if (inViewMapSection) {
      try { map.scrollWheelZoom?.disable?.(); } catch {}
    }
    setTimeout(() => map.invalidateSize(), 100);
  }, [inViewMapSection]);

  useEffect(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (!map) return;
    setTimeout(() => map.invalidateSize(), 200);
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

  const inMap = inViewMapSection;

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <div
          id="persistent-map"
          className={`w-full h-full ${inMap ? 'map-interactive' : 'map-static'}`}
          style={{ pointerEvents: inMap ? 'auto' : 'none' }}
        />
      </div>

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

      <StickyHeader />

      {(selectedCity || selectedCluster) && (
        <CityPanel
          city={selectedCity?.city}
          province={selectedCity?.province}
          cluster={selectedCluster || undefined}
          onClose={closeCityPanel}
        />
      )}

      <div className="relative z-10">
        <HeroSection onCityClick={handleCityClick} onClusterClick={handleClusterClick} />
        <SearchSection />
        <InteractiveMapSection onClusterClick={handleClusterClick} />
        <MethodologySection />
        <ContactSection />
      </div>

      <style jsx global>{`
        .map-static .marker-container { opacity: 0.35; }
        .map-static .marker-pulse-ring, .map-static .marker-glow { opacity: 0.25; }
        .map-interactive .marker-container { opacity: 1; }
        .map-interactive .marker-pulse-ring, .map-interactive .marker-glow { opacity: 1; }
      `}</style>
    </div>
  );
}
