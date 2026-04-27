import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';

const VideoLibrary = () => {
  const [allVideos, setAllVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', label: '🏠 الكل' },
    { id: 'health', label: '🍎 جسدك أمانة' },
    { id: 'religion', label: '📖 نور وبصيرة' },
    { id: 'mental', label: '🌱 ملاذ الروح' },
    { id: 'intimacy', label: '🕯️ أسرار الفراش' }
  ];

  useEffect(() => {
    fetchVideosFromFirebase();
  }, []);

  const fetchVideosFromFirebase = async () => {
    const options = {
      url: 'https://raqqa-hjl8.vercel.app/api/get-videos',
    };

    try {
      const response = await CapacitorHttp.get(options);
      const data = response.data;
      setAllVideos(data);
      setFilteredVideos(data);
      setLoading(false);
    } catch (err) {
      console.error("خطأ في جلب بيانات فيربيس:", err);
      setLoading(false);
    }
  };

  const filterVideos = (categoryId) => {
    setActiveTab(categoryId);
    if (categoryId === 'all') {
      setFilteredVideos(allVideos);
    } else {
      const filtered = allVideos.filter(v => v.category === categoryId);
      setFilteredVideos(filtered);
    }
  };

  const formatEmbedUrl = (url) => {
    if(!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  if (loading) return (
    <div style={fullScreenLoaderStyle}>
      جاري تهيئة واحتك الخاصة... 🌸
    </div>
  );

  return (
    <div style={fullScreenContainerStyle}>
      <style>{`
        :root {
          --female-pink: #ff4d7d;
          --female-pink-light: rgba(255, 77, 125, 0.15);
          --soft-bg: #fff5f7;
        }
        .video-card-elegant {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 20px rgba(255, 77, 125, 0.08);
          border: 1px solid var(--female-pink-light);
          margin-bottom: 20px;
        }
        .active-tab { 
          background-color: var(--female-pink) !important; 
          color: white !important;
        }
        .top-card {
          display: flex;
          align-items: center;
          background: white;
          padding: 8px 16px;
          border-radius: 30px;
          border: 1px solid var(--female-pink-light);
          cursor: pointer;
          white-space: nowrap;
          font-weight: bold;
          color: var(--female-pink);
          margin-left: 10px;
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* الهيدر ثابت في الأعلى */}
      <header style={headerStyle}>
        <h2 style={{ textAlign: 'center', color: '#ff4d7d', marginBottom: '15px' }}>مكتبة رقة 🌸</h2>
        <div style={tabsContainerStyle}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => filterVideos(cat.id)}
              className={`top-card ${activeTab === cat.id ? 'active-tab' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* المحتوى القابل للتمرير */}
      <main style={scrollContentStyle}>
        <div style={videoGridStyle}>
          {filteredVideos.map((video, index) => (
            <div key={video.id || index} className="video-card-elegant">
              <div style={videoFrameWrapper}>
                <iframe
                  src={formatEmbedUrl(video.url)}
                  title={video.title}
                  style={iframeStyle}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
              <div style={videoInfoStyle}>
                <span style={badgeStyle}>
                  {categories.find(c => c.id === video.category)?.label.split(' ')[1] || 'عام'}
                </span>
                <h3 style={videoTitleStyle}>{video.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

/* --- التنسيقات المعدلة --- */

const fullScreenContainerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: '70px', // تقصير مسافة الصفحة من الأسفل لترك مجال لأيقونات التطبيق الأساسية
  backgroundColor: '#fff5f7',
  zIndex: 9999, 
  direction: 'rtl',
  fontFamily: 'Tajawal, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const fullScreenLoaderStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: '#fff5f7',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#ff4d7d',
  zIndex: 10000,
  fontFamily: 'Tajawal, sans-serif'
};

const headerStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  padding: '15px 10px',
  borderBottom: '2px solid rgba(255, 77, 125, 0.15)',
  paddingTop: '35px' 
};

const scrollContentStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '15px',
  WebkitOverflowScrolling: 'touch' // لتحسين سلاسة التمرير على الموبايل
};

const tabsContainerStyle = { 
  display: 'flex', 
  overflowX: 'auto', 
  padding: '5px',
  gap: '5px'
};

const videoGridStyle = { 
  display: 'grid', 
  gridTemplateColumns: '1fr', 
  gap: '15px' 
};

const videoFrameWrapper = { 
  position: 'relative', 
  paddingBottom: '56.25%', 
  height: 0 
};

const iframeStyle = { 
  position: 'absolute', 
  top: 0, 
  left: 0, 
  width: '100%', 
  height: '100%' 
};

const videoInfoStyle = { padding: '15px' };

const badgeStyle = { 
  backgroundColor: 'rgba(255, 77, 125, 0.1)', 
  color: '#ff4d7d', 
  padding: '4px 12px', 
  borderRadius: '12px', 
  fontSize: '0.8rem', 
  fontWeight: 'bold' 
};

const videoTitleStyle = { 
  fontSize: '0.95rem', 
  marginTop: '10px', 
  color: '#444', 
  textAlign: 'right',
  fontWeight: '500'
};

export default VideoLibrary;
