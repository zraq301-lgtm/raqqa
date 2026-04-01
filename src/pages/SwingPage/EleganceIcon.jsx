import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Sparkles, Leaf, ShoppingCart, RefreshCw, Star } from 'lucide-react';

// --- 1. الأنميشن لظهور الكروت بنعومة ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- 2. التصميم (Styled Components) بلمسة جمالية ناعمة ---
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f7 0%, #f4f1ff 100%);
  padding: 30px 5%;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProductCard = styled.div`
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 20px;
  box-shadow: 0 10px 30px rgba(255, 182, 193, 0.15);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.5s ease-out both;
  animation-delay: ${props => props.index * 0.1}s;

  &:hover {
    transform: translateY(-10px);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 20px 40px rgba(255, 182, 193, 0.25);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 220px;
  border-radius: 20px;
  overflow: hidden;
  background: white;
  margin-bottom: 15px;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: 0.5s;
  }
`;

const CategoryBadge = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ffb7c5;
  color: white;
  padding: 5px 12px;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: bold;
`;

const PriceTag = styled.div`
  color: #ff8fa3;
  font-size: 1.2rem;
  font-weight: 900;
  margin: 10px 0;
`;

const BuyButton = styled.button`
  background: linear-gradient(90deg, #ffb7c5, #ff8fa3);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 15px;
  font-family: 'Cairo';
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
  transition: 0.3s;

  &:hover { opacity: 0.9; transform: scale(1.02); }
`;

// --- 3. المكون الرئيسي ---
const RaqqaBeautyCare = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCareProducts = async () => {
    setLoading(true);
    try {
      // نستخدم فلتر "Natural" لجلب منتجات العناية الطبيعية فقط
      const response = await fetch('https://makeup-api.herokuapp.com/api/v1/products.json?product_tags=Natural');
      const data = await response.json();
      
      // نختار أول 12 منتج لضمان سرعة الصفحة
      setProducts(data.slice(0, 12));
    } catch (error) {
      console.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCareProducts();
  }, []);

  return (
    <PageWrapper>
      <Header>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <Leaf color="#ffb7c5" fill="#ffb7c5" />
          <Sparkles color="#ffb7c5" />
        </div>
        <h1 style={{ color: '#5c4b41', fontWeight: '900', fontSize: '2.2rem' }}>رقة: جمالك الطبيعي</h1>
        <p style={{ color: '#8c7e74' }}>كتالوج العناية بالبشرة والجمال المستوحى من الطبيعة</p>
      </Header>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#ffb7c5', marginTop: '100px' }}>
          <RefreshCw className="animate-spin" size={40} />
          <p>جاري تحضير عالمك الخاص...</p>
        </div>
      ) : (
        <Grid>
          {products.map((product, index) => (
            <ProductCard key={product.id} index={index}>
              <ImageContainer>
                <CategoryBadge>{product.category || 'عناية طبيعية'}</CategoryBadge>
                <img 
                  src={product.api_featured_image} 
                  alt={product.name}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Raqqa+Beauty'; }}
                />
              </ImageContainer>

              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ffb7c5', fontSize: '0.8rem' }}>
                  <Star size={14} fill="#ffb7c5" /> <span style={{color: '#a393a1'}}>{product.brand}</span>
                </div>
                <h3 style={{ fontSize: '1rem', color: '#4a403a', margin: '8px 0', height: '45px', overflow: 'hidden' }}>
                  {product.name}
                </h3>
                <PriceTag>{product.price > 0 ? `${product.price} $` : 'عرض خاص'}</PriceTag>
              </div>

              <BuyButton onClick={() => window.open(product.product_link, '_blank')}>
                <ShoppingCart size={18} /> تسوقي الآن
              </BuyButton>
            </ProductCard>
          ))}
        </Grid>
      )}

      {/* زر تحديث البيانات */}
      {!loading && (
        <button 
          onClick={getCareProducts}
          style={{
            position: 'fixed', bottom: '20px', left: '20px', background: 'white', 
            border: 'none', padding: '15px', borderRadius: '50%', boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            cursor: 'pointer', color: '#ff8fa3'
          }}
        >
          <RefreshCw size={24} />
        </button>
      )}
    </PageWrapper>
  );
};

export default RaqqaBeautyCare;
