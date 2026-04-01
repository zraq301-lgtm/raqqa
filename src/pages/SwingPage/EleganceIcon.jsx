import React, { useEffect, useState, useCallback } from 'react';
import { createApi } from 'unsplash-js';
import styled, { keyframes } from 'styled-components';
import { Share2, Download, RefreshCcw, Heart, Sparkles, Wand2 } from 'lucide-react';

// --- 1. إعداد الـ API بنفس طريقة كود الديكور ---
const unsplash = createApi({
  accessKey: process.env.REACT_APP_UNSPLASH_KEY || '5oEHaoc0omGE8-t2y_tSQo2X0wzKwh3xjOrorB89ltY',
});

// --- 2. الأنيميشن (تأثيرات ناعمة) ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// --- 3. الـ CSS المخصص للهوية الأنثوية (Pastel & Glassmorphism) ---

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f7 0%, #f0efff 100%);
  padding: 40px 5%;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
`;

const HeaderSection = styled.header`
  text-align: center;
  margin-bottom: 50px;
  animation: ${fadeIn} 0.8s ease-out;
`;

const MainTitle = styled.h1`
  color: #6a5a72;
  font-weight: 900;
  font-size: 2.5rem;
  margin-bottom: 10px;
`;

const GalleryGrid = styled.div`
  columns: 3 300px;
  column-gap: 25px;
  max-width: 1400px;
  margin: 0 auto;
  @media (max-width: 768px) { columns: 2 200px; }
  @media (max-width: 480px) { columns: 1 100%; }
`;

const CardContainer = styled.div`
  break-inside: avoid;
  margin-bottom: 25px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(255, 182, 193, 0.2);
  animation: ${fadeIn} 0.5s ease-out both;
  animation-delay: ${props => props.delay}s;
  transition: transform 0.3s ease;
  &:hover { transform: translateY(-5px); }
`;

const TipSection = styled.div`
  padding: 20px;
  background: white;
`;

const TipBadge = styled.span`
  background: #ffe4e9;
  color: #ff8fa3;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  border-top: 1px solid #fff0f3;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: #a393a1;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: 0.3s;
  &:hover { color: #ff8fa3; transform: scale(1.1); }
`;

const FloatingRefresh = styled.button`
  position: fixed;
  bottom: 30px;
  left: 30px;
  background: #ffb7c5;
  color: white;
  border: none;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  box-shadow: 0 10px 25px rgba(255, 183, 197, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 100;
  &:hover { transform: rotate(180deg); background: #ff8fa3; }
  &.loading svg { animation: ${spin} 1s linear infinite; }
`;

// --- 4. مصفوفة النصائح الجمالية (سيتم عرض نصيحة عشوائية مع كل صورة) ---
const beautyTips = [
  "سر جمال الحجاب في اختيار القماش المناسب لشكل وجهك.",
  "لإشراقة دائمة، رطبي بشرتك يومياً قبل النوم.",
  "الألوان الباستيل تمنحك إطلالة هادئة وراقية.",
  "استخدمي زيت الأرجان لأطراف شعرك لحمايته من التقصف.",
  "تنسيق لون الحجاب مع الحذاء والحقيبة يكمل أناقتك.",
  "خلطة العسل والزبادي مثالية لتفتيح البشرة بلطف."
];

const RaqqaBeautyGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBeautyContent = useCallback(() => {
    setLoading(true);
    // جلب صور ملابس محجبات وعناية
    unsplash.search.getPhotos({
      query: 'modest fashion beauty skincare',
      perPage: 12,
      page: Math.floor(Math.random() * 20) + 1,
    }).then(result => {
      if (result.response) {
        // دمج الصور مع نصائح عشوائية
        const enrichedData = result.response.results.map(photo => ({
          ...photo,
          tip: beautyTips[Math.floor(Math.random() * beautyTips.length)]
        }));
        setItems(enrichedData);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchBeautyContent();
  }, [fetchBeautyContent]);

  return (
    <PageWrapper>
      <HeaderSection>
        <MainTitle>مملكة الأناقة والجمال</MainTitle>
        <p style={{color: '#a393a1', fontSize: '1.1rem'}}>إلهام يومي لكل ما يخص جمالك وأناقتك</p>
      </HeaderSection>

      <GalleryGrid>
        {items.map((item, index) => (
          <CardContainer key={item.id} delay={index * 0.1}>
            <img 
              src={item.urls.small} 
              alt="Fashion" 
              style={{width: '100%', display: 'block'}} 
            />
            
            <TipSection>
              <TipBadge>
                <Sparkles size={14} /> نصيحة رقة
              </TipBadge>
              <p style={{color: '#5c4b41', fontSize: '0.95rem', lineHeight: '1.6', margin: 0}}>
                {item.tip}
              </p>
            </TipSection>

            <ActionButtons>
              <IconButton title="أعجبني">
                <Heart size={20} />
              </IconButton>
              <div style={{display: 'flex', gap: '15px'}}>
                <IconButton title="مشاركة">
                  <Share2 size={18} />
                </IconButton>
                <IconButton title="تنسيق مشابه">
                  <Wand2 size={18} />
                </IconButton>
              </div>
            </ActionButtons>
          </CardContainer>
        ))}
      </GalleryGrid>

      <FloatingRefresh 
        onClick={fetchBeautyContent}
        className={loading ? 'loading' : ''}
      >
        <RefreshCcw size={28} />
      </FloatingRefresh>
    </PageWrapper>
  );
};

export default RaqqaBeautyGallery;
