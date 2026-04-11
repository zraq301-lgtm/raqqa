import React, { useState, useEffect } from 'react';

const RoqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // رابط الـ API الخاص بمدونتك وفئة المتجر
  const WP_API_URL = "https://public-api.wordpress.com/wp/v2/sites/raqqastor3.wordpress.com/posts?categories=5460884";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(WP_API_URL);
        const posts = await response.json();
        
        let extractedProducts = [];

        posts.forEach(post => {
          const content = post.content.rendered;
          
          // البحث عن البيانات بين وسم <script id="products-data"> ووسم الإغلاق </script>
          // هذه الطريقة تضمن جلب البيانات حتى لو كان هناك كود HTML آخر
          const regex = /<script id="products-data" type="application\/json">([\s\S]*?)<\/script>/;
          const match = content.match(regex);

          if (match && match[1]) {
            try {
              const jsonData = JSON.parse(match[1].trim());
              extractedProducts = [...extractedProducts, ...(Array.isArray(jsonData) ? jsonData : [jsonData])];
            } catch (e) {
              console.error("خطأ في تحليل JSON داخل المقال:", post.id);
            }
          }
        });

        setProducts(extractedProducts);
        setLoading(false);
      } catch (error) {
        console.error("فشل جلب البيانات من ووردبريس:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div style={{textAlign:'center', padding:'50px', color:'#d81b60'}}>جاري جلب منتجات رقة...</div>;

  return (
    <div className="roqa-app-container">
      <style>{`
        .roqa-app-container { padding: 15px; direction: rtl; background: #fffcfd; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 15px; }
        .card { 
          background: rgba(255, 255, 255, 0.7); 
          backdrop-filter: blur(10px); 
          border: 1px solid #fce4ec; 
          border-radius: 18px; 
          padding: 12px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          display: flex; flex-direction: column;
        }
        .img { width: 100%; height: 160px; object-fit: cover; border-radius: 14px; }
        .name { font-size: 0.95rem; color: #4a148c; margin: 10px 0; height: 38px; overflow: hidden; line-height: 1.3; }
        .price { color: #d81b60; font-weight: bold; font-size: 1.1rem; margin-bottom: 10px; }
        .btn { 
          background: #d81b60; color: #fff; text-align: center; 
          padding: 8px; border-radius: 10px; text-decoration: none; font-size: 0.85rem;
        }
      `}</style>

      <div className="grid">
        {products.length > 0 ? products.map((item, index) => (
          <div key={index} className="card">
            <img src={item.image} alt={item.name} className="img" />
            <div className="name">{item.name}</div>
            <div className="price">{item.price} {item.currency}</div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn">تسوق الآن</a>
          </div>
        )) : <p style={{textAlign:'center', width:'100%'}}>لا توجد منتجات معروضة حالياً.</p>}
      </div>
    </div>
  );
};

export default RoqaStore;
