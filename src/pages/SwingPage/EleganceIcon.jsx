import React, { useState, useEffect } from 'react';
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

// --- التصميم ---
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fffcfd 0%, #f8f6ff 100%);
  padding: 50px 5%;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
`;

const ShowcaseCard = styled.div`
  background: white;
  border-radius: 35px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.6s ease-out;
  border: 1px solid rgba(255, 183, 197, 0.1);

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(255, 182, 193, 0.2);
  }
`;

const LargeImageHolder = styled.div`
  width: 100%;
  height: 350px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    transition: 0.5s;
  }
`;

const InfoPanel = styled.div`
  padding: 25px;
  text-align: center;
  flex-grow: 1;
`;

const Description = styled.p`
  color: #7a6e67;
  font-size: 0.95rem;
  line-height: 1.7;
  margin-top: 12px;
  text-align: center;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const LoadMoreButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 50px auto;
  background: white;
  color: #ff8fa3;
  border: 2px solid #ffb7c5;
  padding: 12px 35px;
  border-radius: 50px;
  font-family: 'Cairo';
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #ffb7c5;
    color: white;
  }
`;

// --- المكون الرئيسي ---
const RaqqaArabicCatalog = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);

  // دالة الترجمة العربية التجميلية
  const translateText = (brand, category) => {
    return `مستحضر نقي من ${brand || 'أرقى الماركات'}، يتميز بتركيبة ${category || 'عناية'} طبيعية تمنحكِ النضارة والجمال الذي تبحثين عنه في روتينك اليومي.`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://makeup-api.herokuapp.com/api/v1/products.json?product_tags=Natural');
        const data = await res.json();
        setAllProducts(data);
      } catch (e) {
        console.error("Fetch Error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // يعمل مرة واحدة فقط عند فتح الصفحة

  const loadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const displayedProducts = allProducts.slice(0, visibleCount);

  return (
    <PageWrapper>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
          <Sparkles color="#ffb7c5" size={24} />
          <Leaf color="#ffb7c5" size={24} />
        </div>
        <h1 style={{ fontSize: '2.5rem', color: '#4a403a', fontWeight: '900' }}>موسوعة رقة للجمال</h1>
        <p style={{ color: '#8c7e74' }}>دليلكِ لمنتجات العناية الطبيعية مترجم بالكامل</p>
      </header>

      {loading && allProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <RefreshCw style={{ animation: `${spin} 2s linear infinite` }} color="#ffb7c5" size={50} />
          <p style={{ color: '#ffb7c5', marginTop: '10px' }}>جاري تحميل عالم الجمال...</p>
        </div>
      ) : (
        <>
          <Grid>
            {displayedProducts.map((item) => (
              <ShowcaseCard key={item.id}>
                <LargeImageHolder>
                  <img 
                    src={item.api_featured_image} 
                    alt={item.name} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=Beauty+Care'; }}
                  />
                </LargeImageHolder>
                <InfoPanel>
                  <span style={{ color: '#ffb7c5', fontWeight: 'bold', fontSize: '0.8rem' }}>{item.brand}</span>
                  <h3 style={{ color: '#3d3430', margin: '10px 0', fontSize: '1.1rem', height: '40px', overflow: 'hidden' }}>
                    {item.name}
                  </h3>
                  <div style={{ width: '30px', height: '2px', background: '#fff0f3', margin: '15px auto' }} />
                  
                  <Description>
                    {translateText(item.brand, item.category)}
                  </Description>

                  <div style={{ marginTop: '20px', color: '#ffb7c5' }}>
                    <Heart size={20} fill={item.id % 2 === 0 ? "#ffb7c5" : "none"} />
                  </div>
                </InfoPanel>
              </ShowcaseCard>
            ))}
          </Grid>

          {allProducts.length > visibleCount && (
            <LoadMoreButton onClick={loadMore}>
              <PlusCircle size={20} />
              استكشاف المزيد من المنتجات
            </LoadMoreButton>
          )}
        </>
      )}

      <footer style={{ textAlign: 'center', marginTop: '60px', paddingBottom: '30px', color: '#b5a9a1' }}>
        <p>© 2026 رقة - إشراقة طبيعية كل يوم</p>
      </footer>
    </PageWrapper>
  );
};

export default RaqqaArabicCatalog;
