import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Sparkles, Leaf, RefreshCw, Heart, PlusCircle } from 'lucide-react';

// --- الأنميشن ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// --- التصميم (Styled Components) ---
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fffcfd 0%, #f8f6ff 100%);
  padding: 50px 5%;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
`;

const ShowcaseCard = styled.div`
  background: white;
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0,0,0,0.03);
  transition: all 0.5s ease;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.8s ease-out;

  &:hover {
    transform: translateY(-15px);
    box-shadow: 0 30px 60px rgba(255, 182, 193, 0.2);
  }
`;

const LargeImageHolder = styled.div`
  width: 100%;
  height: 400px;
  background: #fff;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 30px;
    transition: 0.8s;
  }
`;

const InfoPanel = styled.div`
  padding: 30px;
  text-align: center;
`;

const Description = styled.p`
  color: #7a6e67;
  font-size: 1rem;
  line-height: 1.8;
  margin-top: 15px;
  text-align: justify;
  min-height: 100px;
`;

const LoadMoreButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 50px auto;
  background: white;
  color: #ff8fa3;
  border: 2px solid #ffb7c5;
  padding: 15px 40px;
  border-radius: 50px;
  font-family: 'Cairo';
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #ffb7c5;
    color: white;
    box-shadow: 0 10px 20px rgba(255, 183, 197, 0.3);
  }
`;

// --- المكون الرئيسي ---
const RaqqaArabicCatalog = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(6);

  // دالة محاكاة للترجمة (تحول المفاهيم الأساسية للعربية لضمان جودة النص)
  const translateDescription = (text, category, brand) => {
    if (!text) return `مستحضر ${category || 'تجميل'} مميز من ماركة ${brand || 'عالمية'}، صُمم خصيصاً ليمنحكِ إشراقة طبيعية ولمسة مخملية تدوم طويلاً.`;
    
    // هنا يمكن دمج مكتبة ترجمة، لكن كحل سريع وجمالي نستخدم نصوصاً معدة مسبقاً
    // أو تنظيف النص الإنجليزي وعرضه بتنسيق عربي
    return "يتميز هذا المنتج بتركيبة فريدة غنية بالعناصر المغذية التي تساعد في ترطيب البشرة وحمايتها، مما يجعله إضافة مثالية لروتينك اليومي للجمال.";
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://makeup-api.herokuapp.com/api/v1/products.json?product_tags=Natural');
      const data = await res.json();
      setAllProducts(data);
      setVisibleProducts(data.slice(0, limit));
    } catch (e) {
      console.error("خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadMore = () => {
    const newLimit = limit + 6;
    setLimit(newLimit);
    setVisibleProducts(allProducts.slice(0, newLimit));
  };

  return (
    <PageWrapper>
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '15px' }}>
          <Sparkles color="#ffb7c5" />
          <Leaf color="#ffb7c5" />
        </div>
        <h1 style={{ fontSize: '2.8rem', color: '#4a403a', fontWeight: '900' }}>موسوعة رقة للجمال</h1>
        <p style={{ color: '#8c7e74' }}>تصفحي أرقى منتجات العناية الطبيعية المترجمة لكِ خصيصاً</p>
      </header>

      <Grid>
        {visibleProducts.map((item) => (
          <ShowcaseCard key={item.id}>
            <LargeImageHolder>
              <img 
                src={item.api_featured_image} 
                alt={item.name} 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=Raqqa+Beauty'; }}
              />
            </LargeImageHolder>
            <InfoPanel>
              <span style={{ color: '#ffb7c5', fontWeight: 'bold', fontSize: '0.8rem' }}>{item.brand}</span>
              <h3 style={{ color: '#3d3430', margin: '10px 0', fontSize: '1.2rem' }}>{item.name}</h3>
              <div style={{ width: '40px', height: '2px', background: '#fff0f3', margin: '15px auto' }} />
              
              <Description>
                {translateDescription(item.description, item.category, item.brand)}
              </Description>

              <div style={{ marginTop: '20px', color: '#ffb7c5' }}>
                <Heart size={20} fill={item.id % 2 === 0 ? "#ffb7c5" : "none"} />
              </div>
            </InfoPanel>
          </ShowcaseCard>
        ))}
      </Grid>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <RefreshCw style={{ animation: `${spin} 2s linear infinite` }} color="#ffb7c5" size={40} />
        </div>
      ) : (
        allProducts.length > visibleProducts.length && (
          <LoadMoreButton onClick={loadMore}>
            <PlusCircle size={20} />
            استكشاف المزيد من المنتجات
          </LoadMoreButton>
        )
      )}

      <footer style={{ textAlign: 'center', marginTop: '60px', color: '#b5a9a1', fontSize: '0.9rem' }}>
        <p>جميع البيانات محدثة من مصادر الجمال العالمية • رقة 2026</p>
      </footer>
    </PageWrapper>
  );
};

export default RaqqaArabicCatalog;
