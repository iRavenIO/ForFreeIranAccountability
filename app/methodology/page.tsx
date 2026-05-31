export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[#111] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">روش‌شناسی</h1>
          <p className="text-sm text-[#a0a0a0]">منابع داده، حریم خصوصی و پردازش</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl text-white font-semibold mb-3">منابع داده</h2>
            <p className="text-sm text-[#a0a0a0] leading-relaxed">داده‌ها از منابع در دسترس عموم جمع‌آوری شده‌اند.</p>
            <ul className="list-disc list-inside text-sm text-[#a0a0a0] mt-4 space-y-2 pr-4">
              <li>داده‌های LEC و Basij</li>
              <li>داده‌های مکانی مراکز استقرار</li>
              <li>سوابق عمومی موجود</li>
            </ul>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl text-white font-semibold mb-3">حریم خصوصی</h2>
            <p className="text-sm text-[#a0a0a0] leading-relaxed">اطلاعات حساس هرگز در معرض عمومی قرار نمی‌گیرند.</p>
            <ul className="list-disc list-inside text-sm text-[#a0a0a0] mt-4 space-y-2 pr-4">
              <li>آدرس دقیق منتشر نمی‌شود</li>
              <li>کد پستی فقط داخلی است</li>
              <li>شماره تماس و اطلاعات خانوادگی محفوظ می‌مانند</li>
              <li>مختصات فقط در سطح شهر نمایش داده می‌شود</li>
            </ul>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl text-white font-semibold mb-3">پردازش داده</h2>
            <p className="text-sm text-[#a0a0a0] leading-relaxed">داده‌ها به صورت خودکار پردازش و ساختاریافته می‌شوند.</p>
            <ul className="list-disc list-inside text-sm text-[#a0a0a0] mt-4 space-y-2 pr-4">
              <li>نرمال‌سازی نام‌های فارسی</li>
              <li>استانداردسازی مکان‌ها</li>
              <li>اعتبارسنجی کدهای پستی</li>
              <li>تخمین مختصات جغرافیایی</li>
              <li>جداسازی داده‌های حساس</li>
            </ul>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl text-white font-semibold mb-3">شفافیت</h2>
            <p className="text-sm text-[#a0a0a0] leading-relaxed">هدف افزایش شفافیت و امکان پاسخگویی است.</p>
            <div className="mt-4 p-4 bg-[#8b1e1e]/10 border border-[#8b1e1e]/30 rounded-xl">
              <p className="text-xs text-[#a0a0a0]">برای گزارش خطا از بخش تماس استفاده کنید.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
