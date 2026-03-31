import React, { useEffect, useState } from 'react';
import { createApi } from 'unsplash-js';
import styled, { keyframes } from 'styled-components';

// --- 1. إعداد الـ API باستخدام متغير البيئة ---
const unsplash = createApi({
  accessKey: process.env.REACT_APP_UNSPLASH_KEY || '5oEHaoc0omGE8-t2y_tSQo2X0wzKwh3xjOrorB89ltY',
});

// --- 2. الأنيميشن (Animations) لزوم الإبهار ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -468px 0 }
  100% { background-position: 468px 0 }
`;

// --- 3. الـ CSS الاحترافي المدمج ---

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  padding: 50px 5%;
  font-family: 'Cairo', 'Tajawal', sans-serif;
  direction: rtl;
`;

const HeaderSection = styled.header`
  text-align: center;
  margin-bottom: 60px;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: #4a403a;
  margin-bottom: 15px;
  background: linear-gradient(to right, #8e9eab, #eef2f3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
`;

const Subtitle = styled.p`
  color: #8c7e74;
  font-size: 1.1rem;
  letter-spacing: 1px;
`;

// شبكة الصور بنظام الـ Masonry الحديث
const GalleryGrid = styled.div`
  columns: 3 300px; // ثلاث أعمدة ذكية تتجاوب مع الشاشة
  column-gap: 25px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    columns: 2 200px;
  }
  @media (max-width: 480px) {
    columns: 1 100%;
  }
`;

const ImageCard = styled.div`
  position: relative;
  margin-bottom: 25px;
  break-inside: avoid;
  border-radius: 24px;
  overflow: hidden;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: ${fadeIn} 0.5s ease-out both;
  animation-delay: ${props => props.delay}s;

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
    
    .overlay { opacity: 1; }
    img { filter: brightness(0.8) blur(2px); }
  }
`;

const StyledImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  transition: all 0.6s ease;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px); // تأثير Glassmorphism
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: all 0.4s ease;
  padding: 20px;
  text-align: center;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const DesignerName = styled.span`
  background: rgba(255, 255, 255, 0.9);
  color: #5c4b41;
  padding: 8px 18px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;

const Skeleton = styled.div`
  width: 100%;
  height: 300px;
  border-radius: 24px;
  background: #f6f7f8;
  background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
  background-repeat: no-repeat;
  background-size: 800px 104px;
  animation: ${shimmer} 1.2s infinite linear;
`;

// --- 4. المكون الرئيسي ---

const RaqqaLuxuryGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    unsplash.search.getPhotos({
      query: 'luxury home decor interior pastel',
      perPage: 24,
      orderBy: 'relevant',
    }).then(result => {
      if (result.response) {
        setPhotos(result.response.results);
      }
      setLoading(false);
    });
  }, []);

  return (
    <PageWrapper>
      <HeaderSection>
        <Title>واحة الجمال</Title>
        <Subtitle>استلهمي رقة منزلك من أرقى التصاميم العالمية</Subtitle>
      </HeaderSection>

      <GalleryGrid>
        {loading ? (
          // عرض الهيكل الفارغ أثناء التحميل (Skeleton Screen)
          [...Array(6)].map((_, i) => <Skeleton key={i} />)
        ) : (
          photos.map((photo, index) => (
            <ImageCard key={photo.id} delay={index * 0.1}>
              <StyledImage 
                src={photo.urls.regular} 
                alt={photo.alt_description} 
              />
              <Overlay className="overlay">
                <DesignerName>بلمسة: {photo.user.name}</DesignerName>
                <div style={{marginTop: '10px', fontSize: '0.8rem', opacity: 0.8}}>
                    {photo.description || "تصميم عصري من رقة"}
                </div>
              </Overlay>
            </ImageCard>
          ))
        )}
      </GalleryGrid>
    </PageWrapper>
  );
};

export default RaqqaLuxuryGallery;
