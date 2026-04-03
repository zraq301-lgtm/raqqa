import React, { useState, useEffect } from 'react';
import { Sparkles, Leaf, RefreshCw, Heart, PlusCircle } from 'lucide-react';

const RaqqaArabicCatalog = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://makeup-api.herokuapp.com/api/v1/products.json?product_tags=Natural');
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setAllProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const translateText = (brand, category) => {
    return `مستحضر نقي من ${brand || 'أرقى الماركات'}، يتميز بتركيبة ${category || 'عناية'} طبيعية تمنحكِ النضارة والجمال الذي تبحثين عنه في روتينك اليومي.`;
  };

  const loadMore = () => setVisibleCount(prev => prev + 6);

  const displayedProducts = allProducts.slice(0, visibleCount);

  return (
    <div className="raqqa-wrapper">
      {/* CSS المدمج لضمان عدم ظهور صفحة بيضاء */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        
        .raqqa-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #fffcfd 0%, #f8f6ff 100%);
          padding: 50px 5%;
          direction: rtl;
          font-family: 'Cairo', sans-serif;
          color: #4a403a;
        }

        .raqqa-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .product-card {
          background: white;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          transition: all 0.4s ease;
          border: 1px solid rgba(255, 183, 197, 0.1);
          animation: raqqaFadeIn 0.6s ease-out;
        }

        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(255, 182, 193, 0.2);
        }

        .image-container {
          width: 100%;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          padding: 20px;
        }

        .image-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .info-panel {
          padding: 20px;
          text-align: center;
        }

        .brand-tag {
          color: #ffb7c5;
          font-weight: bold;
          font-size: 0.85rem;
          display: block;
          margin-bottom: 5px;
        }

        .product-title {
          font-size: 1.1rem;
          height: 50px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .description-text {
          color: #7a6e67;
          font-size: 0.9rem;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .load-more-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 50px auto;
          background: white;
          color: #ff8fa3;
          border: 2px solid #ffb7c5;
          padding: 12px 40px;
          border-radius: 50px;
          font-family: 'Cairo';
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
        }

        .load-more-btn:hover {
          background: #ffb7c5;
          color: white;
        }

        @keyframes raqqaFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes raqqaSpin {
          to { transform: rotate(360deg); }
        }

        .loading-icon {
          animation: raqqaSpin 1.5s linear infinite;
        }
      `}</style>

      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
          <Sparkles color="#ffb7c5" size={28} />
          <Leaf color="#ffb7c5" size={28} />
        </div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: '900', margin: '0' }}>موسوعة رقة للجمال</h1>
        <p style={{ color: '#8c7e74', fontSize: '1.1rem' }}>دليلكِ الشامل للمنتجات الطبيعية المترجمة</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <RefreshCw className="loading-icon" color="#ffb7c5" size={48} />
          <p style={{ color: '#ffb7c5', marginTop: '20px', fontWeight: 'bold' }}>نجهز لكِ أرقى المنتجات...</p>
        </div>
      ) : (
        <>
          <div className="raqqa-grid">
            {displayedProducts.map((item) => (
              <div key={item.id} className="product-card">
                <div className="image-container">
                  <img 
                    src={item.api_featured_image} 
                    alt={item.name}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=Beauty+Product'; }}
                  />
                </div>
                <div className="info-panel">
                  <span className="brand-tag">{item.brand || 'ماركة عالمية'}</span>
                  <h3 className="product-title">{item.name}</h3>
                  <div style={{ width: '40px', height: '2px', background: '#fff0f3', margin: '15px auto' }} />
                  <p className="description-text">
                    {translateText(item.brand, item.category)}
                  </p>
                  <div style={{ marginTop: '20px' }}>
                    <Heart 
                      size={22} 
                      color="#ffb7c5" 
                      fill={item.id % 2 === 0 ? "#ffb7c5" : "none"} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {allProducts.length > visibleCount && (
            <button className="load-more-btn" onClick={loadMore}>
              <PlusCircle size={20} />
              استكشاف المزيد من المنتجات
            </button>
          )}
        </>
      )}

      <footer style={{ textAlign: 'center', marginTop: '80px', paddingBottom: '40px', color: '#b5a9a1', borderTop: '1px solid #eee', paddingTop: '30px' }}>
        <p>© 2026 رقة - إشراقة طبيعية تليق بكِ</p>
      </footer>
    </div>
  );
};

export default RaqqaArabicCatalog;
