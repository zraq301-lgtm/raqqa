import React, { useState, useEffect } from 'react';

const RoqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // استخدام الرابط الذي أكدت أنت أنه يعمل ويظهر البيانات
  const API_URL = "https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=5460884";

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        
        let allItems = [];

        posts.forEach(post => {
          // جلب النص الخام من محتوى المقال
          const rawHTML = post.content.rendered;
          
          // تنظيف شامل للنص من وسوم ووردبريس ورموز HTML
          const cleanText = rawHTML
            .replace(/<\/?[^>]+(>|$)/g, "") // إزالة <p> و <div> و <script>
            .replace(/&quot;/g, '"')         // تحويل رموز الكوتيشن
            .replace(/&#8221;/g, '"')
            .replace(/&#8220;/g, '"')
            .replace(/&nbsp;/g, '')         // إزالة المسافات الفارغة البرمجية
            .trim();

          try {
            // البحث عن أول [ وآخر ] لاستخراج مصفوفة الـ JSON فقط
            const start = cleanText.indexOf('[');
            const end = cleanText.lastIndexOf(']');
            
            if (start !== -1 && end !== -1) {
              const jsonStr = cleanText.substring(start, end + 1);
              const parsed = JSON.parse(jsonStr);
              
              // التأكد من أن البيانات مصفوفة وإضافتها
              if (Array.isArray(parsed)) {
                allItems = [...allItems, ...parsed];
              } else {
                allItems.push(parsed);
              }
            }
          } catch (e) {
            console.warn("فشل فك تشفير JSON في أحد المقالات");
          }
        });

        setProducts(allItems);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#d81b60', fontWeight: 'bold' }}>
      جاري جلب منتجات رقة... ✨
    </div>
  );

  return (
    <div style={{ direction: 'rtl', padding: '10px', background: '#fffcfd' }}>
      {products.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', 
          gap: '12px' 
        }}>
          {products.map((item, index) => (
            <div key={index} style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '10px',
              boxShadow: '0 4px 12px rgba(216, 27, 96, 0.08)',
              border: '1px solid #fce4ec',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <img 
                src={item.image || 'https://via.placeholder.com/150'} 
                alt={item.name} 
                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px' }} 
              />
              <h3 style={{ fontSize: '0.85rem', color: '#4a148c', margin: '10px 0', height: '34px', overflow: 'hidden', lineHeight: '1.2' }}>
                {item.name}
              </h3>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#d81b60', marginBottom: '8px' }}>
                {item.price} <span style={{ fontSize: '0.7rem' }}>{item.currency}</span>
              </div>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  background: 'linear-gradient(45deg, #d81b60, #ad1457)',
                  color: '#fff',
                  textDecoration: 'none',
                  textAlign: 'center',
                  padding: '8px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                تسوقي الآن
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          لا توجد منتجات حالياً في هذا القسم.
        </div>
      )}
    </div>
  );
};

export default RoqaStore;
