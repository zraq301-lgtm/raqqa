import React, { useState, useEffect } from 'react';
import './App (6).css'; // التأكد من استدعاء ملف التنسيق الخاص بك

const VideoLibrary = () => {
  const [allVideos, setAllVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // تعريف الأقسام بالأسماء الراقية التي اخترناها
  const categories = [
    { id: 'all', label: '🏠 الكل' },
    { id: 'health', label: '🍎 جسدك أمانة' },
    { id: 'religion', label: '📖 نور وبصيرة' },
    { id: 'mental', label: '🌱 ملاذ الروح' },
    { id: 'intimacy', label: '🕯️ أسرار الفراش' }
  ];

  useEffect(() => {
    // جلب البيانات من ملف list.json في مجلد public
    fetch('/list.json')
      .then(res => res.json())
      .then(data => {
        setAllVideos(data);
        setFilteredVideos(data);
        setLoading(false);
      })
      .catch(err => console.error("خطأ في تحميل الفيديوهات", err));
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

  // وظيفة لتحويل الرابط لفتح المشغل مباشرة داخل التطبيق
  const formatEmbedUrl = (url) => {
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (loading) return <div className="loader">جاري تهيئة واحتك الخاصة...</div>;

  return (
    <div className="app-container" style={{ background: 'var(--soft-bg)' }}>
      {/* الهيدر العلوي - مستوحى من ملف CSS الخاص بك */}
      <header className="top-sticky-menu">
        <h2 style={{ textAlign: 'center', color: 'var(--female-pink)', margin: '10px 0' }}>
          مكتبة فِكر تاني
        </h2>
        <div className="top-cards-container" style={{ overflowX: 'auto', paddingBottom: '10px' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => filterVideos(cat.id)}
              className={`top-card ${activeTab === cat.id ? 'active-tab' : ''}`}
              style={{
                border: activeTab === cat.id ? '2px solid var(--female-pink)' : '1px solid var(--female-pink-light)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <span className="card-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* منطقة عرض الفيديوهات */}
      <main className="main-content">
        <div className="video-grid" style={gridStyle}>
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video, index) => (
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
                  <span className="category-badge">{categories.find(c => c.id === video.category)?.label || 'عام'}</span>
                  <h3 className="video-title-text">{video.title}</h3>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', width: '100%', color: 'var(--text-gray)' }}>قريباً سيتم إضافة فيديوهات في هذا القسم..</p>
          )}
        </div>
      </main>

      {/* المنيو السفلي - بناءً على تنسيق ملفك 80px */}
      <nav className="bottom-sticky-menu">
        <div className="nav-grid">
          <div className="nav-item">
             <div className="custom-img-icon-nav" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>🏠</div>
             <span className="nav-label">الرئيسية</span>
          </div>
          <div className="center-action">
            <div className="center-circle">
               <div className="custom-img-icon-main" style={{display:'flex', justifyContent:'center', alignItems:'center', fontSize:'2rem'}}>🌸</div>
            </div>
            <span className="nav-label bold" style={{textAlign:'center', display:'block'}}>صحتك</span>
          </div>
          <div className="nav-item">
             <div className="custom-img-icon-nav" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>🔔</div>
             <span className="nav-label">تنبيهات</span>
          </div>
        </div>
      </nav>

      {/* إضافة تنسيقات إضافية للكروت لم تكن موجودة في ملفك الأصلي */}
      <style>{`
        .active-tab { background: var(--female-pink-light) !important; transform: scale(1.05); }
        .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .video-card-elegant { 
          background: white; border-radius: 20px; overflow: hidden; 
          box-shadow: 0 10px 20px rgba(255, 77, 125, 0.08); border: 1px solid var(--female-pink-light);
        }
        .video-frame { position: relative; padding-bottom: 56.25%; height: 0; }
        .video-frame iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .video-info { padding: 15px; text-align: right; }
        .category-badge { 
          background: var(--soft-bg); color: var(--female-pink); 
          padding: 2px 10px; border-radius: 10px; font-size: 0.7rem; font-weight: bold;
        }
        .video-title-text { font-size: 0.95rem; margin-top: 8px; color: var(--text-gray); font-weight: 600; }
        .loader { display: flex; justify-content: center; align-items: center; height: 100vh; color: var(--female-pink); font-family: 'Tajawal'; }
      `}</style>
    </div>
  );
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '20px',
  paddingBottom: '20px'
};

export default VideoLibrary;
