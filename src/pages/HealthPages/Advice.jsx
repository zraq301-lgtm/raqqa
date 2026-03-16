import React, { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes, Qibla } from 'adadhan';
import { DateTime } from 'luxon';
import { motion } from 'framer-motion';

const PrayerDashboard = () => {
  const [location, setLocation] = useState(null);
  const [times, setTimes] = useState(null);
  const [qiblaDir, setQiblaDir] = useState(0);
  const [nextPrayer, setNextPrayer] = useState("");

  // جلب الموقع الجغرافي
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        calculateData(latitude, longitude);
      });
    }
  }, []);

  const calculateData = (lat, lng) => {
    const coords = new Coordinates(lat, lng);
    const params = CalculationMethod.Egyptian(); // طريقة الهيئة المصرية العامة للمساحة
    const date = new Date();
    const prayerTimes = new PrayerTimes(coords, date, params);
    
    setTimes(prayerTimes);
    setQiblaDir(Qibla(coords));
    setNextPrayer(prayerTimes.nextPrayer());
  };

  const playAzan = () => {
    const audio = new Audio('/assets/azan.mp3');
    audio.play().catch(e => console.log("Interaction required for audio"));
  };

  // تنسيق الوقت
  const formatTime = (time) => DateTime.fromJSDate(time).toLocaleString(DateTime.TIME_SIMPLE);

  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={styles.glassCard}
      >
        <h2 style={styles.title}>مواقيت الصلاة والقبلة</h2>
        
        {/* قسم القبلة */}
        <div style={styles.qiblaContainer}>
          <div style={{ ...styles.compass, transform: `rotate(${-qiblaDir}deg)` }}>
            <img 
              src="/assets/Kaaba.png" 
              alt="Qibla" 
              style={styles.kaabaImg} 
            />
          </div>
          <p style={styles.subtitle}>اتجاه القبلة: {Math.round(qiblaDir)}°</p>
        </div>

        {/* عرض المواقيت */}
        <div style={styles.timesGrid}>
          {times && [
            { name: "الفجر", time: times.fajr },
            { name: "الظهر", time: times.dhuhr },
            { name: "العصر", time: times.asr },
            { name: "المغرب", time: times.maghrib },
            { name: "العشاء", time: times.isha },
          ].map((p, i) => (
            <div key={i} style={p.name === nextPrayer ? styles.activeRow : styles.row}>
              <span>{p.name}</span>
              <span>{formatTime(p.time)}</span>
            </div>
          ))}
        </div>

        <button onClick={playAzan} style={styles.button}>
          تجربة صوت الأذان
        </button>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%)', // Rose to Violet
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(15px)',
    borderRadius: '30px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  title: { color: '#8e24aa', marginBottom: '25px', fontSize: '1.8rem' },
  qiblaContainer: { position: 'relative', margin: '30px 0' },
  compass: {
    width: '120px',
    height: '120px',
    margin: '0 auto',
    transition: 'transform 1s ease-out',
  },
  kaabaImg: { width: '100%', height: '100%', objectFit: 'contain' },
  timesGrid: { marginTop: '20px', borderRadius: '15px', overflow: 'hidden' },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 20px',
    borderBottom: '1px solid rgba(142, 36, 170, 0.1)',
    color: '#4a148c',
  },
  activeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 20px',
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    borderLeft: '4px solid #e91e63',
    fontWeight: 'bold',
    color: '#d81b60',
  },
  button: {
    marginTop: '25px',
    padding: '12px 25px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#8e24aa',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    boxShadow: '0 4px 15px rgba(142, 36, 170, 0.3)',
  }
};

export default PrayerDashboard;
