import React, { useState, useEffect } from 'react';

const RoqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // الرابط الذي وفّرته
  const rawUrl = "https://export.admitad.com/en/webmaster/websites/2928026/products/export_adv_products/?user=raqqa_zazo500b4&code=myhnewkq0i&template=78213&currency=AED&feed_id=15830&last_import=";
  
  // البروكسي لتخطي حماية المتصفح (CORS)
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`;

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(proxyUrl);
        const textData = await response.text();
        
        // تقسيم النص إلى أسطر
        const lines = textData.split('\n');
        
        const parsedProducts = lines.slice(1).map(line => {
          // التقسيم باستخدام الفاصلة المنقوطة كما في ملفك
          const cols = line.split(';');
          
          // التأكد من أن السطر يحتوي على بيانات كافية (id, name, url, etc)
          if (cols.length < 8) return null;

          return {
            id: cols[0],
            name: cols[1],
            affiliateUrl: cols[2],
            category: cols[3],
            currency: cols[4],
            image: cols[6], // العمود السابع هو الصورة
            oldPrice: cols[7], // السعر القديم
            price: cols[8] // السعر الحالي
          };
        }).filter(p => p !== null && p.image); // تجاهل الأسطر الفارغة أو التي بلا صور

        setProducts(parsedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error loading CSV:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="p-10 text-center text-rose-400 font-bold">جاري تجهيز أجمل العروض...</div>;

  return (
    <div className="bg-rose-50 min-h-screen p-4" style={{ direction: 'rtl' }}>
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-rose-600">متجر رقة - Aliexpress</h1>
        <p className="text-gray-500 text-sm">عروض مختارة لكِ بعناية</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((item, index) => (
          <div key={index} className="bg-white rounded-3xl p-3 shadow-sm border border-rose-100 flex flex-col">
            {/* عرض الصورة */}
            <div className="relative aspect-square mb-3 bg-gray-100 rounded-2xl overflow-hidden">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Roqa'}
              />
              {item.oldPrice && (
                <span className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] px-2 py-1 rounded-full">
                  خصم مميز
                </span>
              )}
            </div>

            {/* تفاصيل المنتج */}
            <h2 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-2 h-8">
              {item.name}
            </h2>

            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-rose-600 font-bold text-sm">
                {item.price} {item.currency === 'USD' ? '$' : item.currency}
              </span>
              {item.oldPrice && (
                <span className="text-[10px] text-gray-400 line-through">
                  {item.oldPrice}
                </span>
              )}
            </div>

            {/* زر الشراء */}
            <a 
              href={item.affiliateUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-3 block w-full py-2 bg-rose-400 text-white text-center rounded-xl text-xs font-bold hover:bg-rose-500 transition-colors"
            >
              تسوقي الآن
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoqaStore;
