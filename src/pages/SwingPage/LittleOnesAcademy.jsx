import React, { useState, useEffect } from 'react';

const RoqaAliexpressStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // الرابط الخاص بك
  const rawUrl = "https://export.admitad.com/en/webmaster/websites/2928026/products/export_adv_products/?user=raqqa_zazo500b4&code=myhnewkq0i&template=78213&currency=AED&feed_id=15830&last_import=";
  
  // البروكسي لتخطي الـ CORS
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(proxyUrl);
        const data = await response.text();
        
        const lines = data.split('\n');
        // السطر الأول يحتوي على العناوين: id;name;url;category;currencyId;param;picture;oldprice;price
        
        const result = lines.slice(1).map(line => {
          // استخدام RegExp لتقسيم السطر مع مراعاة النصوص التي تحتوي على ";" داخل علامات الاقتباس
          const pattern = /([^;"]+|"[^"]*")+/g;
          const cols = line.match(pattern) || [];

          if (cols.length < 9) return null;

          // تنظيف القيم من علامات الاقتباس الزائدة
          const clean = (val) => val ? val.replace(/^"|"$/g, '').trim() : '';

          return {
            id: clean(cols[0]),
            name: clean(cols[1]),
            url: clean(cols[2]),
            currency: clean(cols[4]),
            image: clean(cols[6]), // الصورة في العمود السابع
            oldPrice: clean(cols[7]),
            price: clean(cols[8])
          };
        }).filter(item => item && item.image && item.image.startsWith('http'));

        setProducts(result);
        setLoading(false);
      } catch (error) {
        console.error("Fetch Error:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-bounce text-rose-500 font-bold">جاري تحميل عروض رقة...</div>
    </div>
  );

  return (
    <div className="p-4 bg-rose-50/30 min-h-screen" style={{ direction: 'rtl' }}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-3 shadow-sm border border-rose-100 flex flex-col">
            <div className="h-32 w-full rounded-2xl overflow-hidden bg-gray-50 mb-2">
              <img 
                src={p.image} 
                className="w-full h-full object-contain" 
                alt=""
                onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Roqa'}
              />
            </div>
            
            <h3 className="text-[10px] text-gray-700 font-bold line-clamp-2 h-8 leading-tight mb-2">
              {p.name}
            </h3>
            
            <div className="mt-auto flex justify-between items-end">
              <div className="flex flex-col">
                {p.oldPrice && (
                  <span className="text-[8px] text-gray-400 line-through leading-none">
                    {p.oldPrice}
                  </span>
                )}
                <span className="text-rose-600 font-black text-xs leading-none">
                  {p.price} <small className="text-[8px]">{p.currency}</small>
                </span>
              </div>
              
              <a 
                href={p.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-rose-500 text-white text-[9px] px-3 py-2 rounded-xl font-bold shadow-sm shadow-rose-200"
              >
                شراء
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoqaAliexpressStore;
