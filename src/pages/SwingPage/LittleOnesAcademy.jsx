import React, { useState, useEffect } from 'react';

const RoqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // أضفنا "_fields" لتقليل حجم البيانات وجلب ما نحتاجه فقط، و "timestamp" لتجاوز الكاش
  const API_URL = `https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=5460884&_fields=content&t=${new Date().getTime()}`;

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        
        let allProducts = [];

        posts.forEach(post => {
          // 1. استخراج النص من داخل التنسيقات
          const htmlContent = post.content.rendered;
          
          // 2. محاولة استخراج JSON سواء كان داخل <script> أو نص مجرد
          const regex = /<script id="products-data"[^>]*>([\s\S]*?)<\/script>/;
          const match = htmlContent.match(regex);
          
          let targetText = match ? match[1] : htmlContent.replace(/<\/?[^>]+(>|$)/g, "");

          try {
            // تنظيف الرموز الشائعة في وردبريس
            const cleanJson = targetText
              .replace(/&quot;/g, '"')
              .replace(/&#8221;/g, '"')
              .replace(/&#8220;/g, '"')
              .replace(/&nbsp;/g, '')
              .trim();

            const parsed = JSON.parse(cleanJson);
            allProducts = [...allProducts, ...(Array.isArray(parsed) ? parsed : [parsed])];
          } catch (e) {
            console.warn("فشل في معالجة JSON لمقال معين");
          }
        });

        setProducts(allProducts);
      } catch (err) {
        console.error("خطأ في الاتصال بالـ API العام:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div style={{textAlign:'center', padding:'40px', color:'#d81b60', fontWeight:'bold'}}>جاري الاتصال بمتجر رقة...</div>;

  return (
    <div style={{ direction: 'rtl', padding: '10px', background: '#fff9fa' }}>
      {products.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {products.map((item, index) => (
            <div key={index} style={{
              background: '#fff', border: '1px solid #fce4ec', borderRadius: '12px',
              padding: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', textAlign: 'center'
            }}>
              <img src={item.image} alt="" style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '8px' }} />
              <h3 style={{ fontSize: '0.85rem', color: '#4a148c', margin: '8px 0', height: '32px', overflow: 'hidden' }}>{item.name}</h3>
              <p style={{ color: '#d81b60', fontWeight: 'bold', margin: '5px 0' }}>{item.price} {item.currency}</p>
              <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'block', background: '#d81b60', color: '#fff', textDecoration: 'none',
                padding: '6px', borderRadius: '6px', fontSize: '0.75rem'
              }}>عرض المنتج</a>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>المتجر فارغ حالياً.</p>
            <p style={{fontSize: '0.8rem', color: '#888'}}>تأكد من اختيار تصنيف (متجر رقة) للمقالات المنشورة.</p>
        </div>
      )}
    </div>
  );
};

export default RoqaStore;
