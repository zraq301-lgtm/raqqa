import React, { useState, useEffect } from 'react';

const RaqqaFullStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // الرابط الخاص بك الذي يحتوي على كل المنتجات
  const FEED_URL = "https://export.admitad.com/en/webmaster/websites/2928026/products/export_adv_products/?user=raqqa_zazo500b4&code=myhnewkq0i&template=78213&currency=AED&feed_id=15830&last_import=";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // استخدام AllOrigins مع إضافة timestamp لضمان جلب أحدث بيانات من Admitad
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}&_=${Date.now()}`);
        const data = await response.json();
        
        if (!data.contents) throw new Error("لا توجد استجابة من الخادم");

        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, "text/xml");
        
        // جلب العناصر سواء كانت باسم item أو entry (لدعم كل صيغ Admitad)
        let items = xml.getElementsByTagName("item");
        if (items.length === 0) items = xml.getElementsByTagName("entry");

        const parsedData = Array.from(items).map((item, index) => {
          // دالة بحث ذكية تبحث عن الحقل بكل مسمياته المحتملة (عربي وإنجليزي)
          const getVal = (possibleTags) => {
            for (let tag of possibleTags) {
              const el = item.getElementsByTagName(tag)[0];
              if (el && el.textContent) return el.textContent.trim();
            }
            return "";
          };

          return {
            id: index,
            // يبحث عن العنوان في: title أو عنوان أو name
            name: getVal(["title", "عنوان", "name"]),
            // يبحث عن السعر في: price أو سعر أو amount
            price: getVal(["price", "سعر", "amount"]),
            // يبحث عن الصورة في: image أو صورة أو picture
            picture: getVal(["image", "صورة", "picture"]),
            // يبحث عن الرابط في: url أو عنوان_URL أو link
            url: getVal(["url", "عنوان_URL", "link"]),
            currency: "AED"
          };
        }).filter(p => p.name && p.url); // تصفية المنتجات غير المكتملة

        setProducts(parsedData);
        setLoading(false);
      } catch (err) {
        setError("تأكد من حفظ القالب في Admitad واختيار (title, price, image)");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="p-20 text-center text-rose-500 animate-pulse font-bold">جاري تحميل المتجر الكامل...</div>;

  return (
    <div className="min-h-screen bg-[#fffafa] p-4 text-right" dir="rtl">
      <h1 className="text-2xl font-black text-rose-500 text-center mb-8 italic">مجموعة رقة المختارة ✨</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-3 rounded-[2.5rem] shadow-sm border border-rose-50 flex flex-col h-full hover:shadow-lg transition-all">
            <div className="aspect-square mb-3 overflow-hidden rounded-[2rem] bg-gray-50 border border-rose-50/20">
              <img 
                src={product.picture} 
                className="w-full h-full object-contain" 
                alt=""
                onError={(e) => e.target.src='https://via.placeholder.com/150?text=Raqqa'}
              />
            </div>
            <h3 className="text-[11px] font-bold h-9 overflow-hidden mb-2 text-gray-700 leading-tight">
              {product.name}
            </h3>
            <div className="mt-auto">
              <p className="text-rose-600 font-black text-sm mb-3">
                {product.price} <span className="text-[9px]">AED</span>
              </p>
              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-rose-500 text-white text-center py-2.5 rounded-2xl text-[10px] font-bold shadow-md active:scale-95 transition-transform"
              >
                تسوقي الآن
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RaqqaFullStore;
