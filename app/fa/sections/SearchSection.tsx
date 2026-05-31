'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { getPersianSourceLabel, formatPersianCount } from '@/lib/source-labels';

interface Person {
  id: number;
  fullName: string | null;
  province: string | null;
  city: string | null;
  sourceFile: string | null;
  sourceLabel?: string;
  reviewStatus: string;
}

interface Province {
  province: string | null;
  totalRecords: number;
  cityCount: number;
}

interface City {
  city: string;
  totalRecords: number;
}

export default function SearchSection() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [fullName, setFullName] = useState('');
  const [results, setResults] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Tree state
  const [treeCities, setTreeCities] = useState<Record<string, City[]>>({});
  const [expandedProvince, setExpandedProvince] = useState<string | null>(null);
  const treeLoadingRef = useRef<Record<string, boolean>>({});

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load provinces on mount
  useEffect(() => {
    fetch('/api/provinces')
      .then((r) => r.json())
      .then((res) => setProvinces(res.data || []))
      .catch(() => {});
  }, []);

  // Load cities when province changes (dropdown)
  useEffect(() => {
    if (!selectedProvince) {
      setCities([]);
      setSelectedCity('');
      return;
    }
    fetch(`/api/provinces/${encodeURIComponent(selectedProvince)}/cities`)
      .then((r) => r.json())
      .then((res) => setCities(res.data || []))
      .catch(() => {});
    setSelectedCity('');
  }, [selectedProvince]);

  // Search — called instantly when province/city/fullName changes
  const doSearch = useCallback(
    async (p: number, prov: string, cit: string, name: string) => {
      if (!prov && !cit && !name) {
        setResults([]);
        setTotal(0);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p), limit: '20' });
        if (name) params.set('q', name);
        if (prov) params.set('province', prov);
        if (cit) params.set('city', cit);
        const res = await fetch(`/api/search?${params}`);
        const json = await res.json();
        setResults(json.data || []);
        setTotal(json.pagination?.total || 0);
        setPage(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Instant search when province or city changes
  useEffect(() => {
    doSearch(1, selectedProvince, selectedCity, fullName);
  }, [selectedProvince, selectedCity]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search for fullName
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(1, selectedProvince, selectedCity, fullName);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fullName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle province in tree
  const toggleProvince = useCallback(
    async (province: string) => {
      if (expandedProvince === province) {
        setExpandedProvince(null);
        return;
      }
      setExpandedProvince(province);

      // Load cities if not cached
      if (!treeCities[province] && !treeLoadingRef.current[province]) {
        treeLoadingRef.current[province] = true;
        try {
          const res = await fetch(`/api/provinces/${encodeURIComponent(province)}/cities`);
          const json = await res.json();
          setTreeCities((prev) => ({ ...prev, [province]: json.data || [] }));
        } catch (err) {
          console.error(err);
        } finally {
          treeLoadingRef.current[province] = false;
        }
      }
    },
    [expandedProvince, treeCities]
  );

  // Click city in tree — load results immediately
  const selectTreeCity = useCallback((cityName: string) => {
    setSelectedCity(cityName);
    document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const totalPages = Math.ceil(total / 20);

  return (
    <section id="search-section" className="relative min-h-screen py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-4">
            <h2 className="text-3xl font-bold text-white mb-1">جستجو</h2>
            <p className="text-sm text-[#a0a0a0]">انتخاب استان و شهر برای مشاهده افراد</p>
          </div>
        </div>

        {/* Controls — glass card */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Province */}
            <div>
              <label className="block text-xs text-[#a0a0a0] mb-2 font-medium">استان</label>
              <div className="relative">
                <select
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    setExpandedProvince(null);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm appearance-none outline-none focus:border-[#8b1e1e] focus:shadow-[0_0_0_3px_rgba(139,30,30,0.15)] transition-all cursor-pointer"
                >
                  <option value="">انتخاب استان</option>
                  {provinces.map((p) => (
                    <option key={p.province || ''} value={p.province || ''}>
                      {p.province} ({formatPersianCount(p.totalRecords)})
                    </option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6b6b6b]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs text-[#a0a0a0] mb-2 font-medium">شهر</label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedProvince}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm appearance-none outline-none focus:border-[#8b1e1e] focus:shadow-[0_0_0_3px_rgba(139,30,30,0.15)] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">انتخاب شهر</option>
                  {cities.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city} ({formatPersianCount(c.totalRecords)})
                    </option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6b6b6b]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Full name free search */}
            <div>
              <label className="block text-xs text-[#a0a0a0] mb-2 font-medium">نام</label>
              <input
                type="text"
                placeholder="جستجوی نام..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#8b1e1e] focus:shadow-[0_0_0_3px_rgba(139,30,30,0.15)] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tree Browser — Province → City */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
          <h3 className="text-sm text-[#a0a0a0] font-medium mb-4">مرور بر اساس استان</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {provinces.map((p) => {
              const isExpanded = expandedProvince === p.province;
              const citiesForProvince = treeCities[p.province || ''] || [];
              return (
                <div key={p.province || ''}>
                  {/* Province row */}
                  <button
                    onClick={() => toggleProvince(p.province || '')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm text-right ${
                      isExpanded
                        ? 'bg-[#8b1e1e]/10 border-[#8b1e1e]/60 text-white'
                        : 'bg-white/5 border-white/10 text-[#ccc] hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isExpanded ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      )}
                      <span>{p.province}</span>
                    </span>
                    <span className="text-[#8b1e1e] font-bold text-xs">
                      {formatPersianCount(p.totalRecords)}
                    </span>
                  </button>

                  {/* Expanded cities */}
                  {isExpanded && (
                    <div className="mt-1 mr-4 space-y-1 border-r border-[#8b1e1e]/30 pr-3">
                      {citiesForProvince.length === 0 && (
                        <div className="text-xs text-[#6b6b6b] px-3 py-2">در حال بارگذاری...</div>
                      )}
                      {citiesForProvince.map((c) => (
                        <button
                          key={c.city}
                          onClick={() => {
                            setSelectedProvince(p.province || '');
                            selectTreeCity(c.city);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#a0a0a0] hover:bg-white/5 hover:text-white transition-all text-right"
                        >
                          <span>{c.city}</span>
                          <span className="text-[#8b1e1e] text-[11px]">
                            {formatPersianCount(c.totalRecords)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div id="search-results">
          {loading ? (
            <div className="text-center text-[#6b6b6b] py-16 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5">
              <div className="animate-pulse">در حال بارگذاری...</div>
            </div>
          ) : (
            <>
              {total > 0 && (
                <div className="text-sm text-[#8b1e1e] mb-4 bg-black/20 backdrop-blur-sm inline-block px-4 py-2 rounded-lg border border-[#8b1e1e]/20 font-medium">
                  نمایش {(page - 1) * 20 + 1} تا {Math.min(page * 20, total)} از {formatPersianCount(total)}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.map((person) => (
                  <div
                    key={person.id}
                    className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-[#8b1e1e]/50 transition-all card-hover"
                  >
                    <Link
                      href={`/people/${person.id}`}
                      className="text-white font-medium no-underline hover:text-[#a32525] block mb-2 text-base"
                    >
                      {person.fullName || 'نامشخص'}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b6b6b]">
                      <span className="bg-white/5 px-2.5 py-1 rounded-md">{person.province}</span>
                      <span className="bg-white/5 px-2.5 py-1 rounded-md">{person.city}</span>
                      <span className="bg-white/5 px-2.5 py-1 rounded-md">
                        {person.sourceLabel || getPersianSourceLabel(person.sourceFile)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md ${
                        person.reviewStatus === 'reviewed'
                          ? 'bg-emerald-900/30 text-emerald-400'
                          : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {person.reviewStatus === 'reviewed' ? 'بررسی شده' : 'در انتظار'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedProvince && total === 0 && !loading && (
                <div className="text-center text-[#6b6b6b] py-16 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5">
                  هیچ نتیجه‌ای برای این انتخاب‌ها یافت نشد
                </div>
              )}

              {!selectedProvince && !selectedCity && !fullName && (
                <div className="text-center text-[#6b6b6b] py-16 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5">
                  یک استان انتخاب کنید تا نتایج نمایش داده شوند
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    disabled={page <= 1}
                    onClick={() => doSearch(page - 1, selectedProvince, selectedCity, fullName)}
                    className="px-4 py-2 text-sm text-[#a0a0a0] border border-white/10 rounded-xl hover:bg-white/5 disabled:opacity-40 transition-all"
                  >
                    قبلی
                  </button>
                  <span className="text-sm text-[#6b6b6b]">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => doSearch(page + 1, selectedProvince, selectedCity, fullName)}
                    className="px-4 py-2 text-sm text-[#a0a0a0] border border-white/10 rounded-xl hover:bg-white/5 disabled:opacity-40 transition-all"
                  >
                    بعدی
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
