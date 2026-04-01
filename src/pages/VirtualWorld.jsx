import React, { useState } from 'react';
// تأكد أن الامتداد مطابق للملف الموجود عندك (jsx أو js)
import { vrCategories } from '../vrData'; 

const VirtualWorld = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <div className="relaxation-container" style={{ padding: '20px', direction: 'rtl', minHeight: '100vh', backgroundColor: '#fcfcfc' }}>
      <h1 style={{ color: '#555', textAlign: 'center', marginBottom: '30px', fontWeight: '300' }}>مملكة الاسترخاء 🌸</h1>

      {/* مشغل الفيديو الافتراضي - يظهر عند اختيار رحلة */}
      {activeVideo && (
        <div style={glassStyles.videoModal}>
          <button onClick={() => setActiveVideo(null)} style={glassStyles.closeBtn}>إغلاق الرحلة ×</button>
          <iframe 
            src={`https://www.airpano.com/video.php?id=${activeVideo}`} 
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
            title="VR Video"
          />
        </div>
      )}

      {/* عرض الأقسام والرحلات */}
      {vrCategories && vrCategories.map((category) => (
        <div key={category.id} style={{ ...glassStyles.section, backgroundColor: category.color }}>
          <h3 style={{ margin: '0 0 5px 0', color: '#444' }}>{category.title}</h3>
          <p style={{ fontSize: '0.85rem', color: '#777', marginBottom: '15px' }}>{category.description}</p>
          
          <div style={glassStyles.grid}>
            {category.trips.map((trip) => (
              <div 
                key={trip.id} 
                onClick={() => setActiveVideo(trip.id)}
                style={glassStyles.card}
              >
                <span style={{ marginLeft: '5px' }}>📍</span>
                {trip.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// تنسيقات الـ Glassmorphism الرقيقة
const glassStyles = {
  section: {
    borderRadius: '24px',
    padding: '20px',
    marginBottom: '25px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    border: '1px solid rgba(255, 255, 255, 0.8)'
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '10px'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    padding: '12px 18px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#555',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
    transition: 'transform 0.2s ease'
  },
  videoModal: {
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100vw', 
    height: '100vh',
    zIndex: 9999, 
    backgroundColor: '#000'
  },
  closeBtn: {
    position: 'absolute', 
    top: '25px', 
    left: '20px', 
    zIndex: 10000,
    padding: '10px 20px', 
    borderRadius: '50px', 
    backgroundColor: '#FFD1DC', 
    border: 'none',
    color: '#444',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  }
};

// هذا هو السطر الأهم الذي كان يسبب الخطأ في Vercel
export default VirtualWorld;
