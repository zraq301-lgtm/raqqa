import React, { useState, useEffect } from 'react';

const RoqaCleanStore = () => {
  const [data, setData] = useState({ description: "", products: [] });
  const [loading, setLoading] = useState(true);

  const API_URL = "https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=788594722";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        
        let allProducts = [];
        let finalDescription = "";

        if (posts.length > 0) {
          // نركز على أول مقال فيه البيانات
          const content = posts[0].content.rendered;

          // 1. استخراج المنتجات: البحث عن المصفوفة التي تبدأ بـ [ وتنتهي بـ ]
          const jsonRegex = /\[\s*{[\s\S]*}\s*\]/;
          const jsonMatch = content.match(jsonRegex);
          if (jsonMatch) {
            try {
              const cleanJson = jsonMatch[0]
                .replace(/&quot;/g, '"')
                .replace(/&#8221;/g, '"')
                .replace(/&#8220;/g, '"');
              allProducts = JSON.parse(cleanJson);
            } catch (e) { console.error("JSON Parse Error"); }
          }

          // 2. تنظيف الوصف: حذف الـ CSS والسكريبتات وأكواد الـ JSON من النص المعروض
          finalDescription = content
            .replace(/<style([\s\S]*?)<\/style>/gi, "") // حذف أي CSS
            .replace(/<script([\s\S]*?)<\/script>/gi, "") // حذف أي سكريبت
            .replace(/\[[\s\S]*?\]/g, "") // حذف مصفوفة الـ JSON
            .replace(/<\/?[^>]+(>|$)/g, "") // حذف وسوم HTML
            .replace(/[a-z0-9\-_.]+\s*{[\s\S]*?}/gi, "") // حذف أي كود CSS تائه مثل .products-grid { ... }
            .replace(/&nbsp;/g, ' ')
            .trim();
        }

        setData({ 
          description: finalDescription || "مرحباً بكِ في متجر رقة المتميز", 
          products: Array.isArray(allProducts) ? allProducts : [] 
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{textAlign:'center', padding:'50px', color:'#d81b60'}}>جاري تنقية البيانات... ✨</div>;

  return (
    <div style={{ direction: 'rtl', padding: '15px', background: '#fffcfd', minHeight: '100vh' }}>
      
      {/* وصف المقال النظيف */}
      <div style={{ 
        background: '#fff', padding: '20px', borderRadius: '20px', marginBottom: '25px',
        borderRight: '5px solid #d81b60', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ fontSize: '1.2rem', color: '#d81b60', marginBottom: '10px' }}>🌸 مرحباً بكِ في رقة</h2>
        <p style={{ color: '#4a148c', lineHeight: '1.6', fontSize: '0.95rem' }}>
          {data.description.split(';').pop()} {/* تنظيف بقايا الرموز البرمجية */}
        </p>
      </div>

      {/* شبكة المنتجات الاحترافية */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '15px' }}>
        {data.products.map((item, index) => (
          <div key={index} style={{
            background: 'white', borderRadius: '18px', padding: '12px', textAlign: 'center',
            boxShadow: '0 5px 15px rgba(0,0,0,0.04)', border: '1px solid #fce4ec'
          }}>
            <img src={item.image} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px' }} />
            <h3 style={{ fontSize: '0.85rem', color: '#4a148c', margin: '10px 0', height: '35px', overflow: 'hidden' }}>{item.name}</h3>
            <div style={{ color: '#d81b60', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>
              {item.price} <small>{item.currency}</small>
            </div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', background: 'linear-gradient(45deg, #d81b60, #ad1457)', color: '#fff',
              padding: '10px', borderRadius: '10px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold'
            }}>تسوقي الآن</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoqaCleanStore;
