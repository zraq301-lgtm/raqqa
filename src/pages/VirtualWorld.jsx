import React, { useState } from 'react';
import { vrCategories } from '../vrData'; 

const VirtualWorld = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  // دالة ذكية لتحويل الـ ID لنسخة التشغيل السريع من يوتيوب
  const getYoutubeEmbed = (id) => {
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&rel=0&controls=1&showinfo=0`;
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.header}>مملكة الاسترخاء 🌸</h1>

      {/* مشغل الفيديو - يفتح عند الضغط على أي رحلة */}
      {activeVideo && (
        <div style={styles.videoModal}>
          <button onClick={() => setActiveVideo(null)} style={styles.closeBtn}>رجوع ×</button>
          <iframe 
            src={getYoutubeEmbed(activeVideo)} 
            style={styles.iframe}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; vr"
            allowFullScreen
          />
        </div>
      )}

      {/* عرض الأقسام بتصميم رقيق */}
      {vrCategories.map((category) => (
        <div key={category.id} style={{ ...styles.section, backgroundColor: category.color }}>
          <h3 style={styles.catTitle}>{category.title}</h3>
          <p style={styles.catDesc}>{category.description}</p>
          
          <div style={styles.grid}>
            {category.trips.length > 0 ? (
              category.trips.map((trip, index) => (
                <div key={index} onClick={() => setActiveVideo(trip.id)} style={styles.card}>
                  ✨ {trip.name}
                </div>
              ))
            ) : (
              <p style={styles.emptyText}>قريباً رحلات جديدة في هذا العالم...</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  page: { padding: '20px', direction: 'rtl', minHeight: '100vh', backgroundColor: '#fff' },
  header: { color: '#444', textAlign: 'center', marginBottom: '30px', fontWeight: 'bold' },
  section: { borderRadius: '25px', padding: '20px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.8)' },
  catTitle: { margin: '0', color: '#333', fontSize: '1.2rem' },
  catDesc: { fontSize: '0.8rem', color: '#666', marginBottom: '15px' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  card: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(5px)',
    padding: '12px 20px',
    borderRadius: '15px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#444'
  },
  emptyText: { fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic' },
  videoModal: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: '#000' },
  iframe: { width: '100%', height: '100%', border: 'none' },
  closeBtn: {
    position: 'absolute', top: '25px', left: '20px', zIndex: 10000,
    padding: '10px 25px', borderRadius: '50px', backgroundColor: '#FFD1DC', border: 'none',
    fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
  }
};

export default VirtualWorld;
