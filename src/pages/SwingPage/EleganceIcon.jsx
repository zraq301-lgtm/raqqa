import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Sparkles, Leaf, RefreshCw, Star, Wand2, ShieldCheck, HeartPulse } from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core'; // استيراد المحرك الجديد

// --- الأنيميشن ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- التصميم المطور ---
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
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px);
  border-radius: 35px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 25px;
  box-shadow: 0 15px 35px rgba(255, 182, 193, 0.1);
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.6s ease-out both;
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 320px;
  border-radius: 25px;
  overflow: hidden;
  background: white;
  margin-bottom: 20px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: 0.5s;
  }
`;

const AIDescription = styled.div`
  background: rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  padding: 15px;
  margin-top: 15px;
  font-size: 0.9rem;
  color: #5c4b41;
  line-height: 1.6;
  border-right: 4px solid ${props => props.type === 'care' ? '#8fd3ff' : '#ffb7c5'};
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
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
  &:hover { transform: scale(1.05); background: #2d2622; }
  &:disabled { opacity: 0.5; }
`;

// --- المكون الرئيسي ---
const RaqqaBeautyAI = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const getCareData = async (isLoadMore = false) => {
    setLoading(true);
    try {
      // 1. جلب المنتجات (استخدام fetch العادي أو CapacitorHttp)
      const res = await fetch(`https://makeup-api.herokuapp.com/api/v1/products.json?product_tags=Natural`);
      const data = await res.json();
      
      // نأخذ عينة مختلفة في كل مرة "للتمثيل"
      const start = isLoadMore ? products.length : 0;
      const limitedData = data.slice(start, start + 6);

      // 2. معالجة كل منتج عبر الذكاء الاصطناعي باستخدام CapacitorHttp
      const enhancedProducts = await Promise.all(limitedData.map(async (product) => {
        try {
          const options = {
            url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
            headers: { 'Content-Type': 'application/json' },
            data: { 
              prompt: `المنتج: ${product.name}. 
              المطلوب: 1- وصف مختصر بالعربي. 
              2- نصيحة دقيقة لكيفية العناية واستخدام هذا المنتج بشكل سليم للحصول على أفضل نتيجة.` 
            },
          };

          const response = await CapacitorHttp.post(options);
          // نفترض أن الـ API يعيد نصاً يحتوي على الوصف والنصيحة
          const aiText = response.data.result || response.data.output;
          
          // تقسيم النص (هنا نحاول استخراج نصيحة العناية إذا كانت موجودة)
          return { 
            ...product, 
            arabicDesc: aiText || "منتج طبيعي رائع للعناية اليومية.",
            careTip: "ينصح باستخدامه على بشرة نظيفة بحركات دائرية مرتين يومياً." // قيمة افتراضية أو مستخرجة
          }; 
        } catch (e) {
          return { ...product, arabicDesc: "منتج مثالي لتعزيز روتين الجمال.", careTip: "يحفظ في مكان بارد وجاف." };
        }
      }));

      if (isLoadMore) {
        setProducts(prev => [...prev, ...enhancedProducts]);
      } else {
        setProducts(enhancedProducts);
      }
    } catch (error) {
      console.error("Fetch Error", error);
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
        <Badge><Sparkles size={16} /> دليل رقة الذكي</Badge>
        <h1 style={{ color: '#4a403a', fontWeight: '900', fontSize: '2.5rem', marginBottom: '10px' }}>موسوعة العناية والجمال</h1>
        <p style={{ color: '#8c7e74', fontSize: '1.1rem' }}>نحلل لكِ المكونات ونرشدكِ لطريقة الاستخدام الصحيحة</p>
      </Header>

      <Grid>
        {products.map((product) => (
          <ProductCard key={product.id + Math.random()}>
            <ImageContainer>
              <img 
                src={product.api_featured_image} 
                alt={product.name}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=Raqqa+Beauty'; }}
              />
            </ImageContainer>

            <div style={{ flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <ShieldCheck size={18} color="#ffb7c5" />
                <span style={{color: '#a393a1', fontWeight: 'bold'}}>{product.brand || 'ماركة طبيعية'}</span>
              </div>
              
              <h3 style={{ fontSize: '1.2rem', color: '#4a403a', marginBottom: '15px', fontWeight: '800' }}>
                {product.name}
              </h3>

              <AIDescription>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', color: '#ff8fa3', fontWeight: 'bold' }}>
                  <Wand2 size={14} /> تحليل رقة الذكي:
                </div>
                {product.arabicDesc}
              </AIDescription>

              <AIDescription type="care">
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', color: '#5dade2', fontWeight: 'bold' }}>
                  <HeartPulse size={14} /> بروتوكول العناية:
                </div>
                {product.careTip}
              </AIDescription>
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px', fontSize: '0.8rem', color: '#999', textAlign: 'center' }}>
              تصنيف: {product.category || 'جمال وعناية'}
            </div>
          </ProductCard>
        ))}
      </Grid>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#ffb7c5', margin: '40px 0' }}>
          <RefreshCw className="animate-spin" size={40} />
          <p>جاري استشارة الذكاء الاصطناعي...</p>
        </div>
      ) : (
        <LoadMoreBtn onClick={() => getCareData(true)}>
          إظهار المزيد من المنتجات
        </LoadMoreBtn>
      )}

      {/* زر التحديث العلوي السريع */}
      <button 
        onClick={() => { window.scrollTo(0,0); getCareData(false); }}
        style={{
          position: 'fixed', bottom: '30px', left: '30px', background: '#ffb7c5', 
          border: 'none', width: '60px', height: '60px', borderRadius: '50%', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', cursor: 'pointer', color: 'white',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}
      >
        <RefreshCw size={24} />
      </button>
    </PageWrapper>
  );
};

export default RaqqaBeautyAI;
