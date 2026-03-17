import React, { useState, useEffect, useRef } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { Compass, Clock, MapPin, Volume2, VolumeX, ChevronRight } from 'lucide-react';

const RoqaLuxuryPrayer = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // تحديث الحساسات والوقت
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

  const prayers = [
    { label: 'الفجر', time: prayerTimes?.fajr },
    { label: 'الظهر', time: prayerTimes?.dhuhr },
    { label: 'العصر', time: prayerTimes?.asr },
    { label: 'المغرب', time: prayerTimes?.maghrib },
    { label: 'العشاء', time: prayerTimes?.isha },
  ];

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center p-4 font-sans overflow-hidden" dir="rtl">
      <audio ref={audioRef} src="/src/assets/azan.mp3" />

      {/* الجزء العلوي: بوصلة القبلة الفاخرة */}
      <div className="w-full flex flex-col items-center pt-8 pb-12">
        <h1 className="text-2xl font-black text-[#4A148C] mb-8 tracking-tighter flex items-center gap-3">
          <Compass className="text-[#FF4D7D] animate-pulse" size={28} />
          اتجاه القبلة الآن
        </h1>

        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* حلقات البوصلة الديكورية */}
          <div className="absolute inset-0 rounded-full border-[1px] border-[#FF4D7D]/20 animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute inset-4 rounded-full border-[10px] border-white shadow-2xl"></div>
          
          {/* مؤشر القبلة الذكي */}
          <div 
            className="absolute w-full h-full flex items-center justify-center transition-transform duration-200"
            style={{ transform: `rotate(${qiblaAngle - deviceHeading}deg)` }}
          >
            <div className="relative h-full w-full flex flex-col items-center pt-8">
               <div className="w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center border border-[#FF4D7D]/20 z-20">
                  <span className="text-2xl">🕋</span>
               </div>
               <div className="w-[4px] h-[140px] bg-gradient-to-b from-[#FF4D7D] via-[#FF4D7D]/50 to-transparent rounded-full -mt-2"></div>
            </div>
          </div>

          {/* الساعة المركزية */}
          <div className="z-10 bg-white/80 backdrop-blur-md w-40 h-40 rounded-full shadow-inner flex flex-col items-center justify-center border border-white">
            <span className="text-3xl font-black text-[#4A148C] tabular-nums">
              {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] font-bold text-[#FF4D7D] tracking-widest mt-1 uppercase">Live Tracker</span>
          </div>
        </div>
      </div>

      {/* لوحة المواقيت الرقمية (Digital Segment Board) */}
      <div className="w-full max-w-md bg-[#2D2D2D] rounded-[40px] p-6 shadow-2xl border-[8px] border-[#1A1A1A] relative overflow-hidden">
        {/* توهج خلفي */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-600/20 blur-[80px]"></div>

        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex flex-col">
            <span className="text-red-500 font-mono text-xs font-bold tracking-tighter italic">HIJRI 1447</span>
            <span className="text-gray-400 text-[10px] font-bold">القاهرة، مصر</span>
          </div>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 bg-white/5 rounded-full text-red-500 border border-white/10">
            {isMuted ? <VolumeX size={18}/> : <Volume2 size={18}/>}
          </button>
        </div>

        {/* شبكة المواقيت بنمط الساعة الرقمية المضيئة */}
        <div className="grid grid-cols-1 gap-3">
          {prayers.map((prayer, index) => (
            <div key={index} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 group hover:border-red-500/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_#ef4444]"></div>
                <span className="text-gray-300 font-bold text-lg">{prayer.label}</span>
              </div>
              <div className="font-mono text-2xl text-red-600 font-black tracking-widest drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">
                {prayer.time ? prayer.time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "00:00"}
              </div>
            </div>
          ))}
        </div>

        {/* كلمة الله أكبر في الأسفل */}
        <div className="mt-6 text-center border-t border-white/10 pt-4">
          <span className="text-red-900/50 font-serif text-2xl italic tracking-[0.2em]">ALLAHU AKBAR</span>
        </div>
      </div>

      <button className="mt-8 flex items-center gap-2 text-[#4A148C] font-bold text-sm bg-white px-6 py-3 rounded-full shadow-lg active:scale-95 transition-all">
        <ChevronRight size={18} /> العودة للرئيسية
      </button>
    </div>
  );
};

export default RoqaLuxuryPrayer;
