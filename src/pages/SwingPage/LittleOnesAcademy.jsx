import React, { useState, useEffect } from 'react';

const RoqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // الرابط العام الذي يسحب كل المقالات (بما فيها المقال الذي اشتغل معك)
  const API_URL = "https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts";

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(posts => {
        let allItems = [];
        posts.forEach(post => {
          // استخراج النص فقط من محتوى المقال (بدون وسوم HTML)
          const rawContent = post.content.rendered.replace(/<\/?[^>]+(>|$)/g, "");
          
          try {
            // تنظيف النص لضمان أنه JSON نقي
            const cleanJson = rawContent
              .replace(/&quot;/g, '"')
              .replace(/&#8221;/g, '"')
              .replace(/&#8220;/g, '"')
              .trim();

            // البحث عن المصفوفة [ ] داخل النص
            const start = cleanJson.indexOf('[');
            const end = cleanJson.lastIndexOf(']');
            
            if (start !== -1 && end !== -1) {
              const jsonString = cleanJson.substring(start, end + 1);
              const parsed = JSON.parse(jsonString);
              allItems = [...allItems, ...(Array.isArray(parsed) ? parsed : [parsed])];
            }
          } catch (e) {
            console.log("هذا المقال لا يحتوي على JSON متوافق");
          }
        });
        setProducts(allItems);
        setLoading(false);
      })
      .catch(err => {
        console.error("خطأ في الاتصال:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>جاري مزامنة المنتجات...</div>;

  return (
    <div style={{ padding: '15px', direction: 'rtl' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
        {products.map((item, index) => (
          <div key={index} style={{
            background: '#fff', borderRadius: '15px', padding: '10px', 
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid #eee'
          }}>
            <img src={item.image} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px' }} />
            <h3 style={{ fontSize: '0.85rem', margin: '10px 0', height: '35px', overflow: 'hidden' }}>{item.name}</h3>
            <div style={{ color: '#d81b60', fontWeight: 'bold', marginBottom: '10px' }}>{item.price} {item.currency}</div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', background: '#d81b60', color: '#fff', padding: '8px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8rem'
            }}>تسوق الآن</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoqaStore;
