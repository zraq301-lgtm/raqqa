import React, { useState, useEffect } from 'react';

const RaqqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // الرابط الجديد الذي زودتني به
  const FEED_URL = "https://export.admitad.com/en/webmaster/websites/2928026/products/export_adv_products/?user=raqqa_zazo500b4&code=myhnewkq0i&template=78213&currency=AED&feed_id=15830&last_import=";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // استخدام AllOrigins لتجاوز قيود CORS والوصول للبيانات
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}`);
        const data = await response.json();
        
        if (!data || !data.contents) throw new Error("لم نتمكن من جلب محتوى المتجر حالياً");

        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, "text/xml");
        
        // البحث عن العناصر داخل ملف الـ XML
        let items = xml.getElementsByTagName("item");
        if (items.length === 0) items = xml.getElementsByTagName("entry");

        if (items.length === 0) {
            throw new Error("لا توجد منتجات حالياً. تأكد من الضغط على Save Template في Admitad");
        }

        const parsed = Array.from(items).map((item, index) => {
          // دالة جلب القيم بناءً على الحقول الإنجليزية الموضحة في صورتك
          const getVal = (tagName) => {
            const el = item.getElementsByTagName(tagName)[0];
            return el ? el.textContent.trim() : "";
          };

          return {
            id: index,
            name: getVal("title") || getVal("name"), // جلب اسم المنتج
            price: getVal("price"),                  // جلب السعر
            picture: getVal("image"),                // جلب رابط الصورة
            url: getVal("url"),                      // جلب رابط الأفلييت
            currency: "AED"                          // العملة المختارة في الرابط
          };
        }).filter(p => p.name && p.url); // عرض المنتجات التي تحتوي على بيانات أساسية فقط

        setProducts(parsed.slice(0, 50));
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("حدث خطأ في قراءة البيانات. تأكد من اختيار الحقول (title, price, image) في Admitad.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="p-20 text-center text-rose-500 font-bold animate-pulse">جاري جلب أحدث تشكيلة لمتجر رقة...</div>;
  
  if (error) return (
    <div className="p-10 text-center bg-white m-6 rounded-[2rem] shadow-sm border border-rose-50">
      <p className="text-gray-400 text-sm">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 text-rose-500 text-xs font-bold underline">إعادة محاولة</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fffafa] p-4 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-black text-rose-500 mb-2">متجر رقة للاكسسوارات ✨</h1>
          <p className="text-xs text-gray-400">أجمل قطع الإكسسوار المختارة لكِ بعناية</p>
        </header>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-3 rounded-[2rem] shadow-sm border border-rose-50 flex flex-col h-full hover:shadow-xl transition-all duration-300">
              <div className="aspect-square mb-4 overflow-hidden rounded-[1.5rem] bg-gray-50 border border-rose-50/30">
                <img 
                  src={p.picture} 
                  alt={p.name} 
                  className="w-full h-full object-contain" 
                  onError={(e) => e.target.src='https://via.placeholder.com/150?text=Raqqa'}
                />
              </div>
              
              <h3 className="text-[11px] font-bold h-9 overflow-hidden mb-2 text-gray-700 leading-tight">
                {p.name}
              </h3>
              
              <div className="mt-auto">
                <p className="text-rose-600 font-black text-sm mb-4">
                  {p.price} <span className="text-[9px] text-rose-300">AED</span>
                </p>
                <a 
                  href={p.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full bg-rose-500 text-white text-center py-3 rounded-2xl text-[10px] font-bold shadow-lg shadow-rose-100 hover:bg-rose-600 active:scale-95 transition-all"
                >
                  تسوقي الآن
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RaqqaStore;
