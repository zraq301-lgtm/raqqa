import React, { useState, useEffect } from 'react';

const VideoLibrary = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // وظيفة ذكية لتحويل أي رابط يوتيوب إلى رابط صالح للعرض داخل التطبيق
  const getEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  useEffect(() => {
    // استدعاء البيانات من ملف list.json الموجود في مجلد public
    fetch('/list.json')
      .then((response) => response.json())
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading videos:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={styles.loader}>جاري تحميل المكتبة...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>مكتبة الفيديوهات الصحية</h1>
        <p style={styles.subtitle}>كل ما يهم صحة المرأة والأسرة في مكان واحد</p>
      </header>

      <div style={styles.grid}>
        {videos.map((video, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.videoWrapper}>
              <iframe
                src={getEmbedUrl(video[1])}
                title={video[0]}
                style={styles.iframe}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div style={styles.cardInfo}>
              <h3 style={styles.videoTitle}>{video[0]}</h3>
              <button 
                onClick={() => window.open(video[1], '_blank')}
                style={styles.button}
              >
                مشاهدة على يوتيوب
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// تنسيقات الصفحة (Styles)
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    direction: 'rtl', // لدعم اللغة العربية
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    color: '#2c3e50',
    fontSize: '2rem'
  },
  subtitle: {
    color: '#7f8c8d'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '25px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease'
  },
  videoWrapper: {
    position: 'relative',
    paddingBottom: '56.25%', // نسبة 16:9
    height: 0,
    overflow: 'hidden'
  },
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  cardInfo: {
    padding: '15px'
  },
  videoTitle: {
    fontSize: '1.1rem',
    color: '#34495e',
    marginBottom: '10px',
    lineHeight: '1.4'
  },
  button: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    width: '100%'
  },
  loader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.5rem',
    color: '#3498db'
  }
};

export default VideoLibrary;
