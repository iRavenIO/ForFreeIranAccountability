'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import HeroSection from './sections/HeroSection';
import SearchSection from './sections/SearchSection';
import InteractiveMapSection from './sections/InteractiveMapSection';
import MethodologySection from './sections/MethodologySection';
import ContactSection from './sections/ContactSection';
import CityPanel from './sections/CityPanel';
import StickyHeader from './sections/StickyHeader';

interface ClusterCity { city: string; province: string | null; count: number; }
interface CityCluster { lat: number; lng: number; totalRecords: number; precisionType: string; cities: ClusterCity[]; }

export default function FALandingPage() {
  const [selectedCity, setSelectedCity] = useState<{ city: string; province: string | null } | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<CityCluster | null>(null);
  const [inViewMapSection, setInViewMapSection] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Scroll-based map section detection
  useEffect(() => {
    const check = () => {
      const el = document.getElementById('map-section');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setInViewMapSection(rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2);
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, []);

  // Vanilla JS: toggle map mode WITHOUT React re-render of the map container
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    if (inViewMapSection) {
      el.classList.remove('map-static');
      el.classList.add('map-interactive');
      el.style.pointerEvents = 'auto';
    } else {
      el.classList.remove('map-interactive');
      el.classList.add('map-static');
      el.style.pointerEvents = 'none';
    }
    // Invalidate Leaflet
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (map) setTimeout(() => map.invalidateSize(), 50);
  }, [inViewMapSection]);

  // Disable scrollWheelZoom in map section so page scroll works
  useEffect(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (!map) return;
    try { map.scrollWheelZoom?.disable?.(); } catch {}
  }, []);

  useEffect(() => {
    const map = (window as any).__ACCOUNTABILITY_MAP__;
    if (!map) return;
    setTimeout(() => map.invalidateSize(), 200);
  }, [selectedCity, selectedCluster]);

  const handleCityClick = useCallback((cityName: string, province: string | null) => {
    setSelectedCity({ city: cityName, province }); setSelectedCluster(null);
  }, []);
  const handleClusterClick = useCallback((cluster: CityCluster) => {
    setSelectedCluster(cluster); setSelectedCity(null);
  }, []);
  const closeCityPanel = useCallback(() => {
    setSelectedCity(null); setSelectedCluster(null);
  }, []);

  const inMap = inViewMapSection;

  return (
    <div className="relative min-h-screen">
      {/* Map — static render, NEVER changes via React. Vanilla JS handles toggles. */}
      <div className="fixed inset-0 z-0">
        <div ref={mapRef} id="persistent-map" className="w-full h-full map-static" style={{ pointerEvents: 'none' }} />
      </div>

      {/* Blur overlay — only in non-map sections */}
      {!inMap && (
        <div
          className="fixed inset-0 z-[1]"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', pointerEvents: 'none' }}
        />
      )}

      <StickyHeader />

      {(selectedCity || selectedCluster) && (
        <CityPanel city={selectedCity?.city} province={selectedCity?.province} cluster={selectedCluster || undefined} onClose={closeCityPanel} />
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
