'use client';

import { useCallback, useState, useEffect } from 'react';

const NAV_ITEMS = [
  { label: 'خانه', href: '#hero-section' },
  { label: 'جستجو', href: '#search-section' },
  { label: 'نقشه', href: '#map-section' },
  { label: 'روش‌شناسی', href: '#methodology-section' },
  { label: 'تماس', href: '#contact-section' },
];

export default function StickyHeader() {
  const [activeSection, setActiveSection] = useState('');

  // IntersectionObserver: highlight active nav item on scroll
  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.href.replace('#', ''));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        {
          rootMargin: '-40% 0px -55% 0px',
          threshold: 0,
        }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    []
  );

  return (
    <header className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-between px-4 pt-3 pb-1 pointer-events-none">
      {/* Brand — minimal, top-right */}
      <div />

      {/* Center pill nav */}
      <nav className="pointer-events-auto mx-auto">
        <div className="inline-flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-2.5 shadow-lg shadow-black/20">
          {NAV_ITEMS.map((item, i) => {
            const sectionId = item.href.replace('#', '');
            const isActive = activeSection === sectionId;
            return (
              <span key={item.href} className="flex items-center gap-3">
                {i > 0 && (
                  <span className="w-px h-3 bg-white/10" />
                )}
                <a
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className={`text-xs no-underline transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-[#8b1e1e] font-semibold'
                      : 'text-[#a0a0a0] hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              </span>
            );
          })}
        </div>
      </nav>

      {/* Brand — minimal, right side */}
      <div className="pointer-events-auto flex-shrink-0">
        <a
          href="#hero-section"
          onClick={(e) => handleClick(e, '#hero-section')}
          className="text-white/60 text-[11px] font-medium no-underline hover:text-white/90 transition-colors whitespace-nowrap"
        >
          آرشیو پاسخگویی
        </a>
      </div>
    </header>
  );
}
