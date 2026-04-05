import React, { useState, useEffect } from 'react';

const RaqqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const FEED_URL = "https://export.admitad.com/en/webmaster/websites/2928026/products/export_adv_products/?user=raqqa_zazo500b4&code=myhnewkq0i&format=xml&currency=USD&feed_id=14107&last_import=";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // استخدام allorigins لجلب البيانات
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL.trim())}`);
        const data = await response.json();
        
        const parser = new DOMParser();
        // تحويل النص إلى XML Document
        const xml = parser.parseFromString(data.contents, "text/xml");
        
        // جلب جميع عناصر item (المنتجات)
        const items = xml.getElementsByTagName("item");
        
        if (items.length === 0) {
          console.error("لم يتم العثور على وسوم <item> في ملف XML");
          setLoading(false);
          return;
        }

        const parsedProducts = Array.from(items).slice(0, 40).map((item) => {
          // دالة ذكية لجلب محتوى الوسوم سواء كانت بـ g: أو بدون
          const getVal = (tagName) => {
            const gTag = item.getElementsByTagName(`g:${tagName}`)[0];
            const normalTag = item.getElementsByTagName(tagName)[0];
            return (gTag ? gTag.textContent : (normalTag ? normalTag.textContent : "")).trim();
          };

          return {
            id: getVal("id"),
            name: getVal("title"),
            price: getVal("price"),
            picture: getVal("image_link"),
            url: getVal("link"),
            currency: "USD"
          };
        });

        // تصفية المنتجات التي ليس لها صورة أو اسم (لضمان جودة العرض)
        const filteredProducts = parsedProducts.filter(p => p.name && p.picture);

        setProducts(filteredProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#fdf8f9] pb-10 text-right font-sans" dir="rtl">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="bg-gradient-to-r from-rose-400 to-violet-500 text-white px-12 py-2.5 rounded-full shadow-lg font-bold text-lg">
            متجر رقة
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-rose-500">جاري تحميل أحدث العروض...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-10 text-gray-500 bg-white rounded-3xl shadow-md">
            <p className="text-xl font-bold">عذراً، لم نتمكن من عرض المنتجات حالياً.</p>
            <p className="text-sm mt-2">يرجى التأكد من أن الرابط يعمل أو حاول مرة أخرى لاحقاً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, idx) => (
              <div key={product.id || idx} className="bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-gray-50 mb-3">
                  <img 
                    src={product.picture} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-2"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/150'} 
                  />
                </div>
                <div className="flex flex-col flex-grow px-1">
                  <h2 className="text-[13px] font-bold text-gray-700 mb-2 h-9 overflow-hidden line-clamp-2 leading-tight">
                    {product.name}
                  </h2>
                  <div className="mt-auto">
                    <div className="mb-3">
                      <span className="text-base font-black text-rose-500">{product.price}</span>
                    </div>
                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block w-full text-center bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors"
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
