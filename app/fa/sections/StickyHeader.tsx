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
    <header className="fixed top-0 left-0 right-0 z-[9999] bg-black/60 backdrop-blur-xl border-b border-white/5">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <a
          href="#hero-section"
          onClick={(e) => handleClick(e, '#hero-section')}
          className="text-white font-bold text-lg no-underline hover:text-[#a32525] transition-colors"
        >
          آرشیو پاسخگویی
        </a>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const sectionId = item.href.replace('#', '');
            const isActive = activeSection === sectionId;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleClick(e, item.href)}
                className={`px-3 py-2 text-sm rounded-lg transition-all no-underline ${
                  isActive
                    ? 'text-[#8b1e1e] font-medium bg-[#8b1e1e]/10'
                    : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
                }`}
                style={isActive ? { boxShadow: 'inset 0 -2px 0 #8b1e1e' } : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
