export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#111] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">تماس</h1>
          <p className="text-sm text-[#a0a0a0]">ارتباط با ما</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl text-white font-semibold mb-4">اطلاعات تماس</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#6b6b6b] mb-1">ایمیل</label>
                <a href="mailto:info@forfreeiran.com" className="text-lg text-[#8b1e1e] hover:text-[#a32525] no-underline">
                  info@forfreeiran.com
                </a>
              </div>
              <div>
                <label className="block text-sm text-[#6b6b6b] mb-1">دامنه</label>
                <p className="text-white text-lg" dir="ltr">accountability.forfreeiran.com</p>
              </div>
            </div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl text-white font-semibold mb-4">گزارش خطا</h2>
            <p className="text-sm text-[#a0a0a0] leading-relaxed">از طریق ایمیل با ما در میان بگذارید.</p>
            <div className="bg-black/20 rounded-xl p-4 border border-white/5 mt-4">
              <p className="text-xs text-[#a0a0a0] mb-2">لطفاً ذکر کنید:</p>
              <ul className="list-disc list-inside text-xs text-[#6b6b6b] space-y-1 pr-4">
                <li>نام و نام خانوادگی مرتبط</li>
                <li>شهر یا استان</li>
                <li>توضیح خطا</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
