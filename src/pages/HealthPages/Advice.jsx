import React, { useState, useEffect, useRef } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { Compass, BookOpen, Heart, Clock, MapPin, Volume2, VolumeX, Play, Search, Moon, Sun } from 'lucide-react';

const RoqaCompleteApp = () => {
  const [activeTab, setActiveTab] = useState('prayers');
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // 1. تحديث الوقت وحساب المواقيت والقبلة
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // الحصول على الموقع
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = new Coordinates(latitude, longitude);
        const params = CalculationMethod.Egyptian();
        const times = new PrayerTimes(coords, new Date(), params);
        setPrayerTimes(times);

        // حساب زاوية القبلة الثابتة
        const qibla = (Math.atan2(Math.sin((39.8262 - longitude) * Math.PI / 180), 
          Math.cos(latitude * Math.PI / 180) * Math.tan(21.4225 * Math.PI / 180) - 
          Math.sin(latitude * Math.PI / 180) * Math.cos((39.8262 - longitude) * Math.PI / 180)) * 180 / Math.PI);
        setQiblaAngle(qibla);
      },
      (err) => console.error("Location Error:", err)
    );

    // تفعيل الحساسات
    const handleOrientation = (e) => {
      const heading = e.webkitCompassHeading || Math.abs(e.alpha - 360);
      setDeviceHeading(heading || 0);
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      clearInterval(timer);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const prayerItems = [
    { name: 'الفجر', time: prayerTimes?.fajr, icon: <Moon size={18}/> },
    { name: 'الظهر', time: prayerTimes?.dhuhr, icon: <Sun size={18}/> },
    { name: 'العصر', time: prayerTimes?.asr, icon: <Sun size={18}/> },
    { name: 'المغرب', time: prayerTimes?.maghrib, icon: <Moon size={18}/> },
    { name: 'العشاء', time: prayerTimes?.isha, icon: <Moon size={18}/> },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans overflow-x-hidden pb-28" dir="rtl">
      {/* مشغل صوت الأذان - تأكد من وجود الملف في Assets */}
      <audio ref={audioRef} src="/src/assets/azan.mp3" preload="auto" />

      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF4D7D] to-[#9b59b6] shadow-lg shadow-pink-500/20"></div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">رؤاقة</h1>
            <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
              <MapPin size={10} /> Cairo, EG
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
        >
          {isMuted ? <VolumeX size={18} className="text-rose-500"/> : <Volume2 size={18} className="text-emerald-400"/>}
        </button>
      </header>

      {/* Main Tabs UI مستوحى من دريبل */}
      <div className="px-6 mb-8">
        <div className="flex bg-[#161616] p-1 rounded-2xl border border-white/5">
          <button onClick={() => setActiveTab('prayers')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'prayers' ? 'bg-[#FF4D7D] text-white' : 'text-gray-500'}`}>المواقيت</button>
          <button onClick={() => setActiveTab('quran')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'quran' ? 'bg-[#FF4D7D] text-white' : 'text-gray-500'}`}>القرآن</button>
          <button onClick={() => setActiveTab('azkar')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'azkar' ? 'bg-[#FF4D7D] text-white' : 'text-gray-500'}`}>الأذكار</button>
        </div>
      </div>

      <main className="px-6">
        {/* قسم المواقيت والقبلة */}
        {activeTab === 'prayers' && (
          <div className="space-y-6 animate-in fade-in duration-700">
            {/* القبلة العصرية */}
            <div className="relative bg-[#111111] rounded-[45px] p-10 border border-white/5 flex flex-col items-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-dashed border-white/10"></div>
                {/* إبرة القبلة الذكية */}
                <div 
                  className="absolute w-full h-full flex items-center justify-center transition-transform duration-300"
                  style={{ transform: `rotate(${qiblaAngle - deviceHeading}deg)` }}
                >
                  <div className="h-1/2 w-1 bg-[#FF4D7D] rounded-full shadow-[0_0_15px_#FF4D7D] relative">
                    <div className="absolute -top-1 -left-1.5 w-4 h-4 bg-[#FF4D7D] rounded-full shadow-lg"></div>
                  </div>
                </div>
                {/* الساعة الرقمية في مركز البوصلة */}
                <div className="z-10 text-2xl font-black text-white bg-[#0A0A0A] w-28 h-28 rounded-full flex items-center justify-center shadow-2xl border border-white/5">
                  {currentTime.getHours()}:{currentTime.getMinutes() < 10 ? '0'+currentTime.getMinutes() : currentTime.getMinutes()}
                </div>
              </div>
              <p className="mt-8 text-gray-500 text-[10px] font-bold tracking-[0.3em] uppercase">اتجاه القبلة</p>
            </div>

            {/* قائمة المواقيت */}
            <div className="space-y-3">
              {prayerItems.map((p, idx) => (
                <div key={idx} className="bg-[#161616] p-5 rounded-[28px] border border-white/5 flex justify-between items-center group active:scale-95 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[#FF4D7D] group-hover:bg-[#FF4D7D] group-hover:text-white transition-colors">
                      {p.icon}
                    </div>
                    <span className="font-bold text-gray-200">{p.name}</span>
                  </div>
                  <span className="text-lg font-mono font-bold tracking-tighter">
                    {p.time ? p.time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* قسم القرآن */}
        {activeTab === 'quran' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-900/10 p-6 rounded-[35px] border border-emerald-500/10">
              <h3 className="font-bold text-lg mb-1">القرآن الكريم</h3>
              <p className="text-emerald-400 text-xs">وردك اليومي: سورة الكهف</p>
            </div>
            <div className="space-y-2">
              {['الفاتحة', 'البقرة', 'آل عمران', 'النساء'].map((sura, i) => (
                <div key={i} className="p-5 bg-[#161616] rounded-3xl border border-white/5 flex justify-between items-center">
                  <span className="font-bold text-gray-300 italic">٠{i+1} - {sura}</span>
                  <Play size={16} className="text-emerald-500 fill-emerald-500"/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* قسم الأذكار */}
        {activeTab === 'azkar' && (
          <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95 duration-500">
             {[
               {t: 'أذكار الصباح', i: '☀️', c: 'from-orange-500/20'},
               {t: 'أذكار المساء', i: '🌙', c: 'from-indigo-500/20'},
               {t: 'أذكار النوم', i: '🛌', c: 'from-purple-500/20'},
               {t: 'أدعية متنوعة', i: '🤲', c: 'from-rose-500/20'}
             ].map((z, i) => (
               <div key={i} className={`bg-gradient-to-br ${z.c} to-transparent p-6 rounded-[35px] border border-white/5 flex flex-col gap-4`}>
                 <span className="text-2xl">{z.i}</span>
                 <span className="font-bold text-sm">{z.t}</span>
               </div>
             ))}
          </div>
        )}
      </main>

      {/* المنيو السفلي العصري */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-[#0F0F0F]/80 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center px-10 z-[100]">
        <Heart className="text-gray-600" size={24} />
        <div className="w-14 h-14 bg-[#FF4D7D] rounded-2xl flex items-center justify-center -mt-10 shadow-2xl shadow-pink-500/40 border-4 border-[#0A0A0A]">
          <Clock className="text-white" size={26} />
        </div>
        <BookOpen className="text-gray-600" size={24} />
      </nav>
    </div>
  );
};

export default RoqaCompleteApp;
