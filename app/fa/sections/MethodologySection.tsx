export default function MethodologySection() {
  return (
    <section id="methodology-section" className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-4">
            <h2 className="text-3xl font-bold text-white mb-1">روش‌شناسی</h2>
            <p className="text-sm text-[#a0a0a0]">منابع داده، حریم خصوصی و پردازش</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#8b1e1e]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#8b1e1e]/20 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b1e1e" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">منابع داده</h3>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              داده‌ها از منابع در دسترس عموم شامل اسناد رسمی و گزارش‌های دولتی جمع‌آوری می‌شوند.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#8b1e1e]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#8b1e1e]/20 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b1e1e" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">حریم خصوصی</h3>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              آدرس، کد پستی، شماره تماس و اطلاعات خانوادگی هرگز در معرض عمومی قرار نمی‌گیرند.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#8b1e1e]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#8b1e1e]/20 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b1e1e" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">مختصات مکانی</h3>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              موقعیت‌ها در سطح شهر تخمین زده می‌شوند. کد پستی فقط برای بهبود دقت به صورت داخلی استفاده می‌شود.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#8b1e1e]/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#8b1e1e]/20 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b1e1e" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">پردازش داده</h3>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              داده‌ها به صورت خودکار نرمال‌سازی، استانداردسازی و اعتبارسنجی می‌شوند. اطلاعات حساس از عمومی جدا می‌شوند.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
