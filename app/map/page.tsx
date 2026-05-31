'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MAP_TILE_CONFIG, IRAN_CENTER } from '@/lib/constants';
import { getPersianSourceLabel } from '@/lib/source-labels';

const MapContainer = dynamic(() => import('@/components/MapContainer'), { ssr: false });

interface CityPoint {
  id: number;
  province: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  totalRecords: number;
}

interface Person {
  id: number;
  fullName: string | null;
  province: string | null;
  city: string | null;
  sourceFile: string | null;
  reviewStatus: string;
}

export default function StandaloneMapPage() {
  const [cities, setCities] = useState<CityPoint[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [peopleTotal, setPeopleTotal] = useState(0);
  const [peoplePage, setPeoplePage] = useState(1);
  const [peopleSearch, setPeopleSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [peopleLoading, setPeopleLoading] = useState(false);

  useEffect(() => {
    fetch('/api/map/cities')
      .then((r) => r.json())
      .then((res) => { setCities(res.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadPeople = useCallback(
    async (city: string, province: string | null, page: number, search: string) => {
      setPeopleLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: '50' });
        if (province) params.set('province', province);
        if (search) params.set('q', search);
        const res = await fetch(`/api/cities/${encodeURIComponent(city)}?${params}`);
        const json = await res.json();
        setPeople(json.data || []);
        setPeopleTotal(json.pagination?.total || 0);
        setPeoplePage(page);
      } catch (err) { console.error(err); }
      finally { setPeopleLoading(false); }
    }, []
  );

  const handleCityClick = useCallback(
    (cityName: string, province: string | null) => {
      setSelectedCity(cityName);
      setSelectedProvince(province);
      setPeopleSearch('');
      loadPeople(cityName, province, 1, '');
    }, [loadPeople]
  );

  const closePanel = useCallback(() => {
    setSelectedCity(null);
    setPeople([]);
  }, []);

  const totalPages = Math.ceil(peopleTotal / 50);

  return (
    <div className="h-screen flex flex-col bg-[#111]">
      {/* Map area */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[#6b6b6b]">در حال بارگذاری نقشه...</div>
          </div>
        ) : (
          <MapContainer cities={cities} onCityClick={handleCityClick} />
        )}
      </div>

      {/* City side panel */}
      {selectedCity && (
        <div className="fixed top-0 left-0 bottom-0 w-full md:w-[420px] bg-black/80 backdrop-blur-xl border-l border-white/10 z-[10000] overflow-y-auto pt-16">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedCity}</h2>
                <p className="text-xs text-[#6b6b6b]">{selectedProvince}</p>
              </div>
              <button onClick={closePanel} className="text-[#6b6b6b] hover:text-white p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (selectedCity) loadPeople(selectedCity, selectedProvince, 1, peopleSearch); }}
              className="mb-4"
            >
              <input
                type="search"
                placeholder="جستجو در این شهر..."
                value={peopleSearch}
                onChange={(e) => setPeopleSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
              />
            </form>

            {peopleLoading ? (
              <div className="text-center text-[#6b6b6b] py-8">در حال بارگذاری...</div>
            ) : (
              <>
                <div className="text-xs text-[#6b6b6b] mb-3">{peopleTotal.toLocaleString('fa-IR')} نفر</div>
                <div className="space-y-2">
                  {people.map((person) => (
                    <div key={person.id} className="bg-white/5 border border-white/10 rounded-xl p-3 hover:border-[#8b1e1e]/50 transition-all">
                      <Link
                        href={`/people/${person.id}`}
                        className="text-white font-medium no-underline hover:text-[#a32525] block mb-1"
                      >
                        {person.fullName || 'نامشخص'}
                      </Link>
                      <div className="flex gap-2 text-xs text-[#6b6b6b]">
                        <span>{person.province}</span><span>·</span><span>{getPersianSourceLabel(person.sourceFile)}</span>
                      </div>
                    </div>
                  ))}
                  {people.length === 0 && <div className="text-center text-[#6b6b6b] py-8">نتیجه‌ای یافت نشد</div>}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      disabled={peoplePage <= 1}
                      onClick={() => loadPeople(selectedCity, selectedProvince, peoplePage - 1, peopleSearch)}
                      className="px-3 py-1 text-sm text-[#a0a0a0] border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-50"
                    >قبلی</button>
                    <span className="text-sm text-[#6b6b6b] px-2 py-1">{peoplePage} / {totalPages}</span>
                    <button
                      disabled={peoplePage >= totalPages}
                      onClick={() => loadPeople(selectedCity, selectedProvince, peoplePage + 1, peopleSearch)}
                      className="px-3 py-1 text-sm text-[#a0a0a0] border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-50"
                    >بعدی</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
