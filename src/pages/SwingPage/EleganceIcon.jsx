import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Sparkles, Leaf, RefreshCw, Heart, Eye } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fffcfd 0%, #f8f6ff 100%);
  padding: 50px 8%;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 70px;
  animation: ${fadeIn} 1s ease-out;
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
  padding: 0; /* إزالة الحواف الداخلية لتبدو الصورة أكبر */
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.03);
  transition: all 0.5s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;

  &:hover {
    transform: translateY(-15px);
    box-shadow: 0 30px 60px rgba(255, 182, 193, 0.15);
  }
`;

const LargeImageHolder = styled.div`
  width: 100%;
  height: 450px; /* صورة ضخمة وواضحة */
  background: #fdfdfd;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 20px;
    transition: 0.8s;
  }

  ${ShowcaseCard}:hover & img {
    transform: scale(1.05);
  }
`;

const InfoPanel = styled.div`
  padding: 30px;
  background: white;
  text-align: center;
`;

const BrandName = styled.span`
  display: block;
  color: #ffb7c5;
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 10px;
  letter-spacing: 2px;
`;

const Title = styled.h3`
  font-size: 1.4rem;
  color: #3d3430;
  margin-bottom: 15px;
  font-weight: 800;
`;

const FullDescription = styled.p`
  color: #8c7e74;
  font-size: 1rem;
  line-height: 1.8;
  margin: 0;
  text-align: justify;
  /* عرض الوصف كاملاً أو جزء كبير منه */
  display: -webkit-box;
  -webkit-line-clamp: 6; 
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const DecorativeLine = styled.div`
  width: 50px;
  height: 3px;
  background: #ffb7c5;
  margin: 20px auto;
  border-radius: 10px;
`;

const RaqqaShowcase = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch('https://makeup-api.herokuapp.com/api/v1/products.json?product_tags=Natural');
        const data = await res.json();
        setItems(data.slice(0, 8));
      } catch (e) {
        console.log("Error");
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  return (
    <PageWrapper>
      <Header>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
          <Leaf color="#ffb7c5" />
          <Sparkles color="#ffb7c5" />
          <Heart color="#ffb7c5" />
        </div>
        <h1 style={{ fontSize: '3rem', color: '#4a403a', margin: '0' }}>معرض رقة للعناية</h1>
        <p style={{ color: '#a39389', fontSize: '1.2rem', marginTop: '10px' }}>
          دليلك المصور لأفضل منتجات العناية الطبيعية حول العالم
        </p>
      </Header>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <RefreshCw className="animate-spin" size={50} color="#ffb7c5" />
        </div>
      ) : (
        <Grid>
          {items.map((item) => (
            <ShowcaseCard key={item.id}>
              <LargeImageHolder>
                <img 
                  src={item.api_featured_image} 
                  alt={item.name}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/500?text=Beauty+Product'; }}
                />
              </LargeImageHolder>

              <InfoPanel>
                <BrandName>{item.brand || 'طبيعي وآمن'}</BrandName>
                <Title>{item.name}</Title>
                <DecorativeLine />
                <FullDescription>
                  {item.description ? item.description : "منتج مميز للعناية بالبشرة مستخلص من أرقى المكونات الطبيعية، يمنحكِ إشراقة فريدة وحماية مستمرة طوال اليوم."}
                </FullDescription>
                
                <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', color: '#ffb7c5' }}>
                  <Eye size={20} />
                </div>
              </InfoPanel>
            </ShowcaseCard>
          ))}
        </Grid>
      )}

      <footer style={{ textAlign: 'center', marginTop: '80px', color: '#8c7e74' }}>
        <p>© 2026 رقة - جميع الحقوق محفوظة لمحبي الجمال الطبيعي</p>
      </footer>
    </PageWrapper>
  );
};

export default RaqqaShowcase;
