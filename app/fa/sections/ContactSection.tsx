export default function ContactSection() {
  return (
    <section id="contact-section" className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-4">
            <h2 className="text-3xl font-bold text-white mb-1">تماس</h2>
            <p className="text-sm text-[#a0a0a0]">ارتباط با ما</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact info */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h3 className="text-white font-semibold mb-5">اطلاعات تماس</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a
                  href="mailto:info@forfreeiran.com"
                  className="text-[#8b1e1e] hover:text-[#a32525] no-underline text-sm transition-colors"
                >
                  info@forfreeiran.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span className="text-white text-sm" dir="ltr">
                  accountability.forfreeiran.com
                </span>
              </div>
            </div>
          </div>

          {/* Corrections */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h3 className="text-white font-semibold mb-5">درخواست تصحیح</h3>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-4">
              برای گزارش خطا یا درخواست تصحیح اطلاعات، ایمیل بزنید. لطفاً نام، شهر و توضیح خطا را ذکر کنید.
            </p>
            <div className="bg-[#8b1e1e]/10 border border-[#8b1e1e]/20 rounded-xl px-4 py-3">
              <p className="text-xs text-[#a0a0a0]">
                تمام درخواست‌ها بررسی و در اسرع وقت پاسخ داده می‌شوند.
              </p>
            </div>
          </div>
        </div>

        {/* Footer branding */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-black/30 backdrop-blur-md border border-white/5 rounded-2xl px-8 py-5">
            <img src="/logo.png" alt="For Free Iran" className="h-12 mx-auto mb-2" />
            <p className="text-[#6b6b6b] text-sm mt-1" dir="ltr">
              accountability.forfreeiran.com
            </p>
            <p className="text-[#6b6b6b] text-xs mt-0.5" dir="ltr">
              info@forfreeiran.com
            </p>
          </div>
        </div>

        {/* Nav links */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-4 bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl px-6 py-3">
            <a href="#hero-section" className="text-xs text-[#6b6b6b] hover:text-white no-underline transition-colors">خانه</a>
            <span className="text-[#333]">·</span>
            <a href="#search-section" className="text-xs text-[#6b6b6b] hover:text-white no-underline transition-colors">جستجو</a>
            <span className="text-[#333]">·</span>
            <a href="#map-section" className="text-xs text-[#6b6b6b] hover:text-white no-underline transition-colors">نقشه</a>
            <span className="text-[#333]">·</span>
            <a href="#methodology-section" className="text-xs text-[#6b6b6b] hover:text-white no-underline transition-colors">روش‌شناسی</a>
            <span className="text-[#333]">·</span>
            <a href="#contact-section" className="text-xs text-[#6b6b6b] hover:text-white no-underline transition-colors">تماس</a>
          </div>
        </div>

        <div className="text-center mt-4 pb-8">
          <p className="text-[10px] text-[#444]">
            For Free Iran — Accountability Archive
          </p>
        </div>
      </div>
    </section>
  );
}
