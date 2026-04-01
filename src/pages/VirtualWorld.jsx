import React, { useState } from 'react';
import { vrCategories } from './vrData'; // تأكد من المسار الصحيح للملف

const RelaxationPage = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <div className="relaxation-container" style={{ padding: '20px', direction: 'rtl' }}>
      <h1 style={{ color: '#555', textAlign: 'center' }}>مملكة الاسترخاء 🌸</h1>

      {/* مشغل الفيديو يظهر فقط عند الضغط على رحلة */}
      {activeVideo && (
        <div style={glassStyles.videoModal}>
          <button onClick={() => setActiveVideo(null)} style={glassStyles.closeBtn}>إغلاق الرحلة ×</button>
          <iframe 
            src={`https://www.airpano.com/video.php?id=${activeVideo}`} 
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
          />
        </div>
      )}

      {/* عرض الأقسام والرحلات */}
      {vrCategories.map((category) => (
        <div key={category.id} style={{ ...glassStyles.section, backgroundColor: category.color }}>
          <h3>{category.title}</h3>
          <p style={{ fontSize: '0.8rem', color: '#888' }}>{category.description}</p>
          
          <div style={glassStyles.grid}>
            {category.trips.map((trip) => (
              <div 
                key={trip.id} 
                onClick={() => setActiveVideo(trip.id)}
                style={glassStyles.card}
              >
                {trip.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// تنسيقات الـ Glassmorphism التي تفضلها
const glassStyles = {
  section: {
    borderRadius: '20px',
    padding: '15px',
    marginBottom: '20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '10px'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(5px)',
    padding: '10px 15px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#666'
  },
  videoModal: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    zIndex: 2000, backgroundColor: '#000'
  },
  closeBtn: {
    position: 'absolute', top: '20px', left: '20px', zIndex: 2001,
    padding: '8px 15px', borderRadius: '20px', backgroundColor: '#FFD1DC', border: 'none'
  }
};

export default RelaxationPage;
