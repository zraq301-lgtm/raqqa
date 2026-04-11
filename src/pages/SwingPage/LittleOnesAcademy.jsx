import React, { useState, useEffect } from 'react';

const RoqaIntegratedStore = () => {
  const [data, setData] = useState({ description: "", products: [] });
  const [loading, setLoading] = useState(true);

  // الرابط باستخدام الـ ID الجديد للفئة
  const API_URL = "https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=788594722";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        
        let allProducts = [];
        let pageDescription = "";

        if (posts.length > 0) {
          // نأخذ نص المقال الأول ليكون وصفاً للمتجر
          const firstPost = posts[0];
          
          posts.forEach(post => {
            const htmlContent = post.content.rendered;

            // 1. استخراج المنتجات (البحث عن مصفوفة JSON داخل المحتوى)
            const jsonRegex = /\[\s*{[\s\S]*}\s*\]/;
            const match = htmlContent.match(jsonRegex);
            
            if (match) {
              try {
                const cleanJson = match[0].replace(/&quot;/g, '"').replace(/&#8221;/g, '"').replace(/&#8220;/g, '"');
                const parsed = JSON.parse(cleanJson);
                allProducts = [...allProducts, ...(Array.isArray(parsed) ? parsed : [parsed])];
              } catch (e) { console.error("خطأ في JSON"); }
            }

            // 2. استخراج الكلام المكتوب (المقال) مع استبعاد كود الـ JSON منه
            if (!pageDescription) {
              pageDescription = htmlContent
                .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "") // حذف السكريبتات
                .replace(/\[[\s\S]*?\]/g, "") // حذف مصفوفة الـ JSON من النص المعروض
                .replace(/<\/?[^>]+(>|$)/g, " ") // تنظيف الـ HTML ليبقى النص فقط
                .trim();
            }
          });
        }

        setData({ description: pageDescription, products: allProducts });
      } catch (error) {
        console.error("فشل الجلب:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div style={{textAlign:'center', padding:'50px', color:'#d81b60'}}>جاري تحميل عالم رقة... ✨</div>;

  return (
    <div style={{ direction: 'rtl', padding: '15px', background: '#fffcfd', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* عرض مقال وردبريس (الكلام المكتوب) */}
      {data.description && (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.8)', 
          padding: '20px', 
          borderRadius: '20px', 
          marginBottom: '25px',
          borderRight: '5px solid #d81b60',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          color: '#4a148c',
          lineHeight: '1.6'
        }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>مرحباً بكِ في رقة 🌸</h2>
          <p style={{ fontSize: '1rem' }}>{data.description}</p>
        </div>
      )}

      {/* عرض المنتجات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' }}>
        {data.products.map((item, index) => (
          <div key={index} style={{
            background: '#fff', 
            borderRadius: '18px', 
            padding: '12px', 
            border: '1px solid #fce4ec',
            textAlign: 'center',
            boxShadow: '0 5px 15px rgba(216, 27, 96, 0.05)'
          }}>
            <img src={item.image} alt="" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '14px' }} />
            <h3 style={{ fontSize: '0.9rem', color: '#4a148c', margin: '10px 0', height: '38px', overflow: 'hidden' }}>{item.name}</h3>
            <div style={{ color: '#d81b60', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>
              {item.price} <small>{item.currency}</small>
            </div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', background: 'linear-gradient(45deg, #d81b60, #ad1457)', color: '#fff',
              padding: '10px', borderRadius: '12px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold'
            }}>تسوقي الآن</a>
          </div>
        ))}
      </div>

      {!data.description && data.products.length === 0 && (
        <p style={{textAlign:'center', color:'#888'}}>لا يوجد محتوى حالياً في هذه الفئة.</p>
      )}
    </div>
  );
};

export default RoqaIntegratedStore;
