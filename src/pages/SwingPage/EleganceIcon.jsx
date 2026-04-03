import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Sparkles, Leaf, RefreshCw, Star, Wand2, ShieldCheck } from 'lucide-react';

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
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); /* زيادة العرض */
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
  height: 320px; /* تكبير عرض وطول الصورة */
  border-radius: 25px;
  overflow: hidden;
  background: white;
  margin-bottom: 20px;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.02);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* جعل الصورة تملأ المساحة بشكل احترافي */
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
  border-right: 4px solid #ffb7c5;
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

// --- المكون الرئيسي ---
const RaqqaBeautyAI = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // دالة جلب البيانات ودمجها مع وصف الذكاء الاصطناعي
  const getCareData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://makeup-api.herokuapp.com/api/v1/products.json?product_tags=Natural');
      const data = await response.json();
      const limitedData = data.slice(0, 9);

      // طلب الوصف العربي من الـ API الخاص بك لكل منتج
      const enhancedProducts = await Promise.all(limitedData.map(async (product) => {
        try {
          const aiRes = await fetch('https://raqqa-v6cd.vercel.app/api/raqqa-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: `اشرح بالعربي باختصار أهمية هذا المنتج للعناية بالمرأة: ${product.name}. الوصف الأصلي: ${product.description}` 
            })
          });
          const aiData = await aiRes.json();
          return { ...product, arabicDesc: aiData.result || aiData.output }; 
        } catch {
          return { ...product, arabicDesc: "منتج مثالي لتعزيز روتين العناية اليومي وحماية البشرة بلطف." };
        }
      }));

      setProducts(enhancedProducts);
    } catch (error) {
      console.error("Fetch Error");
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
        <p style={{ color: '#8c7e74', fontSize: '1.1rem' }}>نحلل لكِ المكونات لنمنحكِ أفضل نصائح العناية</p>
      </Header>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#ffb7c5', marginTop: '100px' }}>
          <RefreshCw className="animate-spin" size={50} />
          <p style={{marginTop: '20px', fontSize: '1.2rem'}}>الذكاء الاصطناعي يحلل البيانات...</p>
        </div>
      ) : (
        <Grid>
          {products.map((product, index) => (
            <ProductCard key={product.id}>
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
              </div>

              <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px', fontSize: '0.8rem', color: '#999', textAlign: 'center' }}>
                تصنيف: {product.category || 'جمال وعناية'}
              </div>
            </ProductCard>
          ))}
        </Grid>
      )}

      {/* زر تحديث الموسوعة */}
      {!loading && (
        <button 
          onClick={getCareData}
          style={{
            position: 'fixed', bottom: '30px', left: '30px', background: '#4a403a', 
            border: 'none', width: '60px', height: '60px', borderRadius: '50%', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', cursor: 'pointer', color: 'white',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
        >
          <RefreshCw size={24} />
        </button>
      )}
    </PageWrapper>
  );
};

export default RaqqaBeautyAI;
