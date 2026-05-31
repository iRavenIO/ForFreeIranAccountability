'use client';

import { useState, useCallback } from 'react';
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

  return (
    <div className="relative min-h-screen">
      {/* Fixed map layer — always visible, always interactive */}
      <div className="fixed inset-0 z-0">
        <div id="persistent-map" className="w-full h-full bg-[#111]" />
      </div>

      {/* Sticky navigation with active scroll detection */}
      <StickyHeader />

      {/* City/cluster panel (slide-over on marker click) */}
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
        {/* Hero — includes map initialization + markers */}
        <HeroSection
          onCityClick={handleCityClick}
          onClusterClick={handleClusterClick}
          mapMode={mapMode}
        />

        {/* Search — dropdowns + tree browser */}
        <SearchSection />

        {/* Map — dedicated interactive section with toolbar */}
        <InteractiveMapSection
          mapMode={mapMode}
          onMapModeChange={setMapMode}
          onClusterClick={handleClusterClick}
        />

        {/* Methodology — lightweight cards */}
        <MethodologySection />

        {/* Contact + Footer */}
        <ContactSection />
      </div>
    </div>
  );
}
