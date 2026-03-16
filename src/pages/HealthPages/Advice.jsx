import React, { useState, useEffect } from 'react';
import './DailyTimer.css';

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

  const handleAlarmChange = (sectionName, value) => {
    setAlarms({ ...alarms, [sectionName]: value });
  };

  // حساب زوايا العقارب
  const secondsDeg = (time.getSeconds() / 60) * 360;
  const minutesDeg = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360;
  const hoursDeg = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;

  return (
    <div className="timer-page">
      <div className="glass-card">
        <h2 className="title">توقيت الأنشطة اليومي</h2>
        
        {/* الساعة التناظرية */}
        <div className="clock-container">
          <div className="clock-face">
            <div className="hand hour" style={{ transform: `rotate(${hoursDeg}deg)` }}>
              <img src="/assets/fine-hour.png" alt="fine" />
            </div>
            <div className="hand minute" style={{ transform: `rotate(${minutesDeg}deg)` }}>
              <img src="/assets/fine-minute.png" alt="fine" />
            </div>
            <div className="hand second" style={{ transform: `rotate(${secondsDeg}deg)` }}>
              <img src="/assets/fine-second.png" alt="fine" />
            </div>
            <div className="center-pin"></div>
          </div>
        </div>

        <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? 'إغلاق الإعدادات' : 'ضبط منبهات الأنشطة'}
        </button>

        {/* قائمة ضبط المنبهات */}
        {showSettings && (
          <div className="alarms-list">
            {sections.map((section) => (
              <div key={section.id} className="alarm-item">
                <span>{section.icon} {section.name}</span>
                <input 
                  type="time" 
                  onChange={(e) => handleAlarmChange(section.name, e.target.value)}
                  value={alarms[section.name] || ''}
                />
              </div>
            ))}
          </div>
        )}
        
        <button className="back-btn" onClick={() => window.history.back()}>عودة</button>
      </div>
    </div>
  );
};

export default DailyTimer;
