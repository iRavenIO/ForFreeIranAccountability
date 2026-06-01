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
  maskedPhone?: string | null;
  maskedPostal?: string | null;
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

export default function StandaloneSearchPage() {
  const [publishAppData] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.dataset.publish === 'true';
    }
    return false;
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [fullName, setFullName] = useState('');
  const [results, setResults] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/api/provinces')
      .then((r) => r.json())
      .then((res) => setProvinces(res.data || []))
      .catch(() => {});
  }, []);

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

  const doSearch = useCallback(
    async (p: number, prov: string, cit: string, name: string) => {
      if (!prov && !cit && !name) {
        setResults([]);
        setTotal(0);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p), limit: '15' });
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

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="min-h-screen bg-[#111] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">جستجو</h1>
          <p className="text-sm text-[#a0a0a0]">استان → شهر → نام</p>
          <Link
            href="/fa"
            className="text-xs text-[#8b1e1e] hover:text-[#a32525] no-underline mt-2 inline-block"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#a0a0a0] mb-2 font-medium">استان</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm appearance-none outline-none focus:border-[#8b1e1e] transition-all cursor-pointer"
              >
                <option value="">انتخاب استان</option>
                {provinces.map((p) => (
                  <option key={p.province || ''} value={p.province || ''}>
                    {p.province} ({formatPersianCount(p.totalRecords)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#a0a0a0] mb-2 font-medium">شهر</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedProvince}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm appearance-none outline-none focus:border-[#8b1e1e] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">انتخاب شهر</option>
                {cities.map((c) => (
                  <option key={c.city} value={c.city}>
                    {c.city} ({formatPersianCount(c.totalRecords)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#a0a0a0] mb-2 font-medium">نام</label>
              <input
                type="text"
                placeholder="نام و نام خانوادگی..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#8b1e1e] transition-all"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-[#6b6b6b] py-12 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5">
            <div className="animate-pulse">در حال بارگذاری...</div>
          </div>
        ) : (
          <>
            {total > 0 && (
              <div className="text-sm text-[#8b1e1e] mb-4 bg-black/20 backdrop-blur-sm inline-block px-4 py-2 rounded-lg border border-[#8b1e1e]/20 font-medium">
                نمایش {(page - 1) * 15 + 1} تا {Math.min(page * 15, total)} از {formatPersianCount(total)}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map((person) => (
                <div
                  key={person.id}
                  className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-[#8b1e1e]/50 transition-all"
                >
                  <Link
                    href={`/people/${person.id}`}
                    className="text-white font-medium no-underline hover:text-[#a32525] block mb-2"
                  >
                    {person.fullName || 'نامشخص'}
                  </Link>
                  <div className="flex flex-wrap gap-2 text-xs text-[#6b6b6b]">
                    <span className="bg-white/5 px-2 py-1 rounded">{person.province}</span>
                    <span className="bg-white/5 px-2 py-1 rounded">{person.city}</span>
                    <span className="bg-white/5 px-2 py-1 rounded">
                      {person.sourceLabel || getPersianSourceLabel(person.sourceFile)}
                    </span>
                    <span className={`px-2.5 py-1 rounded ${
                      person.reviewStatus === 'reviewed'
                        ? 'bg-emerald-900/30 text-emerald-400'
                        : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {person.reviewStatus === 'reviewed' ? 'بررسی شده' : 'در انتظار'}
                    </span>
                    {publishAppData && person.maskedPostal && (
                      <span className="bg-white/5 px-2 py-1 rounded font-mono" title="کد پستی (۴ رقم آخر)">
                        {person.maskedPostal}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {results.length === 0 && total === 0 && (selectedProvince || selectedCity || fullName) && (
                <div className="col-span-full text-center text-[#6b6b6b] py-12 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5">
                  هیچ نتیجه‌ای یافت نشد
                </div>
              )}
              {!selectedProvince && !selectedCity && !fullName && (
                <div className="col-span-full text-center text-[#6b6b6b] py-12 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5">
                  یک استان انتخاب کنید تا نتایج نمایش داده شوند
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => doSearch(page - 1, selectedProvince, selectedCity, fullName)}
                  className="px-4 py-2 text-sm text-[#a0a0a0] border border-white/10 rounded-xl hover:bg-white/5 disabled:opacity-40 transition-all"
                >
                  قبلی
                </button>
                <span className="text-sm text-[#6b6b6b] px-2 py-2">
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
  );
}
