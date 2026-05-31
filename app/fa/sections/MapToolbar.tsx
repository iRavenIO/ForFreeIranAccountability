'use client';

import { useCallback } from 'react';

export type SourceFilter = 'all' | 'basij' | 'sepah' | 'lec';

interface MapToolbarProps {
  sourceFilter: SourceFilter;
  clustersEnabled: boolean;
  labelsEnabled: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onSourceFilter: (filter: SourceFilter) => void;
  onToggleClusters: () => void;
  onToggleLabels: () => void;
}

type ToolItem =
  | { id: 'zoomin' | 'zoomout' | 'reset'; icon: () => JSX.Element; label: string }
  | { id: 'filter-all'; icon: () => JSX.Element; label: string; isFilter: true; filterValue: SourceFilter }
  | { id: 'filter-basij' | 'filter-sepah' | 'filter-lec'; icon: () => JSX.Element; label: string; isFilter: true; filterValue: SourceFilter }
  | { id: 'clusters' | 'labels'; icon: (active: boolean) => JSX.Element; label: string; isToggle: true }
  | { id: 'separator' };

const TOOLS: ToolItem[] = [
  { id: 'zoomin', icon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
    </svg>
  ), label: 'بزرگ‌نمایی' },
  { id: 'zoomout', icon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M8 11h6" />
    </svg>
  ), label: 'کوچک‌نمایی' },
  { id: 'reset', icon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8" /><path d="M22 12h-4l2-3" />
    </svg>
  ), label: 'بازنشانی' },
  { id: 'separator' },
  { id: 'filter-all', icon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ), label: 'همه منابع', isFilter: true, filterValue: 'all' },
  { id: 'filter-basij', icon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  ), label: 'بسیج', isFilter: true, filterValue: 'basij' },
  { id: 'filter-sepah', icon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ), label: 'سپاه', isFilter: true, filterValue: 'sepah' },
  { id: 'filter-lec', icon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ), label: 'نیروی انتظامی', isFilter: true, filterValue: 'lec' },
  { id: 'separator' },
  { id: 'clusters', icon: (active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="2" /><circle cx="17" cy="7" r="2" /><circle cx="8" cy="17" r="2" /><circle cx="16" cy="16" r="2" /><path d="M9 9v8M17 7v9M11 11h4" />
    </svg>
  ), label: 'گروه‌بندی نقاط', isToggle: true },
  { id: 'labels', icon: (active: boolean) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7V4h16v3M9 20h6M12 4v16" />
    </svg>
  ), label: 'نمایش برچسب‌ها', isToggle: true },
];

export default function MapToolbar({
  sourceFilter, clustersEnabled, labelsEnabled,
  onZoomIn, onZoomOut, onReset,
  onSourceFilter, onToggleClusters, onToggleLabels,
}: MapToolbarProps) {
  const handleClick = useCallback((id: string) => {
    switch (id) {
      case 'zoomin': onZoomIn(); break;
      case 'zoomout': onZoomOut(); break;
      case 'reset': onReset(); break;
      case 'filter-all': onSourceFilter('all'); break;
      case 'filter-basij': onSourceFilter('basij'); break;
      case 'filter-sepah': onSourceFilter('sepah'); break;
      case 'filter-lec': onSourceFilter('lec'); break;
      case 'clusters': onToggleClusters(); break;
      case 'labels': onToggleLabels(); break;
    }
  }, [onZoomIn, onZoomOut, onReset, onSourceFilter, onToggleClusters, onToggleLabels]);

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[9990] flex flex-col gap-1.5">
      {TOOLS.map((tool) => {
        if (tool.id === 'separator') return <div key={tool.id} className="w-full h-px bg-white/5 my-1" />;

        const active = !!(
          ((tool as any).isFilter && (tool as any).filterValue === sourceFilter) ||
          ((tool as any).isToggle && ((tool.id === 'clusters' && clustersEnabled) || (tool.id === 'labels' && labelsEnabled)))
        );

        return (
          <div key={tool.id} className="group relative">
            <button
              onClick={() => handleClick(tool.id)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                active
                  ? 'bg-[#8b1e1e] text-white shadow-lg shadow-[#8b1e1e]/30 border border-[#8b1e1e]'
                  : 'bg-black/60 backdrop-blur-md border border-white/10 text-[#a0a0a0] hover:text-white hover:bg-white/10 hover:border-white/20'
              }`}
              aria-label={tool.label}
            >
              {(tool.icon as (a?: boolean) => JSX.Element)(active)}
            </button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              <span className="bg-black/80 backdrop-blur-sm border border-white/10 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-lg">
                {tool.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
