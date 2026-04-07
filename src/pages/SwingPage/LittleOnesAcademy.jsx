import React, { useState, useEffect } from 'react';
import Papa from 'papaparse'; // المكتبة السحرية لحل مشكلتك

const RoqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const rawUrl = "https://export.admitad.com/en/webmaster/websites/2928026/products/export_adv_products/?user=raqqa_zazo500b4&code=myhnewkq0i&template=78213&currency=AED&feed_id=15830&last_import=";
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`;

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(proxyUrl);
        const csvText = await response.text();

        // استخدام PapaParse لمعالجة الملف المعقد
        Papa.parse(csvText, {
          delimiter: ";", // تحديد الفاصلة المنقوطة
          header: true,   // قراءة أول سطر كعناوين للأعمدة
          skipEmptyLines: true,
          complete: (results) => {
            // تحويل البيانات لتناسب واجهة "رقة"
            const formatted = results.data.map(item => ({
              name: item.name,
              image: item.picture,
              price: item.price,
              oldPrice: item.oldprice,
              url: item.url,
              currency: item.currencyId || 'USD'
            })).filter(p => p.image && p.name); // عرض المنتجات التي لها صورة واسم فقط

            setProducts(formatted);
            setLoading(false);
          },
          error: (err) => {
            console.error("خطأ في التحليل:", err);
            setLoading(false);
          }
        });

      } catch (error) {
        console.error("فشل الجلب:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="p-20 text-center text-rose-500 animate-pulse">جاري تنسيق المنتجات الأنيقة...</div>;

  return (
    <div className="bg-[#fff9fb] min-h-screen p-4" style={{ direction: 'rtl' }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((item, index) => (
          <div key={index} className="bg-white rounded-[25px] p-3 shadow-sm border border-rose-50 flex flex-col">
            <div className="h-32 w-full mb-2 bg-gray-50 rounded-2xl overflow-hidden">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Roqa'; }}
              />
            </div>
            
            <h3 className="text-[11px] font-medium text-gray-700 line-clamp-2 h-8 mb-2 leading-tight">
              {item.name}
            </h3>
            
            <div className="mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-rose-600 font-bold text-sm">{item.price} {item.currency}</span>
                {item.oldPrice && (
                  <span className="text-[9px] text-gray-400 line-through">{item.oldPrice}</span>
                )}
              </div>
              
              <a href={item.url} target="_blank" rel="noopener noreferrer" 
                 className="mt-2 block w-full bg-rose-400 text-white text-[10px] py-2 rounded-xl text-center font-bold">
                تسوقي الآن
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoqaStore;
