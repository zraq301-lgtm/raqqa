import React, { useState, useEffect } from 'react';

const RaqqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // الرابط الخاص بك من Admitad
  const FEED_URL = "https://export.admitad.com/en/webmaster/websites/2928026/products/export_adv_products/?user=raqqa_zazo500b4&code=myhnewkq0i&format=xml&currency=USD&feed_id=14107&last_import=";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // استخدام AllOrigins لجلب البيانات وتخطي حظر الـ CORS
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL.trim())}`);
        
        if (!response.ok) throw new Error("فشل الاتصال بمزود البيانات");
        
        const data = await response.json();
        
        if (!data || !data.contents) {
          throw new Error("الملف ضخم جداً أو الرابط غير مستجيب حالياً");
        }

        // --- خطوة سحرية: تنظيف النص من الـ Namespaces (g:) التي تسبب المشاكل ---
        // نقوم باستبدال <g:title> بـ <g_title> ليسهل قراءتها
        const cleanXmlString = data.contents.replace(/<g:/g, '<g_').replace(/<\/g:/g, '</g_');
        
        const parser = new DOMParser();
        const xml = parser.parseFromString(cleanXmlString, "text/xml");
        
        // البحث عن المنتجات (item)
        const items = xml.getElementsByTagName("item");

        if (items.length === 0) {
          throw new Error("الرابط يعمل ولكن لم يتم العثور على منتجات داخل ملف الـ XML");
        }

        const parsedProducts = Array.from(items).slice(0, 40).map((item, index) => {
          // دالة داخلية لجلب النصوص بأمان
          const getVal = (tagName) => {
            const element = item.getElementsByTagName(tagName)[0];
            return element ? element.textContent.trim() : "";
          };

          return {
            id: getVal("g_id") || index,
            name: getVal("g_title") || getVal("title") || "منتج رقة",
            price: getVal("g_price") || getVal("price") || "غير محدد",
            picture: getVal("g_image_link") || getVal("image_link") || "",
            url: getVal("link") || getVal("g_link") || "#",
            brand: getVal("g_brand") || ""
          };
        });

        // تصفية المنتجات للتأكد من وجود اسم وصورة على الأقل
        const finalData = parsedProducts.filter(p => p.name && p.picture);
        
        if (finalData.length === 0) {
          throw new Error("البيانات موجودة ولكن لا تحتوي على صور أو أسماء صحيحة");
        }

        setProducts(finalData);
        setLoading(false);
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#fdf8f9] pb-10 text-right font-sans" dir="rtl">
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-center">
          <button className="bg-gradient-to-r from-rose-400 to-violet-500 text-white px-12 py-2.5 rounded-full shadow-lg font-bold text-lg">
            متجر رقة المميز
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-rose-500 font-bold">جاري اختيار أجمل المنتجات...</p>
          </div>
        ) : error ? (
          <div className="text-center p-10 bg-white rounded-3xl shadow-md border border-red-50">
            <p className="text-red-500 font-bold text-lg">حدث خطأ تقني:</p>
            <p className="text-gray-600 mt-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-rose-500 text-white px-6 py-2 rounded-full text-sm"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <div 
                key={product.id}
                className="bg-white/90 backdrop-blur-sm border border-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* الصورة */}
                <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-gray-50 mb-3">
                  <img 
                    src={product.picture} 
                    alt={product.name}
                    className="w-full h-full object-contain p-2 transition-transform hover:scale-110"
                    loading="lazy"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=No+Image"; }}
                  />
                </div>

                {/* تفاصيل المنتج */}
                <div className="px-1 flex flex-col flex-grow">
                  <h2 className="text-[13px] font-bold text-gray-700 mb-2 h-9 overflow-hidden line-clamp-2 leading-tight">
                    {product.name}
                  </h2>

                  <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base font-black text-rose-500">
                        {product.price}
                      </span>
                    </div>

                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-rose-600 shadow-md hover:shadow-rose-200 transition-all"
                    >
                      تسوقي الآن
                    </a>
                  </div>
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
