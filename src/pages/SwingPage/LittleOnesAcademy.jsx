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

        // طلب البيانات كنص (Text) وليس JSON لتجنب الخطأ الظاهر في الصورة
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}`);
        const data = await response.json();
        
        // هنا نقرأ المحتوى كنص XML
        const xmlText = data.contents;
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");
        const items = xml.getElementsByTagName("item");

        if (items.length === 0) {
          throw new Error("لم يتم العثور على منتجات. تأكد من تحديث القالب في Admitad");
        }

        const parsed = Array.from(items).map((item, index) => {
          const getVal = (tag) => item.getElementsByTagName(tag)[0]?.textContent || "";
          return {
            id: index,
            name: getVal("عنوان"), 
            price: getVal("سعر"),
            picture: getVal("صورة"),
            url: getVal("عنوان_URL"),
            currency: "AED"
          };
        }).filter(p => p.name && p.picture);

        setProducts(parsed.slice(0, 40));
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("حدث خطأ في قراءة البيانات. تأكد من إعدادات القالب.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="p-20 text-center text-rose-500 font-bold">جاري تحميل رقة للاكسسوارات...</div>;
  if (error) return <div className="p-20 text-center text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-[#fffafa] p-4 text-right" dir="rtl">
      <h1 className="text-2xl font-black text-center mb-8 text-rose-500">رقة للاكسسوارات ✨</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-3 rounded-[2rem] shadow-sm border border-rose-50 flex flex-col">
            <div className="aspect-square mb-3 overflow-hidden rounded-[1.5rem]">
              <img src={p.picture} alt="" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-[10px] font-bold h-8 overflow-hidden mb-2 leading-tight">{p.name}</h3>
            <p className="text-rose-500 font-black text-sm mb-3">{p.price} {p.currency}</p>
            <a href={p.url} target="_blank" rel="noopener" className="bg-rose-500 text-white text-center py-2 rounded-xl text-[10px] font-bold">تسوقي الآن</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RaqqaStore;
