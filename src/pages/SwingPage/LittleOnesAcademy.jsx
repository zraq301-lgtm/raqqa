import React, { useState, useEffect } from 'react';

const RoqaFinalCheck = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(""); // لتشخيص المشكلة

  // الرابط للفئة الجديدة
  const API_URL = "https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=788594722";

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(posts => {
        if (posts.length === 0) {
          setDebugInfo("لا توجد مقالات منشورة في هذه الفئة (788594722)");
          setLoading(false);
          return;
        }

        let allItems = [];
        const post = posts[0];

        // محاولة الاستخراج من المقتطف أولاً ثم من المحتوى
        const sourceText = (post.excerpt.rendered + post.content.rendered)
          .replace(/<\/?[^>]+(>|$)/g, "")
          .replace(/&quot;/g, '"')
          .replace(/&#8221;/g, '"')
          .replace(/&#8220;/g, '"');

        try {
          const match = sourceText.match(/\[\s*{[\s\S]*}\s*\]/);
          if (match) {
            allItems = JSON.parse(match[0]);
          } else {
            setDebugInfo("وجدنا المقال، لكن لم نجد كود [ ] بداخله");
          }
        } catch (e) {
          setDebugInfo("الكود الموجود داخل وردبريس به خطأ في الأقواس أو الفواصل");
        }

        setProducts(allItems);
        setLoading(false);
      })
      .catch(err => {
        setDebugInfo("فشل الاتصال بوردبريس تماماً");
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>جاري الفحص النهائي...</div>;

  return (
    <div style={{ direction: 'rtl', padding: '15px' }}>
      {products.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
          {products.map((item, index) => (
            <div key={index} style={{ background: '#fff', borderRadius: '15px', padding: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <img src={item.image} alt="" style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '10px' }} />
              <h4 style={{ fontSize: '0.8rem', margin: '10px 0' }}>{item.name}</h4>
              <p style={{ color: '#d81b60', fontWeight: 'bold' }}>{item.price} {item.currency}</p>
              <a href={item.url} style={{ display: 'block', background: '#d81b60', color: '#fff', padding: '5px', borderRadius: '5px', textDecoration: 'none' }}>شراء</a>
            </div>
          ))}
        </div>
      ) : (
        <div style={{textAlign:'center', color:'red', padding:'20px'}}>
          <h3>⚠️ تنبيه التشخيص:</h3>
          <p>{debugInfo}</p>
        </div>
      )}
    </div>
  );
};

export default RoqaFinalCheck;
