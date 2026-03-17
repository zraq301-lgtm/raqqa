import React, { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { Compass, BookOpen, Clock, Heart, Play, Volume2, VolumeX, MapPin } from 'lucide-react';

const RoqaProApp = () => {
  const [activeTab, setActiveTab] = useState('prayers');
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleOrientation = (e) => {
      const heading = e.webkitCompassHeading || Math.abs(e.alpha - 360);
      setDeviceHeading(heading || 0);
    };
    window.addEventListener('deviceorientation', handleOrientation, true);
    
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const coords = new Coordinates(latitude, longitude);
      const params = CalculationMethod.Egyptian();
      const times = new PrayerTimes(coords, new Date(), params);
      setPrayerTimes(times);
      const qibla = (Math.atan2(Math.sin((39.8262 - longitude) * Math.PI / 180), Math.cos(latitude * Math.PI / 180) * Math.tan(21.4225 * Math.PI / 180) - Math.sin(latitude * Math.PI / 180) * Math.cos((39.8262 - longitude) * Math.PI / 180)) * 180 / Math.PI);
      setQiblaAngle(qibla);
    });

    return () => {
      clearInterval(timer);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const prayerList = [
    { label: 'الفجر', time: prayerTimes?.fajr },
    { label: 'الظهر', time: prayerTimes?.dhuhr },
    { label: 'العصر', time: prayerTimes?.asr },
    { label: 'المغرب', time: prayerTimes?.maghrib },
    { label: 'العشاء', time: prayerTimes?.isha },
  ];

  return (
    <div className="roqa-main-wrapper">
      <style>{`
        .roqa-main-wrapper {
          --primary-pink: #ff4d7d;
          --bg-soft: #fff5f7;
          background: var(--bg-soft);
          min-height: 100vh;
          font-family: 'Tajawal', sans-serif;
          direction: rtl;
          color: #444;
          padding-bottom: 100px;
        }
        /* تصميم الهيدر */
        .roqa-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          border-bottom-left-radius: 30px;
          border-bottom-right-radius: 30px;
          box-shadow: 0 4px 15px rgba(255, 77, 125, 0.05);
        }
        /* ساعة القبلة الكبيرة */
        .qibla-fullscreen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        .qibla-circle {
          width: 280px;
          height: 280px;
          background: white;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px rgba(255, 77, 125, 0.15);
          border: 10px solid white;
        }
        .qibla-needle {
          position: absolute;
          width: 4px;
          height: 100%;
          background: linear-gradient(to top, transparent 50%, var(--primary-pink) 50%);
          transition: transform 0.2s linear;
        }
        .kaaba-icon {
          z-index: 10;
          background: #333;
          color: white;
          padding: 10px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 12px;
        }
        /* جدول المواقيت الرقمي */
        .digital-board {
          background: #2a2a2a;
          border-radius: 30px;
          padding: 20px;
          margin: 20px;
          border: 4px solid #d4a373; /* لون خشبي مثل الصورة */
        }
        .digital-grid {
          display: grid;
          grid-template-cols: repeat(2, 1fr);
          gap: 12px;
        }
        .digital-item {
          background: #1a1a1a;
          padding: 15px;
          border-radius: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #444;
        }
        .digital-label { color: #d4a373; font-weight: bold; font-size: 14px; }
        .digital-time { color: #ff3b3b; font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px rgba(255, 59, 59, 0.5); }
        
        /* أزرار التبديل */
        .tabs-container {
          display: flex;
          gap: 10px;
          padding: 0 20px;
          margin-top: 20px;
        }
        .tab-btn {
          flex: 1;
          padding: 12px;
          border-radius: 15px;
          border: none;
          background: white;
          color: var(--primary-pink);
          font-weight: bold;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .tab-btn.active { background: var(--primary-pink); color: white; }

        /* جداول القرآن والأذكار */
        .data-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 10px;
        }
        .data-row {
          background: white;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .data-cell { padding: 15px; border-radius: 20px; }

        /* المنيو السفلي من App(8).css */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          width: 100%;
          height: 80px;
          background: white;
          display: flex;
          justify-content: space-around;
          align-items: center;
          box-shadow: 0 -5px 20px rgba(255, 77, 125, 0.1);
          border-top-left-radius: 30px;
          border-top-right-radius: 30px;
        }
      `}</style>

      {/* الهيدر */}
      <header className="roqa-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
           <div style={{width: '45px', height: '45px', borderRadius: '50%', background: 'var(--primary-pink)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'white'}}>✨</div>
           <h2 style={{fontSize: '18px', fontWeight: '900', color: 'var(--primary-pink)'}}>رؤاقة</h2>
        </div>
        <button onClick={() => setIsMuted(!isMuted)} style={{background: 'none', border: 'none', color: 'var(--primary-pink)'}}>
          {isMuted ? <VolumeX size={24}/> : <Volume2 size={24}/>}
        </button>
      </header>

      {/* التبديل بين الأقسام */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'prayers' ? 'active' : ''}`} onClick={() => setActiveTab('prayers')}>المواقيت</button>
        <button className={`tab-btn ${activeTab === 'quran' ? 'active' : ''}`} onClick={() => setActiveTab('quran')}>القرآن</button>
        <button className={`tab-btn ${activeTab === 'azkar' ? 'active' : ''}`} onClick={() => setActiveTab('azkar')}>الأذكار</button>
      </div>

      <main>
        {activeTab === 'prayers' && (
          <>
            {/* ساعة القبلة */}
            <div className="qibla-fullscreen">
               <h3 style={{marginBottom: '20px', color: '#666', fontSize: '14px'}}>بوصلة تحديد القبلة</h3>
               <div className="qibla-circle">
                  <div className="qibla-needle" style={{ transform: `rotate(${qiblaAngle - deviceHeading}deg)` }}></div>
                  <div className="kaaba-icon">🕋 الكعبة</div>
               </div>
               <p style={{marginTop: '20px', fontSize: '12px', color: '#999'}}>حرك هاتفك لتتجه الإبرة للأعلى</p>
            </div>

            {/* جدول المواقيت الرقمي */}
            <div className="digital-board">
              <div style={{color: '#d4a373', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold'}}>لوحة مواقيت الصلاة</div>
              <div className="digital-grid">
                {prayerList.map((p, i) => (
                  <div key={i} className="digital-item">
                    <span className="digital-label">{p.label}</span>
                    <span className="digital-time">{p.time?.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) || '--:--'}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'quran' && (
          <div style={{padding: '20px'}}>
            <table className="data-table">
              <tbody>
                {['سورة الفاتحة', 'سورة البقرة', 'سورة آل عمران', 'سورة الكهف'].map((sura, i) => (
                  <tr key={i} className="data-row">
                    <td className="data-cell" style={{fontWeight: 'bold'}}>{sura}</td>
                    <td className="data-cell" style={{textAlign: 'left'}}><Play size={18} color="var(--primary-pink)"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'azkar' && (
          <div style={{padding: '20px'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
              {['أذكار الصباح', 'أذكار المساء', 'أذكار النوم', 'أدعية نبوية'].map((zikr, i) => (
                <div key={i} style={{background: 'white', padding: '25px', borderRadius: '25px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', border: '1px solid #eee'}}>
                   <div style={{fontSize: '24px', marginBottom: '10px'}}>🤲</div>
                   <div style={{fontWeight: 'bold', fontSize: '14px'}}>{zikr}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* المنيو السفلي */}
      <nav className="bottom-nav">
        <Heart size={26} color="#ccc" />
        <div style={{width: '65px', height: '65px', background: 'var(--primary-pink)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-40px', boxShadow: '0 10px 20px rgba(255, 77, 125, 0.3)'}}>
          <Clock size={30} color="white" />
        </div>
        <BookOpen size={26} color="#ccc" />
      </nav>
    </div>
  );
};

export default RoqaProApp;
