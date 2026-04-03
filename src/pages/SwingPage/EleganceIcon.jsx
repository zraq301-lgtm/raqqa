import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Sparkles, Leaf, RefreshCw, Star, Wand2, ShieldCheck, HeartPulse } from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

// --- الأنيميشن ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// --- التصميم ---
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f7 0%, #f4f1ff 100%);
  padding: 30px 5%;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 50px;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  max-width: 1300px;
  margin: 0 auto;
`;

const ProductCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(15px);
  border-radius: 35px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 25px;
  box-shadow: 0 15px 35px rgba(255, 182, 193, 0.15);
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.6s ease-out both;
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 300px;
  border-radius: 25px;
  overflow: hidden;
  background: white;
  margin-bottom: 20px;
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const AIDescription = styled.div`
  background: ${props => props.type === 'care' ? 'rgba(235, 245, 255, 0.6)' : 'rgba(255, 245, 247, 0.6)'};
  border-radius: 20px;
  padding: 15px;
  margin-top: 15px;
  font-size: 0.95rem;
  color: #5c4b41;
  line-height: 1.6;
  border-right: 4px solid ${props => props.type === 'care' ? '#5dade2' : '#ffb7c5'};
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fff0f3;
  color: #ff8fa3;
  padding: 5px 15px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 10px;
`;

const LoadMoreBtn = styled.button`
  display: block;
  margin: 40px auto;
  padding: 15px 40px;
  background: #4a403a;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const RotatingIcon = styled(RefreshCw)`
  animation: ${props => props.$loading ? spin : 'none'} 2s linear infinite;
`;

// --- المكون الرئيسي ---
const RaqqaBeautyAI = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);

  const getCareData = async (isLoadMore = false) => {
    setLoading(true);
    try {
      // 1. جلب المنتجات الخام من API المكياج
      const res = await fetch(`https://makeup-api.herokuapp.com/api/v1/products.json?product_tags=Natural`);
      const allData = await res.json();
      
      // نأخذ 3 منتجات فقط في كل طلب لضمان سرعة استجابة الذكاء الاصطناعي وعدم حدوث Time-out
      const nextBatch = allData.slice(offset, offset + 3);

      // 2. معالجة كل منتج بشكل منفصل عبر CapacitorHttp
      const enhancedProducts = await Promise.all(nextBatch.map(async (product) => {
        try {
          const aiResponse = await CapacitorHttp.post({
            url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
            headers: { 'Content-Type': 'application/json' },
            data: { 
              prompt: `اكتب شرحاً لمنتج الجمال التالي باللغة العربية. 
              المنتج: ${product.name}. 
              المطلوب: اكتب "الوصف:" ثم شرح مختصر، وبعدها اكتب "نصيحة العناية:" ثم طريقة الاستخدام السليمة.` 
            },
          });

          const fullText = aiResponse.data.result || aiResponse.data.output || "";
          
          // دالة ذكية لتقسيم النص القادم من الذكاء الاصطناعي
          const parts = fullText.split(/نصيحة العناية:|طريقة الاستخدام:/);
          const description = parts[0]?.replace(/الوصف:/g, "").trim();
          const careTip = parts[1]?.trim();

          return { 
            ...product, 
            arabicDesc: description || "تحليل المكونات جارٍ...",
            careTip: careTip || "يفضل استشارة خبير لنتائج مثالية." 
          };
        } catch (e) {
          return { ...product, arabicDesc: "عذراً، فشل الاتصال بالذكاء الاصطناعي.", careTip: "تأكد من اتصالك بالإنترنت." };
        }
      }));

      if (isLoadMore) {
        setProducts(prev => [...prev, ...enhancedProducts]);
      } else {
        setProducts(enhancedProducts);
      }
      setOffset(prev => prev + 3);
    } catch (error) {
      console.error("Main Fetch Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCareData();
  }, []);

  return (
    <PageWrapper>
      <Header>
        <Badge><Sparkles size={16} /> مدعوم بالذكاء الاصطناعي</Badge>
        <h1 style={{ color: '#4a403a', fontWeight: '900', fontSize: '2.5rem' }}>موسوعة رقة الذكية</h1>
        <p style={{ color: '#8c7e74' }}>دليل العناية الشخصية المخصص لكِ</p>
      </Header>

      <Grid>
        {products.map((product) => (
          <ProductCard key={product.id + Math.random()}>
            <ImageContainer>
              <img 
                src={product.api_featured_image} 
                alt={product.name}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=Beauty+Product'; }}
              />
            </ImageContainer>

            <div style={{ flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <ShieldCheck size={18} color="#ffb7c5" />
                <span style={{color: '#a393a1', fontWeight: 'bold'}}>{product.brand || 'طبيعي'}</span>
              </div>
              
              <h3 style={{ fontSize: '1.2rem', color: '#4a403a', marginBottom: '15px', fontWeight: '800' }}>
                {product.name}
              </h3>

              <AIDescription>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', color: '#ff8fa3', fontWeight: 'bold' }}>
                  <Wand2 size={16} /> وصف الذكاء الاصطناعي:
                </div>
                {product.arabicDesc}
              </AIDescription>

              <AIDescription type="care">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', color: '#5dade2', fontWeight: 'bold' }}>
                  <HeartPulse size={16} /> طريقة العناية السليمة:
                </div>
                {product.careTip}
              </AIDescription>
            </div>
          </ProductCard>
        ))}
      </Grid>

      <LoadMoreBtn disabled={loading} onClick={() => getCareData(true)}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RotatingIcon $loading={loading} size={20} /> جاري التحليل...
          </div>
        ) : "إظهار المزيد من نصائح الخبراء"}
      </LoadMoreBtn>

      <button 
        onClick={() => { setOffset(0); getCareData(false); window.scrollTo(0,0); }}
        style={{
          position: 'fixed', bottom: '30px', left: '30px', background: '#ffb7c5', 
          border: 'none', width: '60px', height: '60px', borderRadius: '50%', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', cursor: 'pointer', color: 'white',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}
      >
        <RotatingIcon $loading={loading} size={24} />
      </button>
    </PageWrapper>
  );
};

export default RaqqaBeautyAI;
