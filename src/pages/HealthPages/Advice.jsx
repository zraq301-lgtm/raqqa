import React, { useState, useEffect, useRef } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { Moon, Sun, Compass, Volume2, VolumeX, Clock, MapPin, X } from 'lucide-react';

const RoqaPrayerDashboard = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // 1. تفعيل حساسات الهاتف للقبلة (Device Orientation)
  useEffect(() => {
    const handleOrientation = (e) => {
      // compassHeading هو اتجاه الهاتف بالنسبة للشمال المغناطيسي
      const heading = e.webkitCompassHeading || Math.abs(e.alpha - 360);
      setDeviceHeading(heading);
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // 2. تحديث الوقت وحساب المواقيت
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const coords = new Coordinates(latitude, longitude);
      const params = CalculationMethod.Egyptian();
      const times = new PrayerTimes(coords, new Date(), params);
      setPrayerTimes(times);

      // حساب زاوية القبلة الثابتة للموقع
      const qibla = (Math.atan2(Math.sin((39.8262 - longitude) * Math.PI / 180), 
        Math.cos(latitude * Math.PI / 180) * Math.tan(21.4225 * Math.PI / 180) - 
        Math.sin(latitude * Math.PI / 180) * Math.cos((39.8262 - longitude) * Math.PI / 180)) * 180 / Math.PI);
      setQiblaDirection(qibla);
    });

    return () => clearInterval(timer);
  }, []);

  // حساب الانحراف المطلوب للإبرة (زاوية القبلة - اتجاه الهاتف الحالي)
  const finalCompassRotation = qiblaDirection - deviceHeading;

  const prayers = [
    { name: 'الفجر', time: prayerTimes?.fajr, icon: <Moon size={18}/> },
    { name: 'الظهر', time: prayerTimes?.dhuhr, icon: <Sun size={18}/> },
    { name: 'العصر', time: prayerTimes?.asr, icon: <Sun size={18}/> },
    { name: 'المغرب', time: prayerTimes?.maghrib, icon: <Moon size={18}/> },
    { name: 'العشاء', time: prayerTimes?.isha, icon: <Moon size={18}/> },
  ];

  return (
    <div className="app-container" style={{ background: 'var(--soft-bg)' }}>
      <audio ref={audioRef} src="/src/assets/azan.mp3" />

      {/* الهيدر العلوي باستخدام كلاسات CSS الخاصة بك */}
      <div className="top-sticky-menu">
        <div className="top-cards-container">
          <div className="top-card" onClick={() => setIsModalOpen(true)} style={{ cursor: 'pointer' }}>
            <div className="card-text">
              <span className="card-label">عرض المواقيت</span>
            </div>
            <Clock className="bold" size={24} />
          </div>
        </div>
      </div>

      <main className="main-content flex flex-col items-center justify-center">
        {/* ساعة القبلة الأنيقة - التصميم الأنثوي */}
        <div className="relative flex flex-col items-center">
          <div className="text-4xl font-bold mb-8 text-[#ff4d7d] tracking-widest">
            {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </div>

          {/* جسم البوصلة */}
          <div className="relative w-64 h-64 rounded-full bg-white shadow-2xl border-4 border-[#ff4d7d]/20 flex items-center justify-center">
            {/* درجات الدائرة */}
            <div className="absolute inset-4 border border-dashed border-[#ff4d7d]/10 rounded-full animate-spin-slow"></div>
            
            {/* إبرة القبلة المتحركة بناءً على حركة الهاتف */}
            <div 
              className="absolute w-full h-full flex items-center justify-center transition-transform duration-200 ease-linear"
              style={{ transform: `rotate(${finalCompassRotation}deg)` }}
            >
              <div className="flex flex-col items-center">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[30px] border-b-[#ff4d7d]"></div>
                <div className="w-1.5 h-32 bg-gradient-to-b from-[#ff4d7d] to-transparent rounded-full -mt-2"></div>
              </div>
            </div>

            {/* مركز الساعة */}
            <div className="z-10 bg-white p-4 rounded-full shadow-lg border border-[#ff4d7d]/20 text-[#ff4d7d]">
               <Compass size={32} />
            </div>
            
            <div className="absolute bottom-6 text-[10px] font-bold text-[#ff4d7d] tracking-widest uppercase">Qibla Finder</div>
          </div>
          
          <p className="mt-6 text-sm text-[#555] font-medium animate-pulse">حرك الهاتف لتحديد الاتجاه بدقة</p>
        </div>
      </main>

      {/* مودال جدول المواقيت المنبثق */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-white rounded-t-[40px] p-8 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#ff4d7d]">مواقيت الصلاة اليوم</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-pink-50 rounded-full text-[#ff4d7d]">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {prayers.map((p, index) => (
                <div key={index} className="flex justify-between items-center p-4 rounded-2xl bg-[#fff5f7] border border-[#ff4d7d]/10">
                  <div className="flex items-center gap-3">
                    <span className="text-[#ff4d7d]">{p.icon}</span>
                    <span className="font-bold text-[#555]">{p.name}</span>
                  </div>
                  <span className="text-lg font-medium text-[#9b59b6]">
                    {p.time?.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="w-full mt-6 py-4 rounded-2xl bg-[#ff4d7d] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-200"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              {isMuted ? 'تفعيل صوت الأذان' : 'الأذان مفعّل تلقائياً'}
            </button>
          </div>
        </div>
      )}

      {/* المنيو السفلي الخاص بك (للحفاظ على الهيكل) */}
      <nav className="bottom-sticky-menu">
        <div className="nav-grid">
          <a href="#" className="nav-item">
            <div className="custom-img-icon-nav flex items-center justify-center text-[#ff4d7d]"><Compass /></div>
            <span className="nav-label">القبلة</span>
          </a>
          <div className="center-action">
            <div className="center-circle">
               <div className="custom-img-icon-main bg-[#ff4d7d] flex items-center justify-center text-white"><Clock size={40}/></div>
            </div>
          </div>
          <a href="#" className="nav-item" onClick={() => setIsModalOpen(true)}>
            <div className="custom-img-icon-nav flex items-center justify-center text-[#ff4d7d]"><Clock /></div>
            <span className="nav-label">المواقيت</span>
          </a>
        </div>
      </nav>
    </div>
  );
};

export default RoqaPrayerDashboard;
