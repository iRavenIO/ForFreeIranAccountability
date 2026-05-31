import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'آرشیو پاسخگویی | Accountability Archive',
  description: 'پایگاه داده اسامی و مکان‌ها - مستندسازی برای پاسخگویی.',
  metadataBase: new URL('https://accountability.forfreeiran.com'),
  openGraph: {
    title: 'آرشیو پاسخگویی — Accountability Archive',
    description: 'Documenting records for accountability and transparency.',
    type: 'website',
    locale: 'fa_IR',
  },
  icons: { icon: '/logo-placeholder.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="min-h-screen bg-[#111] text-[#e0e0e0] font-vazirmatn">
        {children}
      </body>
    </html>
  );
}
