import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Sparkles, Heart, Wand2, Shirt, Moon, Sun, RefreshCcw, ShoppingBag, Star } from 'lucide-react';

// استخدام متغير البيئة الخاص بك
const UNSPLASH_KEY = import.meta.env.REACT_APP_UNSPLASH_KEY || "";

const raqqaContent = {
  beauty: [
    { id: 1, mood: "متعبة", title: "إعادة إحياء العينين", desc: "استخدمي ملعقة باردة لتقليل الانتفاخ، ثم سيروم الكافيين لإخفاء الإجهاد فوراً.", tag: "عناية فورية", query: "skincare,serum,eyes" },
    { id: 2, mood: "هادئة", title: "طقوس بشرة زجاجية", desc: "دلكي بشرتك بحجر الجواشا وزيت الورد لتحفيز الكولاجين الطبيعي ونحت الوجه.", tag: "استرخاء", query: "skincare,massage,oil" },
    { id: 3, mood: "متحمسة", title: "مكياج السهرة المخملي", desc: "جربي أحمر شفاه قوي مع لمسة هايلايتر على عظمة الوجنة لإطلالة لا تُنسى.", tag: "تألقي", query: "makeup,lipstick,luxury" }
  ],
  fashion: [
    { id: 10, type: "كاجوال", title: "تنسيق مريح للمحجبات", desc: "القميص الطويل مع بنطال واسع وحجاب قطني يعطيكِ راحة وأناقة.", query: "hijab,modest,streetstyle" },
    { id: 11, type: "رسمي", title: "بليزر العمل المحتشم", desc: "البليزر الطويل مع حزام خصر وتنورة مستقيمة لإطلالة احترافية قوية.", query: "hijab,office,modest" },
    { id: 12, type: "مناسبات", title: "فخامة الساتان والحرير", desc: "فساتين السهرة ذات الطبقات المتعددة تمنحكِ وقاراً وجمالاً في ليلة العمر.", query: "hijab,evening,dress" }
  ]
};

