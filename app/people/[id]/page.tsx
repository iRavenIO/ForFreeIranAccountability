'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import jalaali from 'jalaali-js';

function toShamsiYear(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    const { jy } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return String(jy);
  } catch {
    return isoDate;
  }
}

interface Person {
  id: number;
  fullName: string | null;
  province: string | null;
  city: string | null;
  sourceFile: string | null;
  sourceLabel: string;
  publicStatus: string;
  reviewStatus: string;
  notesPublic: string | null;
  approximateCityLat: number | null;
  approximateCityLng: number | null;
  maskedPhone: string | null;
  maskedPostal: string | null;
  maskedNationalId: string | null;
  fullPhone?: string | null;
  fullPostal?: string | null;
  address?: string | null;
  dob?: string | null;
  nationalId?: string | null;
  dateOfAddress?: string | null;
  createdAt: string;
}


export default function PersonProfile() {
  const params = useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const publishAppData = process.env.NEXT_PUBLIC_PUBLISH_APP_DATA === 'true';

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    fetch(`/api/people/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((res) => {
        setPerson(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [params?.id]);

  // Initialize mini map with city context
  useEffect(() => {
    if (!person?.approximateCityLat || !person?.approximateCityLng || mapReady) return;

    let cancelled = false;

    import('leaflet').then((mod) => {
      if (cancelled) return;
      const L = mod.default || mod;
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const mapEl = document.getElementById('profile-map');
      if (!mapEl) return;

      const map = L.map('profile-map', {
        center: [person.approximateCityLat!, person.approximateCityLng!],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // City marker
      const marker = L.circleMarker([person.approximateCityLat!, person.approximateCityLng!], {
        radius: 10,
        fillColor: '#8b1e1e',
        color: '#5a1212',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.7,
      });

      marker.bindPopup(
        `<div style="text-align:center;font-family:Vazirmatn,sans-serif;direction:rtl;font-size:13px">
          <strong>${person.city || ''}</strong><br/>
          <span style="color:#a0a0a0">${person.province || ''}</span>
          <br/>
              <a href="/fa#map-section" style="color:#8b1e1e;text-decoration:none;font-size:12px">مشاهده در نقشه ←</a>
        </div>`
      );

      marker.addTo(map);
      setMapReady(true);

      setTimeout(() => map.invalidateSize(), 300);

      return () => {
        cancelled = true;
        map.remove();
      };
    });

    return () => { cancelled = true; };
  }, [person, mapReady]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111]">
        <div className="text-[#6b6b6b]">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#111] px-4">
        <h1 className="text-2xl text-white mb-4">یافت نشد</h1>
        <Link href="/fa" className="text-[#8b1e1e] hover:text-[#a32525]">بازگشت به صفحه اصلی</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/fa#search-section"
          className="text-[#6b6b6b] hover:text-white transition-colors text-sm mb-6 inline-block"
        >
          ← بازگشت
        </Link>

        {/* Profile card */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-white mb-6">
            {person.fullName || 'نامشخص'}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#6b6b6b] mb-1">استان</label>
              <p className="text-white text-lg">{person.province || 'نامشخص'}</p>
            </div>
            <div>
              <label className="block text-sm text-[#6b6b6b] mb-1">شهر</label>
              <p className="text-white text-lg">{person.city || 'نامشخص'}</p>
            </div>
            <div>
              <label className="block text-sm text-[#6b6b6b] mb-1">منبع</label>
              <p className="text-white text-lg">{person.sourceLabel || 'نامشخص'}</p>
            </div>
            <div>
              <label className="block text-sm text-[#6b6b6b] mb-1">وضعیت</label>
              <p className="text-white text-lg">
                {person.reviewStatus === 'reviewed' ? 'بررسی شده' : 'در انتظار'}
              </p>
            </div>

            {/* Postal code — last 4 digits only */}
            {publishAppData && person.maskedPostal && (
              <div>
                <label className="block text-sm text-[#6b6b6b] mb-1">کد پستی</label>
                <p className="text-white text-lg font-mono tracking-widest">{person.maskedPostal}</p>
              </div>
            )}

            {/* National ID — last 4 digits only */}
            {publishAppData && person.maskedNationalId && (
              <div>
                <label className="block text-sm text-[#6b6b6b] mb-1">کد ملی</label>
                <p className="text-white text-lg font-mono tracking-widest">{person.maskedNationalId}</p>
              </div>
            )}

            {/* Date of birth — Shamsi year only */}
            {publishAppData && person.dob && (
              <div>
                <label className="block text-sm text-[#6b6b6b] mb-1">سال تولد</label>
                <p className="text-white text-lg">{toShamsiYear(person.dob)}</p>
              </div>
            )}

            {/* Phone — last 4 digits only (for future imports) */}
            {publishAppData && person.maskedPhone && (
              <div>
                <label className="block text-sm text-[#6b6b6b] mb-1">شماره تماس</label>
                <p className="text-white text-lg font-mono tracking-widest">{person.maskedPhone}</p>
              </div>
            )}
          </div>

          {/* Address — fully masked */}
          {publishAppData && person.address && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <label className="block text-sm text-[#6b6b6b] mb-2">آدرس</label>
              <p className="text-[#6b6b6b] leading-relaxed font-mono text-sm tracking-widest" dir="rtl">
                {'*'.repeat(30)}
              </p>
            </div>
          )}

          {person.notesPublic && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <label className="block text-sm text-[#6b6b6b] mb-2">یادداشت‌ها</label>
              <p className="text-[#a0a0a0] leading-relaxed">{person.notesPublic}</p>
            </div>
          )}
        </div>

        {/* Map context - city marker */}
        {person.approximateCityLat && person.approximateCityLng && (
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
            <h2 className="text-white font-semibold mb-3 text-center">موقعیت شهر: {person.city}</h2>
            <div className="h-[250px] rounded-xl overflow-hidden">
              <div id="profile-map" className="w-full h-full" />
            </div>
            <div className="text-center mt-3">
              <Link
                href="/fa#map-section"
                className="text-sm text-[#8b1e1e] hover:text-[#a32525] no-underline"
              >
                مشاهده در نقشه کامل ←
              </Link>
            </div>
            <p className="text-xs text-[#6b6b6b] text-center mt-2">
              موقعیت تقریبی شهر — آدرس دقیق و مختصات شخصی نمایش داده نمی‌شوند
            </p>
          </div>
        )}

        {/* Privacy notice */}
        <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-[#6b6b6b] text-center leading-relaxed">
            {publishAppData
              ? 'بخشی از اطلاعات این فرد نمایش داده شده است. اطلاعات کامل منتشر نمی‌شود.'
              : 'این صفحه فقط اطلاعات عمومی و غیرحساس را نمایش می‌دهد. آدرس، کد ملی و تاریخ تولد منتشر نمی‌شوند.'}
          </p>
        </div>
      </div>
    </div>
  );
}
