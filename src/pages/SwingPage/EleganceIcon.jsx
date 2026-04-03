import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Sparkles, Leaf, ShoppingCart, RefreshCw, Star, Info } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f7 0%, #f4f1ff 100%);
  padding: 30px 5%;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); /* تكبير العرض الأدنى للكارت */
  gap: 30px;
  max-width: 1300px;
  margin: 0 auto;
`;

const ProductCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  transition: 0.3s;
  &:hover { transform: scale(1.02); }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 350px; /* تكبير حجم الصورة */
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 15px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* جعل الصورة تملأ المساحة بشكل أجمل */
  }
`;

const DescriptionText = styled.p`
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
  margin: 10px 0;
  max-height: 80px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const RaqqaBeautyCare = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCareProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://makeup-api.herokuapp.com/api/v1/products.json?product_tags=Natural');
      const data = await response.json();
      setProducts(data.slice(0, 12));
    } catch (error) {
      console.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getCareProducts(); }, []);

  return (
    <PageWrapper>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#4a403a' }}>جمالك الطبيعي بالعربي</h1>
        <p>منتجات مختارة بعناية مع الشرح</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center' }}><RefreshCw className="animate-spin" /></div>
      ) : (
        <Grid>
          {products.map((product) => (
            <ProductCard key={product.id}>
              <ImageContainer>
                <img src={product.api_featured_image} alt={product.name} />
              </ImageContainer>
              
              <h3 style={{ fontSize: '1.1rem', color: '#333' }}>{product.name}</h3>
              
              {/* قسم الوصف: سيظهر بالإنجليزية من الـ API، للترجمة التلقائية يمكن للمستخدم استخدام ترجمة جوجل للمتصفح */}
              <DescriptionText>
                {product.description || "لا يوجد وصف متاح لهذا المنتج حالياً."}
              </DescriptionText>

              <div style={{ marginTop: 'auto' }}>
                <div style={{ fontWeight: 'bold', color: '#ff8fa3', marginBottom: '10px' }}>
                  السعر: {product.price > 0 ? `${product.price} $` : 'اتصلي لمعرفة السعر'}
                </div>
                <button 
                  onClick={() => window.open(product.product_link, '_blank')}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px',
                    backgroundColor: '#ffb7c5', border: 'none', cursor: 'pointer'
                  }}
                >
                  <ShoppingCart size={18} /> شراء الآن
                </button>
              </div>
            </ProductCard>
          ))}
        </Grid>
      )}
    </PageWrapper>
  );
};

export default RaqqaBeautyCare;
