import React, { useState } from 'react';
import { vrCategories } from '../vrData';

const VirtualWorld = () => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [isVRMode, setIsVRMode] = useState(true); // وضع الواقع الافتراضي مفعل تلقائياً

  const getYoutubeUrl = (id) => {
    // وضع VR يضيف بارامترات خاصة للحركة، الوضع العادي يعرض الفيديو بشكل طبيعي
    const base = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    return isVRMode ? `${base}&vr=1` : base;
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>مملكة الاسترخاء 🌸</h1>
        <div style={styles.switchContainer}>
          <span style={styles.switchLabel}>{isVRMode ? "وضع الواقع الافتراضي" : "وضع العرض العادي"}</span>
          <button 
            onClick={() => setIsVRMode(!isVRMode)} 
            style={{...styles.toggleBtn, backgroundColor: isVRMode ? '#C8E6C9' : '#FFD1DC'}}
          >
            تبديل الوضع
          </button>
        </div>
      </header>

      {activeVideo && (
        <div style={styles.overlay}>
          <div style={styles.modalHeader}>
            <button onClick={() => setActiveVideo(null)} style={styles.closeBtn}>رجوع القائمة ×</button>
          </div>
          <iframe 
            src={getYoutubeUrl(activeVideo)} 
            style={styles.iframe}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; vr"
            allowFullScreen
          />
        </div>
      )}

      <div style={styles.scrollArea}>
        {vrCategories.map(cat => (
          <div key={cat.id} style={{...styles.section, backgroundColor: cat.color}}>
            <h2 style={styles.sectionTitle}>{cat.title}</h2>
            <p style={styles.sectionDesc}>{cat.description}</p>
            <div style={styles.grid}>
              {cat.trips.map((trip, i) => (
                <div key={i} onClick={() => setActiveVideo(trip.id)} style={styles.card}>
                  <div style={styles.icon}>🎬</div>
                  <span style={styles.tripName}>{trip.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', direction: 'rtl', backgroundColor: '#fff', minHeight: '100vh' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { color: '#444', fontWeight: '300' },
  switchContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' },
  switchLabel: { fontSize: '0.8rem', color: '#888' },
  toggleBtn: { border: 'none', padding: '5px 15px', borderRadius: '20px', fontSize: '0.7rem', cursor: 'pointer' },
  scrollArea: { display: 'flex', flexDirection: 'column', gap: '30px' },
  section: { padding: '20px', borderRadius: '30px', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' },
  sectionTitle: { fontSize: '1.2rem', color: '#333', margin: '0' },
  sectionDesc: { fontSize: '0.8rem', color: '#777', marginBottom: '15px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' },
  card: {
    background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(5px)',
    padding: '15px 10px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.5)'
  },
  icon: { fontSize: '1.2rem', marginBottom: '5px' },
  tripName: { fontSize: '0.75rem', color: '#555' },
  overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, backgroundColor: '#000' },
  modalHeader: { position: 'absolute', top: '20px', left: '20px', zIndex: 1001 },
  closeBtn: { padding: '10px 20px', borderRadius: '50px', border: 'none', backgroundColor: '#FFD1DC', fontWeight: 'bold' },
  iframe: { width: '100%', height: '100%', border: 'none' }
};

export default VirtualWorld;
