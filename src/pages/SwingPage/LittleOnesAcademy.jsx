import React, { useState, useEffect } from 'react';

const RoqaStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // رابط الـ API لوردبريس مع الفلترة حسب الـ Category ID الخاص بك
  const WP_API_URL = "https://raqqastor3.wordpress.com/wp-json/wp/v2/posts?categories=5460884&per_page=10";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(WP_API_URL);
        const data = await response.json();
        
        // فك تشفير الـ JSON الموجود داخل محتوى المقال (post.content.rendered)
        let allProducts = [];
        data.forEach(post => {
          // إزالة وسوم HTML من المحتوى لاستخراج النص فقط
          const cleanJson = post.content.rendered.replace(/<\/?[^>]+(>|$)/g, "");
          try {
            const parsed = JSON.parse(cleanJson);
            allProducts = [...allProducts, ...(Array.isArray(parsed) ? parsed : [parsed])];
          } catch (e) {
            console.error("خطأ في فك تشفير JSON من المقال:", post.id);
          }
        });
        
        setProducts(allProducts);
        setLoading(false);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="loader">جاري تحميل متجر رقة...</div>;

  return (
    <div className="store-container">
      <style>{`
        .store-container {
          padding: 20px;
          background: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%);
          min-height: 100vh;
          direction: rtl;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* تأثير Glassmorphism */
        .product-card {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 15px;
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }

        .product-card:hover {
          transform: translateY(-10px);
        }

        .product-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 15px;
          margin-bottom: 15px;
        }

        .product-info {
          flex-grow: 1;
        }

        .product-name {
          font-size: 1.1rem;
          color: #4a148c;
          margin: 10px 0;
          font-weight: 600;
        }

        .product-price {
          font-size: 1.2rem;
          color: #d81b60;
          font-weight: bold;
          margin-bottom: 15px;
        }

        .buy-button {
          background: #d81b60;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 12px;
          text-decoration: none;
          text-align: center;
          font-weight: 600;
          transition: background 0.3s;
        }

        .buy-button:hover {
          background: #ad1457;
        }

        .loader {
          text-align: center;
          padding: 50px;
          color: #d81b60;
          font-size: 1.5rem;
        }
      `}</style>

      <h1 style={{ textAlign: 'center', color: '#4a148c', marginBottom: '40px' }}>رقة - استعرضي الجمال</h1>
      
      <div className="products-grid">
        {products.map((item, index) => (
          <div key={index} className="product-card">
            <img src={item.image || 'https://via.placeholder.com/300'} alt={item.name} className="product-image" />
            <div className="product-info">
              <h3 className="product-name">{item.name}</h3>
              <div className="product-price">{item.price} {item.currency}</div>
            </div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="buy-button">
              تسوق الآن
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoqaStore;
