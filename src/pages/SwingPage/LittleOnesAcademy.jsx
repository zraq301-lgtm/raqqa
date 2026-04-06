import React, { useState, useEffect } from 'react';

const RaqqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const FEED_URL = "https://export.admitad.com/en/webmaster/websites/2928026/products/export_adv_products/?user=raqqa_zazo500b4&code=myhnewkq0i&template=78213&currency=AED&feed_id=15830&last_import=";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}`);
        const data = await response.json();
        
        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, "text/xml");
        
        // البحث عن العناصر سواء كان اسمها item أو entry (لدعم كل التنسيقات)
        const items = xml.getElementsByTagName("item").length > 0 
                      ? xml.getElementsByTagName("item") 
                      : xml.getElementsByTagName("entry");

        if (items.length === 0) throw new Error("لا توجد منتجات في الرابط حالياً");

        const parsed = Array.from(items).map((item, index) => {
          // دالة ذكية تبحث عن الحقل بأكثر من اسم (عربي وإنجليزي)
          const findValue = (tags) => {
            for (let tag of tags) {
              const el = item.getElementsByTagName(tag)[0] || 
                         Array.from(item.childNodes).find(node => node.nodeName.includes(tag));
              if (el && el.textContent) return el.textContent.trim();
            }
            return "";
          };

          return {
            id: index,
            name: findValue(["عنوان", "title", "name"]),
            price: findValue(["سعر", "price"]),
            picture: findValue(["صورة", "image", "thumbnail"]),
            url: findValue(["عنوان_URL", "url", "link"]),
            currency: "AED"
          };
        }).filter(p => p.name && p.url); // التأكد من وجود اسم ورابط على الأقل

        setProducts(parsed.slice(0, 40));
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("حدث خطأ في قراءة البيانات. تأكد من حفظ القالب في Admitad واختيار حقول (عنوان، سعر، صورة).");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="p-20 text-center text-rose-500 font-bold animate-pulse">جاري جلب أحدث الإكسسوارات...</div>;
  if (error) return <div className="p-20 text-center text-gray-500 bg-white m-4 rounded-3xl border border-rose-50">{error}</div>;

  return (
    <div className="min-h-screen bg-[#fffafa] p-4 text-right" dir="rtl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-3 rounded-[2rem] shadow-sm border border-rose-50 flex flex-col h-full group">
            <div className="aspect-square mb-3 overflow-hidden rounded-[1.5rem] bg-gray-50">
              <img src={p.picture} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-[10px] font-bold h-8 overflow-hidden mb-2 leading-tight text-gray-700">{p.name}</h3>
            <div className="mt-auto">
              <p className="text-rose-500 font-black text-sm mb-3">{p.price} <span className="text-[8px]">{p.currency}</span></p>
              <a href={p.url} target="_blank" rel="noopener noreferrer" 
                 className="block bg-rose-500 text-white text-center py-2 rounded-xl text-[10px] font-bold shadow-md hover:bg-rose-600">
                تسوقي الآن
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RaqqaStore;
