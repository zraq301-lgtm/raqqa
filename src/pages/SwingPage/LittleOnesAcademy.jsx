import React, { useState, useEffect } from 'react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // تأكد أن الملف موجود في مجلد public وبنفس الاسم تماماً
        const response = await fetch('/products.csv'); 
        if (!response.ok) throw new Error('تعذر تحميل ملف products.csv من مجلد public');
        
        const text = await response.text();
        const lines = text.split('\n');
        
        // التحليل بناءً على ترتيب أعمدة ملفك
        const parsed = lines.slice(1).map((line) => {
          const cols = line.split(';');
          if (cols.length < 9) return null; // تخطي السطور غير المكتملة
          
          return {
            id: cols[0],
            name: cols[1],
            url: cols[2],
            currency: cols[4], // USD
            image: cols[6],    // رابط الصورة
            oldPrice: cols[7], // السعر القديم
            price: cols[8]     // السعر الحالي
          };
        }).filter(p => p !== null && p.image); // التأكد من وجود صورة على الأقل

        setProducts(parsed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) return <div className="p-10 text-center">جاري جلب عروض AliExpress...</div>;
  if (error) return <div className="p-10 text-red-500 text-center font-bold">⚠️ خطأ: {error}</div>;

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50" style={{ direction: 'rtl' }}>
      {products.map((p) => (
        <div key={p.id} className="flex flex-col rounded-2xl bg-white border border-pink-100 p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="relative w-full h-32 mb-2">
            <img 
              src={p.image} 
              alt={p.name} 
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
            />
          </div>
          
          <h3 className="text-[11px] font-medium text-gray-700 line-clamp-2 h-8 leading-tight">
            {p.name}
          </h3>
          
          <div className="mt-auto pt-2 flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-pink-600 font-bold text-sm">
                {parseFloat(p.price).toFixed(2)} {p.currency}
              </span>
              {p.oldPrice && (
                <span className="text-[9px] line-through text-gray-400">
                  {p.oldPrice}
                </span>
              )}
            </div>
            
            <a href={p.url} target="_blank" rel="noopener noreferrer" 
               className="mt-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[10px] py-2 rounded-lg text-center font-bold shadow-sm active:scale-95 transition-transform">
              تسوق الآن
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
