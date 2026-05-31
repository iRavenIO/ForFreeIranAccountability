'use client';

import { useEffect, useState, useCallback } from 'react';
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
  city?: string;
  province?: string | null;
  cluster?: CityCluster;
  onClose: () => void;
}

export default function CityPanel({ city, province, cluster, onClose }: Props) {
  const [people, setPeople] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const [sourceBreakdown, setSourceBreakdown] = useState<
    { sourceLabel: string; count: number }[]
  >([]);

  // Determine display title
  const displayTitle = cluster
    ? `نقطه تجمیعی — ${formatPersianCount(cluster.totalRecords)} سابقه`
    : city || '';
  const displaySubtitle = cluster
    ? `${cluster.cities.length} شهر`
    : province || '';

  const loadPeople = useCallback(
    async (p: number, q: string, filterCity?: string, filterProvince?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p), limit: '30' });

        if (cluster && filterCity && filterProvince) {
          // Cluster mode: filter by specific city+province
          params.set('city', filterCity);
          params.set('province', filterProvince);
        } else if (city && province) {
          params.set('city', city);
          params.set('province', province);
        } else if (city) {
          params.set('city', city);
        }

        if (q) params.set('q', q);
        const res = await fetch(`/api/search?${params}`);
        const json = await res.json();
        setPeople(json.data || []);
        setTotal(json.pagination?.total || 0);
        setPage(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [city, province, cluster]
  );

  // Load on mount
  useEffect(() => {
    if (cluster && cluster.cities.length === 1) {
      // Single city in cluster: load it directly
      const c = cluster.cities[0];
      loadPeople(1, '', c.city, c.province || undefined);
      setActiveCity(c.city);
      setActiveProvince(c.province);
      fetchSourceBreakdown(c.city, c.province);
    } else if (!cluster) {
      loadPeople(1, '');
      if (city) fetchSourceBreakdown(city, province);
    }
  }, [cluster, loadPeople]);

  // Fetch source breakdown for active city
  const fetchSourceBreakdown = useCallback(
    async (cityName: string, provName?: string | null) => {
      try {
        const params = new URLSearchParams({ city: cityName });
        if (provName) params.set('province', provName);
        const res = await fetch(`/api/search/stats?${params}`);
        const json = await res.json();
        setSourceBreakdown(json.data || []);
      } catch {
        // silent
      }
    },
    []
  );

  // Group cluster cities by province
  const groupedCities = cluster
    ? cluster.cities.reduce<Record<string, ClusterCity[]>>((acc, c) => {
        const prov = c.province || 'نامشخص';
        if (!acc[prov]) acc[prov] = [];
        acc[prov].push(c);
        return acc;
      }, {})
    : {};

  const totalPages = Math.ceil(total / 30);

  return (
    <div className="fixed inset-0 z-[9998] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-black/80 backdrop-blur-2xl border-l border-white/10 h-full overflow-y-auto shadow-2xl">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{displayTitle}</h2>
              <p className="text-sm text-[#a0a0a0]">{displaySubtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#6b6b6b] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cluster hierarchy: Province → City */}
          {cluster && cluster.cities.length > 1 && (
            <div className="mb-5 space-y-3">
              {Object.entries(groupedCities).map(([prov, cities]) => {
                const provTotal = cities.reduce((sum, c) => sum + c.count, 0);
                const isProvActive = activeProvince === prov;
                return (
                  <div key={prov}>
                    {/* Province group header */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8b1e1e]" />
                      <span className="text-sm text-white font-medium">{prov}</span>
                      <span className="text-xs text-[#8b1e1e]">
                        {formatPersianCount(provTotal)} نفر
                      </span>
                    </div>

                    <div className="mr-4 space-y-1 border-r border-[#8b1e1e]/20 pr-3">
                      {cities.map((c) => (
                        <button
                          key={`${prov}-${c.city}`}
                          onClick={() => {
                            setActiveCity(c.city);
                            setActiveProvince(prov);
                            loadPeople(1, search, c.city, c.province || undefined);
                            fetchSourceBreakdown(c.city, c.province);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-right transition-all ${
                            activeCity === c.city && activeProvince === prov
                              ? 'bg-[#8b1e1e]/15 text-white border border-[#8b1e1e]/40'
                              : 'text-[#a0a0a0] hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span>{c.city}</span>
                          <span className="text-[#8b1e1e] text-[11px]">
                            {formatPersianCount(c.count)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active city info (single city or selected from cluster) */}
          {(activeCity || (city && !cluster)) && (
            <>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#6b6b6b]">استان</p>
                    <p className="text-sm text-white">{activeProvince || province}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-[#6b6b6b]">شهر</p>
                    <p className="text-sm text-white">{activeCity || city}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-[#6b6b6b]">تعداد</p>
                    <p className="text-sm text-[#8b1e1e] font-bold">
                      {formatPersianCount(total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Source breakdown */}
              {sourceBreakdown.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
                  <p className="text-[10px] text-[#6b6b6b] mb-2">تفکیک منابع</p>
                  <div className="flex flex-wrap gap-2">
                    {sourceBreakdown.map((s) => (
                      <div
                        key={s.sourceLabel}
                        className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8b1e1e]" />
                        <span className="text-[11px] text-[#a0a0a0]">{s.sourceLabel}</span>
                        <span className="text-[11px] text-[#8b1e1e] font-semibold">
                          {formatPersianCount(s.count)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Search */}
          <div className="mb-4">
            <input
              type="search"
              placeholder={
                activeCity
                  ? `جستجو در ${activeCity}...`
                  : city
                  ? `جستجو در ${city}...`
                  : 'جستجو...'
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                loadPeople(1, e.target.value, activeCity || city || undefined, activeProvince || province || undefined);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#8b1e1e] transition-colors"
            />
          </div>

          {/* People list */}
          {loading ? (
            <div className="text-center text-[#6b6b6b] py-12">
              <div className="animate-pulse">در حال بارگذاری...</div>
            </div>
          ) : (
            <>
              {activeCity && total > 0 && (
                <div className="text-xs text-[#8b1e1e] mb-3 bg-[#8b1e1e]/5 px-3 py-1.5 rounded-lg border border-[#8b1e1e]/10 inline-block">
                  نمایش {(page - 1) * 30 + 1} تا {Math.min(page * 30, total)} از{' '}
                  {formatPersianCount(total)}
                </div>
              )}

              <div className="space-y-2">
                {people.map((person) => (
                  <div
                    key={person.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:border-[#8b1e1e]/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/people/${person.id}`}
                        className="text-white font-medium no-underline hover:text-[#a32525] block mb-1.5 text-sm"
                      >
                        {person.fullName || 'نامشخص'}
                      </Link>
                      <Link
                        href={`/people/${person.id}`}
                        className="text-[#8b1e1e] text-[10px] no-underline hover:text-[#a32525] whitespace-nowrap mt-0.5 transition-colors"
                      >
                        مشاهده ←
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#6b6b6b]">
                      <span className="bg-white/5 px-2 py-0.5 rounded">{person.province}</span>
                      <span className="bg-white/5 px-2 py-0.5 rounded">{person.city}</span>
                      <span className="bg-white/5 px-2 py-0.5 rounded">
                        {person.sourceLabel || getPersianSourceLabel(person.sourceFile)}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${
                        person.reviewStatus === 'reviewed'
                          ? 'bg-emerald-900/30 text-emerald-400'
                          : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {person.reviewStatus === 'reviewed' ? 'بررسی شده' : 'در انتظار'}
                      </span>
                    </div>
                  </div>
                ))}
                {people.length === 0 && !loading && (
                  <div className="text-center text-[#6b6b6b] py-8">نتیجه‌ای یافت نشد</div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-5">
                  <button
                    disabled={page <= 1}
                    onClick={() =>
                      loadPeople(page - 1, search, activeCity || city || undefined, activeProvince || province || undefined)
                    }
                    className="px-3.5 py-1.5 text-sm text-[#a0a0a0] border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-40 transition-all"
                  >
                    قبلی
                  </button>
                  <span className="text-sm text-[#6b6b6b]">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() =>
                      loadPeople(page + 1, search, activeCity || city || undefined, activeProvince || province || undefined)
                    }
                    className="px-3.5 py-1.5 text-sm text-[#a0a0a0] border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-40 transition-all"
                  >
                    بعدی
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
