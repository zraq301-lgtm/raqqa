import React, { useState, useEffect } from 'react';
// تأكد أنك قمت بتسمية الملف App.css ووضعه في نفس المجلد
import './App.css'; 

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
    // جلب البيانات من المسار الجذري (root) لضمان العمل على فيرسل
    fetch('/list.json')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setAllVideos(data);
        setFilteredVideos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("خطأ في تحميل الفيديوهات:", err);
        setLoading(false);
      });
  }, []);

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
    // تحويل روابط يوتيوب العادية والمختصرة إلى روابط Embed
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  if (loading) return <div className="loader">جاري تهيئة واحتك الخاصة...</div>;

  return (
    <div className="app-container">
      <header className="top-sticky-menu">
        <h2 style={{ textAlign: 'center', color: 'var(--female-pink)', margin: '10px 0' }}>مكتبة فِكر تاني</h2>
        <div className="top-cards-container" style={{ overflowX: 'auto', display: 'flex', whiteSpace: 'nowrap' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => filterVideos(cat.id)}
              className={`top-card ${activeTab === cat.id ? 'active-tab' : ''}`}
            >
              <span className="card-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="main-content">
        <div className="video-grid">
          {filteredVideos.map((video, index) => (
            <div key={index} className="video-card-elegant">
              <div className="video-frame">
                <iframe
                  src={formatEmbedUrl(video.url)}
                  title={video.title}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="video-info">
                <span className="category-badge">
                  {categories.find(c => c.id === video.category)?.label.split(' ')[1] || 'عام'}
                </span>
                <h3 className="video-title-text">{video.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      {/* ستايل إضافي لضمان عمل الجريد بشكل صحيح */}
      <style>{`
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          padding: 10px;
        }
        .active-tab {
          background-color: var(--female-pink) !important;
          color: white !important;
        }
        .active-tab .card-label { color: white !important; }
      `}</style>
    </div>
  );
};

export default VideoLibrary;
