import React, { useState, useEffect } from 'react';

const RaqqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ضع رابط الـ XML الخاص بك هنا (الرابط الذي حصلت عليه من Admitad)
  const FEED_URL = "رابط_الـ_XML_الخاص_بك";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}`);
        const data = await response.json();
        
        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, "text/xml");
        const offers = xml.querySelectorAll("offer");

        const parsedProducts = Array.from(offers).slice(0, 30).map((offer, index) => ({
          id: offer.getAttribute("id") || index,
          name: offer.querySelector("name")?.textContent || "منتج رقة المميز",
          price: offer.querySelector("price")?.textContent || "0",
          picture: offer.querySelector("picture")?.textContent || "",
          url: offer.querySelector("url")?.textContent || "#",
          oldPrice: offer.querySelector("oldprice")?.textContent || null,
        }));

        setProducts(parsedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#fdf8f9] pb-10 dir-rtl text-right font-sans">
      
      {/* Header مع زر متجر رقة الأنيق */}
      <div className="sticky top-0 z-50 bg-white/60 backdrop-blur-lg border-b border-rose-100 p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-center">
          <button className="bg-gradient-to-r from-rose-400 to-violet-500 text-white px-10 py-2.5 rounded-full shadow-lg shadow-rose-200 font-bold text-lg hover:scale-105 transition-transform active:scale-95">
            متجر رقة
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-rose-500 font-medium text-sm">نختار لكِ الأفضل من علي إكسبريس...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <div 
                key={product.id}
                className="bg-white/70 backdrop-blur-sm border border-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* صورة المنتج مع تأثير ناعم */}
                <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-white mb-3">
                  <img 
                    src={product.picture} 
                    alt={product.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>

                {/* تفاصيل المنتج */}
                <div className="px-1">
                  <h2 className="text-[13px] font-bold text-gray-700 mb-2 h-9 overflow-hidden line-clamp-2 leading-tight">
                    {product.name}
                  </h2>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base font-black text-rose-500">
                      {product.price} <small className="text-[10px] font-normal">ج.م</small>
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
                    className="block w-full text-center bg-gray-50 border border-rose-100 text-rose-500 py-2 rounded-xl text-xs font-bold hover:bg-rose-500 hover:text-white transition-colors duration-300"
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
