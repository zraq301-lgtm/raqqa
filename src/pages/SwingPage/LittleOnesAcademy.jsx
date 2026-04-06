import React, { useState, useEffect } from 'react';

const RaqqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // الرابط الذي زودتني به
  const FEED_URL = "https://export.admitad.com/en/webmaster/websites/2928026/products/export_adv_products/?user=raqqa_zazo500b4&code=myhnewkq0i&template=78213&currency=AED&feed_id=15830&last_import=";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // استخدام بروكسي AllOrigins لتخطي حظر CORS
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}`);
        const data = await response.json();
        
        if (!data || !data.contents) throw new Error("لم نتمكن من جلب البيانات");

        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, "text/xml");
        const items = xml.getElementsByTagName("item");

        const parsed = Array.from(items).map((item, index) => {
          // دالة لجلب القيم بناءً على الأسماء التي اخترتها في Admitad
          const getVal = (tagName) => {
            const el = item.getElementsByTagName(tagName)[0];
            return el ? el.textContent.trim() : "";
          };

          return {
            id: index,
            name: getVal("عنوان"),     // مطابق لما اخترته في الصورة
            price: getVal("سعر"),      // مطابق لما اخترته في الصورة
            picture: getVal("صورة"),    // مطابق لما اخترته في الصورة
            url: getVal("عنوان_URL"),  // مطابق لما اخترته في الصورة
            currency: "AED"           // العملة المختارة في الرابط
          };
        }).filter(p => p.name && p.picture); // تأكد أن المنتج له اسم وصورة

        setProducts(parsed.slice(0, 50)); // عرض أول 50 منتج
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("حدث خطأ أثناء تحميل المنتجات. تأكد من أن الرابط يعمل بشكل صحيح.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-rose-500">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
        <p className="font-bold">جاري تحميل تشكيلة رقة الجديدة...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-gray-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#fffafa] py-10 px-4 text-right" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-center mb-10 bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
          رقة للاكسسوارات ✨
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-all border border-rose-50 group">
              <div className="aspect-square overflow-hidden rounded-[1.5rem] bg-gray-50 mb-4">
                <img 
                  src={product.picture} 
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                />
              </div>
              <h3 className="text-sm font-bold text-gray-700 h-10 overflow-hidden line-clamp-2 mb-3">
                {product.name}
              </h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-rose-600 font-black text-lg">{product.price} {product.currency}</span>
              </div>
              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center bg-rose-500 text-white py-3 rounded-2xl text-xs font-bold shadow-lg shadow-rose-100 hover:bg-rose-600 transition-colors"
              >
                اكتشفي المزيد
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RaqqaStore;