const RaqqaWomanCenter = () => {
  const [mainTab, setMainTab] = useState('beauty');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = async (query) => {
    if (!UNSPLASH_KEY) return;
    setLoading(true);
    try {
      const fullQuery = mainTab === 'fashion' ? `hijab,modest,fashion,${query}` : `beauty,cosmetics,${query}`;
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${fullQuery}&per_page=4&client_id=${UNSPLASH_KEY}`);
      const data = await response.json();
      setImages(data.results || []);
    } catch (err) { 
      console.error("Unsplash Error:", err); 
    }
    setLoading(false);
  };

  useEffect(() => {
    const initialQuery = mainTab === 'beauty' ? raqqaContent.beauty[0].query : raqqaContent.fashion[0].query;
    fetchImages(initialQuery);
  }, [mainTab]);

  return (
    <Container>
      <HeaderSection>
        <MainTitle>رقة للجمال والأناقة</MainTitle>
        <TabSwitcher>
          <SwitchBtn active={mainTab === 'beauty'} onClick={() => setMainTab('beauty')}>
            <Wand2 size={20} /> عالم الجمال
          </SwitchBtn>
          <SwitchBtn active={mainTab === 'fashion'} onClick={() => setMainTab('fashion')}>
            <Shirt size={20} /> معرض الأزياء
          </SwitchBtn>
        </TabSwitcher>
      </HeaderSection>

      <ContentGrid>
        <Sidebar>
          <SectionTitle>{mainTab === 'beauty' ? 'نصائح الجمال' : 'تنسيقات محجبات'}</SectionTitle>
          {(mainTab === 'beauty' ? raqqaContent.beauty : raqqaContent.fashion).map((item) => (
            <TipCard key={item.id} onClick={() => fetchImages(item.query)}>
              <Badge>{item.mood || item.type}</Badge>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </TipCard>
          ))}
          
          <FeaturedBox>
            <Star size={20} color="#ff7675" fill="#ff7675" />
            <h5>نصيحة اليوم الذهبية</h5>
            <p>الثقة هي أجمل ما ترتدينه، لكن لا تنسي واقي الشمس!</p>
          </FeaturedBox>
        </Sidebar>

        <MainDisplay>
          {loading ? (
            <LoadingOverlay>جاري جلب الإلهام...</LoadingOverlay>
          ) : (
            <ImageGrid>
              {images.map((img) => (
                <ImageCard key={img.id}>
                  <img src={img.urls.regular} alt="Raqqa View" />
                  <Overlay>
                    <div className="top-icons"><Heart size={18} /></div>
                    <div className="bottom-info">
                      <ShoppingBag size={16} /> استعراض التنسيق
                    </div>
                  </Overlay>
                </ImageCard>
              ))}
            </ImageGrid>
          )}
        </MainDisplay>
      </ContentGrid>
    </Container>
  );
};

// --- التنسيقات ---

const Container = styled.div`
  min-height: 100vh; background: #fffcfc; padding: 40px 6%; direction: rtl; font-family: 'Cairo', sans-serif;
`;

const HeaderSection = styled.div`
  text-align: center; margin-bottom: 50px;
`;

const MainTitle = styled.h1`
  font-size: 2.8rem; color: #2d3436; font-weight: 900; margin-bottom: 30px;
  background: linear-gradient(45deg, #ff7675, #6c5ce7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
`;

const TabSwitcher = styled.div`
  display: inline-flex; background: #f1f2f6; padding: 8px; border-radius: 50px; gap: 5px;
`;

const SwitchBtn = styled.button`
  padding: 12px 30px; border-radius: 40px; border: none; cursor: pointer;
  display: flex; align-items: center; gap: 10px; font-family: 'Cairo'; font-weight: 800;
  transition: 0.4s ease;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#6c5ce7' : '#636e72'};
  box-shadow: ${props => props.active ? '0 10px 20px rgba(0,0,0,0.05)' : 'none'};
`;

const ContentGrid = styled.div`
  display: grid; grid-template-columns: 1fr 2.5fr; gap: 40px;
  @media (max-width: 1000px) { grid-template-columns: 1fr; }
`;

const Sidebar = styled.div`
  display: flex; flex-direction: column; gap: 20px;
`;

const SectionTitle = styled.h3`
  color: #2d3436; border-right: 4px solid #ff7675; padding-right: 15px; margin-bottom: 10px;
`;

const TipCard = styled.div`
  background: white; padding: 25px; border-radius: 25px; cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.02); transition: 0.3s;
  &:hover { transform: scale(1.03); box-shadow: 0 15px 30px rgba(0,0,0,0.05); }
  h4 { margin: 10px 0; color: #2d3436; }
  p { font-size: 0.9rem; color: #636e72; line-height: 1.6; }
`;

const Badge = styled.span`
  background: #fff0f0; color: #ff7675; padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 800;
`;

const MainDisplay = styled.div`
  min-height: 600px;
`;

const ImageGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px;
`;

const ImageCard = styled.div`
  position: relative; height: 380px; border-radius: 30px; overflow: hidden;
  img { width: 100%; height: 100%; object-fit: cover; transition: 0.6s; }
  &:hover img { transform: scale(1.1); }
  &:hover div { opacity: 1; }
`;

const Overlay = styled.div`
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8));
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 25px; opacity: 0; transition: 0.4s;
  .top-icons { text-align: left; color: white; }
  .bottom-info { color: white; display: flex; align-items: center; gap: 8px; font-weight: 700; }
`;

const FeaturedBox = styled.div`
  background: #2d3436; color: white; padding: 30px; border-radius: 30px; margin-top: 20px;
  h5 { font-size: 1.1rem; margin: 10px 0; color: #ff7675; }
  p { font-size: 0.9rem; opacity: 0.8; }
`;

const LoadingOverlay = styled.div`
  display: flex; align-items: center; justify-content: center; height: 100%; font-weight: 800; color: #6c5ce7;
`;

export default RaqqaWomanCenter;
