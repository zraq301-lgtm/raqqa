import React, { useState, useEffect } from 'react';

const RaqqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // الرابط الخاص بك
  const FEED_URL = "https://export.admitad.com/en/webmaster/websites/2928026/products/export_adv_products/?user=raqqa_zazo500b4&code=myhnewkq0i&template=78213&currency=AED&feed_id=15830&last_import=";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // جلب البيانات عبر AllOrigins لتخطي حظر CORS
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}`);
        const data = await response.json();
        
        if (!data || !data.contents) throw new Error("لم نتمكن من الوصول لمحتوى الرابط");

        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, "text/xml");
        
        // البحث عن العناصر (item أو entry)
        let items = xml.getElementsByTagName("item");
        if (items.length === 0) items = xml.getElementsByTagName("entry");

        if (items.length === 0) throw new Error("لا توجد منتجات حالياً في هذا القالب");

        const parsed = Array.from(items).map((item, index) => {
          // دالة لجلب القيمة بناءً على الأسماء الإنجليزية التي تظهر في صورتك الأخيرة
          const getVal = (tagName) => {
            const el = item.getElementsByTagName(tagName)[0];
            return el ? el.textContent.trim() : "";
          };

          return {
            id: index,
            name: getVal("title") || getVal("name"), // جلب العنوان
            price: getVal("price"),                  // جلب السعر
            picture: getVal("image"),               // جلب الصورة
            url: getVal("url"),                     // جلب الرابط
            currency: "AED"
          };
        }).filter(p => p.name && p.url); // عرض المنتجات المكتملة فقط

        setProducts(parsed.slice(0, 50));
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("حدث خطأ في عرض المتجر. تأكد من حفظ القالب (Save Template) في Admitad.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="p-20 text-center text-rose-500 font-bold animate-pulse">جاري جلب أحدث الإكسسوارات لـ رقة...</div>;
  
  if (error) return (
    <div className="p-10 text-center bg-white m-6 rounded-[2rem] shadow-sm border border-rose-50">
      <p className="text-gray-400 text-sm">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 text-rose-500 text-xs font-bold">إعادة محاولة</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fffafa] p-4 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-black text-center mb-8 bg-gradient-to-r from-rose-500 to-rose-400 bg-clip-text text-transparent">
          متجر رقة للاكسسوارات ✨
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-3 rounded-[2rem] shadow-sm border border-rose-50 flex flex-col h-full hover:shadow-md transition-all">
              <div className="aspect-square mb-3 overflow-hidden rounded-[1.5rem] bg-gray-50 border border-rose-50/50">
                <img src={p.picture} alt="" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-[11px] font-bold h-9 overflow-hidden mb-2 text-gray-700 leading-tight">
                {p.name}
              </h3>
              <div className="mt-auto pt-2">
                <p className="text-rose-500 font-black text-sm mb-3">
                  {p.price} <span className="text-[9px]">AED</span>
                </p>
                <a 
                  href={p.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full bg-rose-500 text-white text-center py-2.5 rounded-2xl text-[10px] font-bold shadow-sm shadow-rose-100 hover:bg-rose-600 active:scale-95 transition-all"
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
