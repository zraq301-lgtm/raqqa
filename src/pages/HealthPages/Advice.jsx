import React, { useState, useEffect, useRef } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { Compass, BookOpen, Heart, Clock, MapPin, Volume2, VolumeX, Play, Search } from 'lucide-react';

const RoqaUltimateApp = () => {
  const [activeTab, setActiveTab] = useState('prayers'); // prayers, quran, azkar
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // تحديث الحساسات والبيانات
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

  const prayerItems = [
    { name: 'الفجر', time: prayerTimes?.fajr, icon: '🌙' },
    { name: 'الظهر', time: prayerTimes?.dhuhr, icon: '☀️' },
    { name: 'العصر', time: prayerTimes?.asr, icon: '🌤️' },
    { name: 'المغرب', time: prayerTimes?.maghrib, icon: '🌅' },
    { name: 'العشاء', time: prayerTimes?.isha, icon: <Moon size={16}/> },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-sans p-5 pb-24" dir="rtl">
      <audio ref={audioRef} src="/src/assets/azan.mp3" />

      {/* الهيدر العلوي الذكي */}
      <header className="flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4D7D] to-[#9b59b6] flex items-center justify-center shadow-lg shadow-rose-900/20">
            <span className="text-xl">✨</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">رؤاقة</h1>
            <p className="text-[10px] text-gray-500 flex items-center gap-1"><MapPin size={10}/> القاهرة، مصر</p>
          </div>
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-3 rounded-full bg-white/5 border border-white/10">
          {isMuted ? <VolumeX size={20} className="text-rose-500"/> : <Volume2 size={20} className="text-emerald-400"/>}
        </button>
      </header>

      {/* التبويبات الرئيسية (Tabs) */}
      <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5">
        {['prayers', 'quran', 'azkar'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? 'bg-[#FF4D7D] shadow-lg shadow-rose-500/20 text-white' : 'text-gray-500'}`}
          >
            {tab === 'prayers' ? 'المواقيت' : tab === 'quran' ? 'القرآن' : 'الأذكار'}
          </button>
        ))}
      </div>

      {/* محتوى المواقيت والقبلة */}
      {activeTab === 'prayers' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* كارت القبلة العصري */}
          <div className="relative bg-gradient-to-b from-white/5 to-transparent rounded-[40px] p-8 border border-white/5 flex flex-col items-center">
            <div className="absolute top-4 right-6 text-[10px] font-black text-[#FF4D7D] tracking-widest">QIBLA</div>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/10"></div>
              <div 
                className="absolute w-full h-full flex items-center justify-center transition-transform duration-300"
                style={{ transform: `rotate(${qiblaAngle - deviceHeading}deg)` }}
              >
                <div className="h-full w-1 bg-gradient-to-t from-transparent via-[#FF4D7D] to-[#FF4D7D] rounded-full"></div>
                <div className="absolute top-0 w-4 h-4 bg-[#FF4D7D] rounded-full shadow-[0_0_15px_#FF4D7D]"></div>
              </div>
              <div className="z-10 bg-[#1A1A1A] w-24 h-24 rounded-full flex flex-col items-center justify-center border border-white/10 shadow-2xl">
                <span className="text-3xl font-black">{currentTime.getHours()}:{currentTime.getMinutes()}</span>
              </div>
            </div>
            <p className="mt-6 text-gray-500 text-[10px] font-medium uppercase tracking-[0.2em]">وجه الهاتف نحو العلامة المضيئة</p>
          </div>

          {/* قائمة الصلوات (مستوحاة من Dribbble) */}
          <div className="grid grid-cols-1 gap-3">
            {prayerItems.map((p, i) => (
              <div key={i} className="group bg-white/5 hover:bg-white/10 p-5 rounded-[28px] border border-white/5 transition-all flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform">{p.icon}</div>
                  <span className="font-bold text-gray-300">{p.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-mono font-bold text-white tracking-tighter">
                    {p.time?.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#FF4D7D] transition-colors"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* محتوى القرآن الكريم */}
      {activeTab === 'quran' && (
        <div className="space-y-4 animate-in slide-in-from-left duration-500">
          <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-6 rounded-[35px] border border-emerald-500/10 mb-6">
            <h3 className="text-xl font-bold mb-2">آخر ما قرأت</h3>
            <p className="text-emerald-400 text-sm font-medium">سورة الكهف - الآية ١٥</p>
          </div>
          <div className="space-y-2">
            {['سورة الفاتحة', 'سورة البقرة', 'سورة آل عمران', 'سورة النساء'].map((sura, i) => (
              <div key={i} className="flex justify-between items-center p-5 bg-white/5 rounded-[25px] border border-white/5">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-500">{i+1}</span>
                  <span className="font-bold">{sura}</span>
                </div>
                <Play size={18} className="text-emerald-400"/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* محتوى الأذكار والأدعية */}
      {activeTab === 'azkar' && (
        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-right duration-500">
          {[
            { t: 'أذكار الصباح', c: 'bg-orange-500/10', i: '🌅' },
            { t: 'أذكار المساء', c: 'bg-indigo-500/10', i: '🌙' },
            { t: 'أذكار النوم', c: 'bg-purple-500/10', i: '🛌' },
            { t: 'أدعية نبوية', c: 'bg-rose-500/10', i: '🤲' }
          ].map((zikr, i) => (
            <div key={i} className={`${zikr.c} p-6 rounded-[35px] border border-white/5 flex flex-col gap-3 items-start`}>
              <span className="text-2xl">{zikr.i}</span>
              <span className="font-bold text-sm">{zikr.t}</span>
            </div>
          ))}
        </div>
      )}

      {/* المنيو السفلي الاحترافي */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#1A1A1A]/80 backdrop-blur-xl border-t border-white/5 px-8 flex justify-between items-center">
        <Heart size={24} className="text-gray-600 hover:text-[#FF4D7D] transition-colors cursor-pointer" />
        <div className="w-14 h-14 bg-[#FF4D7D] rounded-2xl flex items-center justify-center -mt-10 shadow-xl shadow-rose-500/30 border-4 border-[#0F0F0F]">
          <Clock className="text-white" size={28} />
        </div>
        <BookOpen size={24} className="text-gray-600 hover:text-emerald-400 transition-colors cursor-pointer" />
      </nav>
    </div>
  );
};

export default RoqaUltimateApp;
