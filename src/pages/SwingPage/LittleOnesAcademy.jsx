import React, { useState, useEffect } from 'react';

const RaqqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // الرابط الخاص بك
  const FEED_URL = "https://export.admitad.com/en/webmaster/websites/2928026/products/export_adv_products/?user=raqqa_zazo500b4&code=myhnewkq0i&format=xml&currency=USD&feed_id=14107&last_import="; 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}`);
        const data = await response.json();
        
        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, "text/xml");
        
        // في رابط Admitad الخاص بك، المنتجات موجودة داخل وسم <item>
        const items = xml.querySelectorAll("item");

        const parsedProducts = Array.from(items).slice(0, 40).map((item, index) => {
          // دالة مساعدة لجلب البيانات مع التعامل مع الـ Namespaces (مثل g:title)
          const getTagValue = (tagName) => {
            // نحاول جلب الوسم العادي أو الوسم الذي يبدأ بـ g:
            return item.querySelector(tagName)?.textContent || 
                   item.getElementsByTagName(`g:${tagName}`)[0]?.textContent || 
                   item.getElementsByTagName(tagName)[0]?.textContent || "";
          };

          return {
            id: getTagValue("id") || index,
            name: getTagValue("title") || "منتج رقة المميز", // Admitad يستخدم title وليس name
            price: getTagValue("price") || "0",
            picture: getTagValue("image_link") || "", // Admitad يستخدم image_link
            url: getTagValue("link") || "#", // Admitad يستخدم link
            oldPrice: getTagValue("sale_price") !== getTagValue("price") ? getTagValue("price") : null,
            currency: "USD" // بما أن الرابط الخاص بك محدد بـ USD
          };
        });

        if (parsedProducts.length > 0) {
          setProducts(parsedProducts);
        } else {
          console.error("لم يتم العثور على منتجات. تأكد من بنية XML");
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
    <div className="min-h-screen bg-[#fdf8f9] pb-10 text-right" dir="rtl">
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
            <p className="mt-4 text-rose-500">جاري تحميل المنتجات من Admitad...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-10 text-gray-500 bg-white rounded-3xl shadow-inner">
            <p>عذراً، لا توجد منتجات متاحة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-[2rem] p-3 shadow-sm flex flex-col justify-between">
                <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-white mb-3">
                  <img src={product.picture} alt={product.name} className="w-full h-full object-contain p-2" />
                </div>
                <div className="px-1">
                  <h2 className="text-[13px] font-bold text-gray-700 mb-2 h-9 overflow-hidden line-clamp-2">
                    {product.name}
                  </h2>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base font-black text-rose-500">{product.price}</span>
                  </div>
                  <a href={product.url} target="_blank" rel="noopener noreferrer" 
                     className="block w-full text-center bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold">
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
