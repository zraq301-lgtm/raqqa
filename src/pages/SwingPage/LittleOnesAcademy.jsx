import React, { useState, useEffect } from 'react';

const RaqqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // الرابط الخاص بك من Admitad
  const FEED_URL = "https://export.admitad.com/en/webmaster/websites/2928026/products/export_adv_products/?user=raqqa_zazo500b4&code=myhnewkq0i&template=78213&currency=AED&feed_id=15830&last_import=";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // استخدام AllOrigins لتخطي حظر CORS للمتصفح
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}`);
        const data = await response.json();
        
        if (!data || !data.contents) throw new Error("لم نتمكن من جلب محتوى المتجر حالياً");

        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, "text/xml");
        const items = xml.getElementsByTagName("item");

        if (items.length === 0) {
          throw new Error("الرابط لا يحتوي على منتجات حالياً، تأكد من تحديث القالب في Admitad");
        }

        const parsed = Array.from(items).map((item, index) => {
          // جلب القيم بناءً على الأسماء العربية التي قمت بضبطها في لوحة التحكم
          const getVal = (tagName) => {
            const el = item.getElementsByTagName(tagName)[0];
            return el ? el.textContent.trim() : "";
          };

          return {
            id: index,
            name: getVal("عنوان"),     // حقل العنوان
            price: getVal("سعر"),      // حقل السعر
            picture: getVal("صورة"),    // حقل الصورة
            url: getVal("عنوان_URL"),  // حقل الرابط
            currency: "AED"            // العملة المحددة في الرابط
          };
        }).filter(p => p.name && p.picture); // تصفية المنتجات التي تفتقد للبيانات الأساسية

        setProducts(parsed.slice(0, 50));
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#fffafa] py-12 text-right font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* رأس الصفحة بتصميم Glassmorphism خفيف */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black bg-gradient-to-l from-rose-600 to-rose-400 bg-clip-text text-transparent mb-3">
            رقة للاكسسوارات ✨
          </h1>
          <div className="h-1 w-20 bg-rose-200 mx-auto rounded-full"></div>
        </div>

        {/* حالة التحميل */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-4"></div>
            <p className="text-rose-400 font-medium">جاري تحديث التشكيلة الجديدة...</p>
          </div>
        )}

        {/* حالة الخطأ */}
        {error && (
          <div className="bg-white p-8 rounded-3xl shadow-sm text-center border border-rose-50 max-w-md mx-auto">
            <p className="text-gray-400 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="text-rose-500 text-sm font-bold underline">إعادة المحاولة</button>
          </div>
        )}

        {/* عرض شبكة المنتجات */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-[2rem] p-3 md:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-rose-50 flex flex-col h-full group">
                
                {/* حاوية الصورة */}
                <div className="aspect-square overflow-hidden rounded-[1.5rem] bg-gray-50 mb-4 relative">
                  <img 
                    src={product.picture} 
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
                  />
                </div>
                
                {/* اسم المنتج */}
                <h3 className="text-sm font-bold text-gray-800 h-10 overflow-hidden mb-3 line-clamp-2 leading-relaxed">
                  {product.name}
                </h3>
                
                {/* السعر والزرار في الأسفل */}
                <div className="mt-auto">
                  <div className="mb-4">
                    <span className="text-xl font-black text-rose-500">{product.price}</span>
                    <span className="text-[10px] text-rose-300 mr-1 font-bold">{product.currency}</span>
                  </div>
                  
                  <a 
                    href={product.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-rose-500 text-white py-3 rounded-2xl text-xs font-bold shadow-lg shadow-rose-100 hover:bg-rose-600 active:scale-95 transition-all"
                  >
                    تسوقي الآن
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RaqqaStore;
