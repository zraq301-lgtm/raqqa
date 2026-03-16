import React, { useState, useEffect } from 'react';

const sections = [
  { id: 1, name: 'القياسات الحيوية', icon: '📏' },
  { id: 2, name: 'النشاط البدني', icon: '🏃‍♀️' },
  { id: 3, name: 'التغذية الصحية', icon: '🥗' },
  { id: 4, name: 'الهيدرات والماء', icon: '💧' },
  { id: 5, name: 'جودة النوم', icon: '😴' },
  { id: 6, name: 'الصحة النفسية', icon: '🧠' },
  { id: 7, name: 'المكملات والجمال', icon: '✨' },
  { id: 8, name: 'الهرمونات والدورة', icon: '🩸' },
];

const DailyTimer = () => {
  const [time, setTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [alarms, setAlarms] = useState({});

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // حساب زوايا العقارب
  const secondsDeg = (time.getSeconds() / 60) * 360;
  const minutesDeg = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360;
  const hoursDeg = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;

  // التنسيقات (Styled Objects)
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF0F5 0%, #E6E6FA 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      direction: 'rtl',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    },
    glassCard: {
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '35px',
      padding: '30px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 10px 40px rgba(216, 27, 96, 0.1)',
      textAlign: 'center',
      border: '1px solid rgba(255, 255, 255, 0.4)'
    },
    clockFace: {
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      background: '#fff',
      position: 'relative',
      margin: '0 auto 25px',
      border: '6px solid #F8BBD0',
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
    },
    hand: (deg, width, height, z) => ({
      position: 'absolute',
      bottom: '50%',
      left: '50%',
      transformOrigin: 'bottom center',
      transform: `translateX(-50%) rotate(${deg}deg)`,
      width: `${width}px`,
      height: `${height}px`,
      zIndex: z,
      transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }),
    centerDot: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '12px',
      height: '12px',
      background: '#C2185B',
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10
    },
    button: {
      background: '#D81B60',
      color: 'white',
      border: 'none',
      padding: '12px 30px',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      boxShadow: '0 4px 15px rgba(216, 27, 96, 0.2)',
      marginTop: '15px'
    },
    alarmList: {
      marginTop: '20px',
      maxHeight: '260px',
      overflowY: 'auto',
      padding: '5px'
    },
    alarmItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.8)',
      margin: '8px 0',
      padding: '12px 18px',
      borderRadius: '20px',
      border: '1px solid #FCE4EC'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <h2 style={{ color: '#8E24AA', marginBottom: '20px' }}>توقيت الأنشطة اليومي</h2>
        
        <div style={styles.clockFace}>
          {/* عقرب الساعات */}
          <div style={styles.hand(hoursDeg, 8, 55, 3)}>
            <img src="/assets/fine-hour.png" alt="fine" style={{ width: '100%' }} />
          </div>
          {/* عقرب الدقائق */}
          <div style={styles.hand(minutesDeg, 6, 75, 2)}>
            <img src="/assets/fine-minute.png" alt="fine" style={{ width: '100%' }} />
          </div>
          {/* عقرب الثواني */}
          <div style={styles.hand(secondsDeg, 2, 85, 1)}>
            <img src="/assets/fine-second.png" alt="fine" style={{ width: '100%' }} />
          </div>
          <div style={styles.centerDot}></div>
        </div>

        <button style={styles.button} onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? 'إغلاق الإعدادات' : 'ضبط منبه الأنشطة'}
        </button>

        {showSettings && (
          <div style={styles.alarmList}>
            {sections.map((section) => (
              <div key={section.id} style={styles.alarmItem}>
                <span style={{ fontSize: '14px', color: '#4A148C' }}>{section.icon} {section.name}</span>
                <input 
                  type="time" 
                  style={{ border: '1px solid #F8BBD0', borderRadius: '8px', padding: '3px', color: '#D81B60' }}
                  onChange={(e) => setAlarms({ ...alarms, [section.name]: e.target.value })}
                  value={alarms[section.name] || ''}
                />
              </div>
            ))}
          </div>
        )}
        
        <div style={{ marginTop: '20px' }}>
          <button 
            style={{ ...styles.button, background: '#8E24AA', padding: '8px 20px' }} 
            onClick={() => window.history.back()}
          >
            عودة
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyTimer;
