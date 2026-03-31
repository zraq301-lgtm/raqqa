import React, { useEffect, useState, useCallback } from 'react';
import { createApi } from 'unsplash-js';
import styled, { keyframes } from 'styled-components';
import { Share2, Download, RefreshCcw, X, Maximize2 } from 'lucide-react';

// --- 1. إعداد الـ API ---
const unsplash = createApi({
  accessKey: process.env.REACT_APP_UNSPLASH_KEY || '5oEHaoc0omGE8-t2y_tSQo2X0wzKwh3xjOrorB89ltY',
});

// --- 2. الأنيميشن ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// --- 3. الـ CSS المدمج ---

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  padding: 40px 5%;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
`;

const HeaderSection = styled.header`
  text-align: center;
  margin-bottom: 40px;
  animation: ${fadeIn} 0.8s ease-out;
`;

const GalleryGrid = styled.div`
  columns: 3 300px;
  column-gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  @media (max-width: 768px) { columns: 2 200px; }
  @media (max-width: 480px) { columns: 1 100%; }
`;

const ImageCard = styled.div`
  position: relative;
  margin-bottom: 20px;
  break-inside: avoid;
  border-radius: 20px;
  overflow: hidden;
  background: white;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  animation: ${fadeIn} 0.5s ease-out both;
  animation-delay: ${props => props.delay}s;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 12px;
  background: white;
  border-top: 1px solid #f0f0f0;
`;

const IconButton = styled.button`
  background: #f8f9fa;
  border: none;
  border-radius: 12px;
  padding: 8px 15px;
  color: #5c4b41;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-family: 'Cairo';
  font-size: 0.8rem;
  transition: all 0.3s ease;
  &:hover { background: #e2e2e2; transform: scale(1.05); }
  &:active { transform: scale(0.95); }
`;

const FloatingRefresh = styled.button`
  position: fixed;
  bottom: 30px;
  left: 30px;
  background: #4a403a;
  color: white;
  border: none;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 100;
  transition: 0.3s;
  &:hover { transform: scale(1.1); background: #000; }
  &.loading svg { animation: ${spin} 1s linear infinite; }
`;

const LightboxOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(15px);
`;

// --- 4. المكون الرئيسي ---

const RaqqaLuxuryGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = useCallback(() => {
    setLoading(true);
    // استخدام Math.random لجعل البحث يعطي نتائج مختلفة في كل مرة (تحديث)
    unsplash.search.getPhotos({
      query: 'luxury interior 3d render',
      perPage: 15,
      page: Math.floor(Math.random() * 10) + 1, 
    }).then(result => {
      if (result.response) {
        setPhotos(result.response.results);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleShare = async (photo) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تصميم من تطبيق رقة',
          text: 'شاهد هذا التصميم الرائع للديكور!',
          url: photo.links.html,
        });
      } catch (err) { console.log("Share failed"); }
    }
  };

  const handleDownload = (imageUrl, fileName) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageWrapper>
      <HeaderSection>
        <h1 style={{color: '#4a403a', fontWeight: '900'}}>معرض رقة للديكور</h1>
        <p style={{color: '#8c7e74'}}>تصاميم عالمية بين يديك</p>
      </HeaderSection>

      <GalleryGrid>
        {photos.map((photo, index) => (
          <ImageCard key={photo.id} delay={index * 0.1}>
            <img 
              src={photo.urls.small} 
              alt="Decoration" 
              style={{width: '100%', cursor: 'zoom-in'}} 
              onClick={() => setSelectedPhoto(photo.urls.regular)}
            />
            <ActionButtons>
              <IconButton onClick={() => handleDownload(photo.urls.full, `Raqqa-${photo.id}.jpg`)}>
                <Download size={16} /> حفظ
              </IconButton>
              <IconButton onClick={() => handleShare(photo)}>
                <Share2 size={16} /> مشاركة
              </IconButton>
            </ActionButtons>
          </ImageCard>
        ))}
      </GalleryGrid>

      {/* زر التحديث العائم */}
      <FloatingRefresh 
        onClick={fetchPhotos} 
        className={loading ? 'loading' : ''}
        title="تحديث الصور"
      >
        <RefreshCcw size={28} />
      </FloatingRefresh>

      {/* نافذة التكبير */}
      {selectedPhoto && (
        <LightboxOverlay>
          <X 
            size={40} 
            style={{position: 'absolute', top: '20px', left: '20px', cursor: 'pointer', color: '#4a403a'}} 
            onClick={() => setSelectedPhoto(null)} 
          />
          <img 
            src={selectedPhoto} 
            alt="Full Preview" 
            style={{maxWidth: '90%', maxHeight: '80vh', borderRadius: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)'}} 
          />
        </LightboxOverlay>
      )}
    </PageWrapper>
  );
};

export default RaqqaLuxuryGallery;
