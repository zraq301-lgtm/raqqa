import React, { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { Compass, Clock, MapPin, Volume2, VolumeX } from 'lucide-react';

const RoqaDigitalPrayer = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false);

  // 1. تفعيل حساسات الهاتف للبوصلة
  useEffect(() => {
    const handleOrientation = (e) => {
      const heading = e.webkitCompassHeading || Math.abs(e.alpha - 360);
      setDeviceHeading(heading || 0);
    };
    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // 2. حساب المواقيت والقبلة
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const coords = new Coordinates(latitude, longitude);
      const params = CalculationMethod.Egyptian();
      const times = new PrayerTimes(coords, new Date(), params);
      setPrayerTimes(times);

      // زاوية القبلة الثابتة لموقعك
      const qibla = (Math.atan2(Math.sin((39.8262 - longitude) * Math.PI / 180), 
        Math.cos(latitude * Math.PI / 180) * Math.tan(21.4225 * Math.PI / 180) - 
        Math.sin(latitude * Math.PI / 180) * Math.cos((39.8262 - longitude) * Math.PI / 180)) * 180 / Math.PI);
      setQiblaAngle(qibla);
    });
    return () => clearInterval(timer);
  }, []);

  const prayers = [
    { label: 'الفجر', time: prayerTimes?.fajr },
    { label: 'الشروق', time: prayerTimes?.sunrise },
    { label: 'الظهر', time: prayerTimes?.dhuhr },
    { label: 'العصر', time: prayerTimes?.asr },
    { label: 'المغرب', time: prayerTimes?.maghrib },
    { label: 'العشاء', time: prayerTimes?.isha },
  ];

  return (
    <div className="min-h-screen bg-[#FFF5F7] p-4 flex flex-col items-center font-serif" dir="rtl">
      
      {/* 1. ساعة القبلة الكبيرة (بوسط الصفحة) */}
      <section className="flex-1 flex flex-col items-center justify-center w-full my-8">
        <h2 className="text-[#FF4D7D] font-bold mb-6 flex items-center gap-2 text-xl">
          <Compass size={24} /> اتجاه القبلة الآن
        </h2>
        
        <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full bg-white shadow-[0_20px_50px_rgba(255,77,125,0.15)] border-[12px] border-white flex items-center justify-center">
          {/* تدريج البوصلة الخارجي */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-rose-100 animate-[spin_60s_linear_infinite]"></div>
          
          {/* إبرة القبلة - تتحرك مع دوران الهاتف */}
          <div 
            className="absolute w-full h-full flex items-center justify-center transition-transform duration-150 ease-linear"
            style={{ transform: `rotate(${qiblaAngle - deviceHeading}deg)` }}
          >
            <div className="relative h-[85%] flex flex-col items-center">
              {/* رأس الإبرة (المثلث) */}
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[40px] border-b-[#FF4D7D] drop-shadow-md"></div>
              {/* جسم الإبرة */}
              <div className="w-1.5 h-full bg-gradient-to-b from-[#FF4D7D] to-rose-50"></div>
            </div>
          </div>

          {/* قلب البوصلة */}
          <div className="z-10 w-20 h-20 bg-white rounded-full shadow-inner border border-rose-100 flex items-center justify-center">
             <div className="text-[#FF4D7D] font-black text-xs tracking-tighter text-center">
                🕋<br/>KAABA
             </div>
          </div>
        </div>
        <p className="mt-6 text-rose-300 text-xs font-bold animate-pulse">قم بتدوير الهاتف ليتحرك المؤشر نحو الأعلى</p>
      </section>

      {/* 2. كارت المواقيت الرقمي (محاكاة للصورة) */}
      <div className="w-full max-w-md bg-[#FDF5E6] rounded-3xl border-[6px] border-[#D4A373] shadow-2xl p-4 overflow-hidden">
        {/* هيدر الكارت (التاريخ والمدينة) */}
        <div className="flex justify-between items-center bg-[#222] p-3 rounded-xl mb-4 text-red-500 font-mono text-lg border-b-2 border-red-900 shadow-inner">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase">Current Time</span>
            <span>{currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <div className="text-center">
             <div className="text-[10px] text-gray-500">رمضان ١٤٤٧</div>
             <div className="text-sm">القاهرة</div>
          </div>
          <button onClick={() => setIsMuted(!isMuted)} className="text-red-500">
            {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
          </button>
        </div>

        {/* شبكة المواقيت - كما في الصورة بالضبط */}
        <div className="grid grid-cols-3 gap-2">
          {prayers.map((prayer, idx) => (
            <div key={idx} className="bg-[#E9DCC9] border border-[#BC8F8F] rounded-lg p-2 flex flex-col items-center shadow-sm">
              <span className="text-[14px] font-bold text-[#5D4037] mb-1">{prayer.label}</span>
              {/* الخانة الرقمية السوداء */}
              <div className="w-full bg-black rounded-md py-1 px-2 text-center">
                <span className="text-red-600 font-mono text-xl font-bold leading-none tracking-widest shadow-red-500/50">
                  {prayer.time ? prayer.time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* تذييل الكارت */}
        <div className="mt-4 flex justify-between items-center px-2">
           <div className="flex items-center gap-1 text-[#8B4513] font-bold text-xs">
              <Clock size={14}/> الإقامة: <span className="text-red-700">05 min</span>
           </div>
           <div className="text-[#8B4513] font-bold text-sm italic">الله أكبر</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        /* تأثير الخط الرقمي */
        .font-mono {
          font-family: 'Courier New', Courier, monospace;
          text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default RoqaDigitalPrayer;
