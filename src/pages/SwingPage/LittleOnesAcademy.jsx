import React, { useState, useEffect } from 'react';

const RaqqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // تأكد من وضع الرابط الكامل الذي ينتهي بـ .xml أو الرابط الذي حصلت عليه
  const FEED_URL = "ضع_رابط_admitad_هنا"; 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // استخدام بروكسي AllOrigins لجلب البيانات وتخطي حظر الـ CORS
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}`);
        const data = await response.json();
        
        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, "text/xml");
        
        // محاولة إيجاد وسوم offer بأكثر من طريقة لضمان الوصول للبيانات
        let offers = xml.querySelectorAll("offer");
        
        if (offers.length === 0) {
           // تجربة مسار آخر إذا كان الهيكل مختلف
           offers = xml.getElementsByTagName("offer");
        }

        const parsedProducts = Array.from(offers).slice(0, 40).map((offer, index) => {
          // دالة مساعدة لجلب النص من الوسوم بأمان
          const getTagData = (tagName) => offer.querySelector(tagName)?.textContent || 
                                         offer.getElementsByTagName(tagName)[0]?.textContent || "";

          return {
            id: offer.getAttribute("id") || index,
            name: getTagData("name") || getTagData("model") || "منتج رقة المميز",
            price: getTagData("price") || "0",
            picture: getTagData("picture") || "",
            url: getTagData("url") || "#",
            oldPrice: getTagData("oldprice") || null,
            currency: getTagData("currencyId") || "ج.م"
          };
        });

        if (parsedProducts.length > 0) {
            setProducts(parsedProducts);
        } else {
            console.error("لم يتم العثور على أي منتجات داخل ملف الـ XML");
        }
        setLoading(false);
      } catch (error) {
        console.error("حدث خطأ أثناء جلب المنتجات:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#fdf8f9] pb-10 dir-rtl text-right font-sans">
      
      {/* Header ثابت مع زر المتجر */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-center">
          <button className="bg-gradient-to-r from-rose-400 to-violet-500 text-white px-12 py-2.5 rounded-full shadow-lg font-bold text-lg">
            متجر رقة
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-rose-500">نختار لكِ الأفضل من علي إكسبريس...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-10 text-gray-500 bg-white rounded-3xl shadow-inner">
            <p>عذراً، لا توجد منتجات متاحة حالياً في الرابط.</p>
            <p className="text-xs mt-2 text-gray-400">تأكد من صحة الرابط في كود المشروع.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <div 
                key={product.id}
                className="bg-white/80 backdrop-blur-sm border border-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-white mb-3">
                  <img 
                    src={product.picture} 
                    alt={product.name}
                    className="w-full h-full object-contain p-2 transition-transform hover:scale-110"
                    loading="lazy"
                  />
                </div>

                <div className="px-1">
                  <h2 className="text-[13px] font-bold text-gray-700 mb-2 h-9 overflow-hidden line-clamp-2 leading-tight">
                    {product.name}
                  </h2>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base font-black text-rose-500">
                      {product.price} <small className="text-[10px] font-normal">{product.currency}</small>
                    </span>
                    {product.oldPrice && (
                      <span className="text-[10px] text-gray-400 line-through">
                        {product.oldPrice}
                      </span>
                    )}
                  </div>

                  <a 
                    href={product.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-rose-600 transition-all"
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
