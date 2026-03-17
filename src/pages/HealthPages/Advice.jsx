import React, { useState, useEffect, useRef } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes, AdhanError } from 'adhan';
import { Moon, Sun, Compass, Volume2, VolumeX, MapPin, Clock, ArrowLeftRight } from 'lucide-react';

const RoqaPrayerPro = () => {
  const [coords, setCoords] = useState({ latitude: 30.0444, longitude: 31.2357 }); 
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState({ name: '', time: null, countdown: '' });
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const audioRef = useRef(null);

  // 1. تحديث الوقت والعد التنازلي والتحقق من الأذان
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      if (prayerTimes) {
        updateCountdown(now);
        checkAndPlayAzan(now);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [prayerTimes, isMuted]);

  // 2. جلب الموقع وتحديث البيانات
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        initPrayerData(latitude, longitude);
      },
      () => initPrayerData(coords.latitude, coords.longitude)
    );
  }, []);

  const initPrayerData = (lat, lng) => {
    const coordinates = new Coordinates(lat, lng);
    const params = CalculationMethod.Egyptian(); 
    const times = new PrayerTimes(coordinates, new Date(), params);
    setPrayerTimes(times);

    // حساب القبلة
    const qibla = (Math.atan2(Math.sin((39.8262 - lng) * Math.PI / 180), 
      Math.cos(lat * Math.PI / 180) * Math.tan(21.4225 * Math.PI / 180) - 
      Math.sin(lat * Math.PI / 180) * Math.cos((39.8262 - lng) * Math.PI / 180)) * 180 / Math.PI);
    setQiblaDirection(qibla);
  };

  // 3. دالة حساب العد التنازلي للصلاة القادمة
  const updateCountdown = (now) => {
    const next = prayerTimes.nextPrayer();
    const nextTime = prayerTimes.timeForPrayer(next);
    
    if (nextTime) {
      const diff = nextTime - now;
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      const namesAR = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء', sunrise: 'الشروق' };
      setNextPrayer({
        name: namesAR[next] || 'الصلاة القادمة',
        time: nextTime,
        countdown: `${hours}:${minutes < 10 ? '0'+minutes : minutes}:${seconds < 10 ? '0'+seconds : seconds}`
      });
    }
  };

  const checkAndPlayAzan = (now) => {
    if (!prayerTimes || isMuted) return;
    const currentHM = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const prayers = [prayerTimes.fajr, prayerTimes.dhuhr, prayerTimes.asr, prayerTimes.maghrib, prayerTimes.isha];
    
    prayers.forEach(p => {
      if (p.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) === currentHM && now.getSeconds() === 0) {
        audioRef.current.play();
      }
    });
  };

  const prayerList = [
    { id: 'fajr', label: 'الفجر', time: prayerTimes?.fajr, icon: <Moon size={18}/> },
    { id: 'dhuhr', label: 'الظهر', time: prayerTimes?.dhuhr, icon: <Sun size={18}/> },
    { id: 'asr', label: 'العصر', time: prayerTimes?.asr, icon: <Sun size={18}/> },
    { id: 'maghrib', label: 'المغرب', time: prayerTimes?.maghrib, icon: <Moon size={18}/> },
    { id: 'isha', label: 'العشاء', time: prayerTimes?.isha, icon: <Moon size={18}/> },
  ];

  return (
    <div className="min-h-screen bg-[#FFF0F5] font-sans p-4 flex flex-col items-center">
      <audio ref={audioRef} src="/src/assets/azan.mp3" />

      {/* الجزء العلوي: العد التنازلي - التصميم الاحترافي */}
      <div className="w-full max-w-md mt-4 mb-8 relative overflow-hidden bg-gradient-to-br from-[#7C4DFF] to-[#FF4081] rounded-[35px] p-6 shadow-2xl text-white">
        <div className="flex justify-between items-start z-10 relative">
          <div>
            <p className="text-rose-100 text-sm font-medium mb-1">متبقي على صلاة {nextPrayer.name}</p>
            <h2 className="text-4xl font-black tracking-tighter tabular-nums">{nextPrayer.countdown}</h2>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
            <Clock className="animate-pulse" />
          </div>
        </div>
        
        {/* شريط التقدم النحيف */}
        <div className="w-full h-1.5 bg-white/20 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-white animate-[progress_2s_ease-in-out_infinite]" style={{ width: '45%' }}></div>
        </div>

        {/* دوائر ديكورية خلفية */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* الساعة الحالية بتصميم Rose */}
      <div className="mb-6 text-center">
        <h1 className="text-5xl font-extralight text-violet-900 tracking-widest">
          {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2 text-rose-400 font-bold">
           <MapPin size={14} /> القاهرة الآن
        </div>
      </div>

      {/* قائمة المواقيت بأسلوب Glassmorphism ناعم */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white rounded-[40px] p-6 shadow-xl space-y-2">
        {prayerList.map((p) => {
          const isNext = nextPrayer.name === p.label;
          return (
            <div key={p.id} className={`flex justify-between items-center p-4 rounded-3xl transition-all ${isNext ? 'bg-rose-50 border-rose-100 border scale-[1.02] shadow-sm' : 'hover:bg-white/50'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${isNext ? 'bg-rose-500 text-white' : 'bg-violet-50 text-violet-400'}`}>
                  {p.icon}
                </div>
                <span className={`text-lg font-bold ${isNext ? 'text-rose-600' : 'text-violet-900'}`}>{p.label}</span>
              </div>
              <div className="text-right">
                <span className={`text-xl font-medium ${isNext ? 'text-rose-500' : 'text-violet-700'}`}>
                  {p.time?.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isNext && <div className="text-[10px] text-rose-400 font-bold animate-bounce mt-1">القادمة</div>}
              </div>
            </div>
          );
        })}

        {/* قسم البوصلة الاحترافية */}
        <div className="mt-8 p-6 bg-gradient-to-b from-white/30 to-transparent rounded-[35px] border-t border-white flex flex-col items-center">
          <div className="text-xs font-black text-violet-300 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <ArrowLeftRight size={14} /> QIBLA FINDER
          </div>
          
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* درجات البوصلة */}
            <div className="absolute inset-0 border-[1px] border-violet-100 rounded-full"></div>
            
            {/* الإبرة المصممة بشكل جمالي */}
            <div 
              className="absolute w-full h-full flex items-center justify-center transition-transform duration-1000 ease-out"
              style={{ transform: `rotate(${qiblaDirection}deg)` }}
            >
              <div className="relative h-36 flex flex-col items-center justify-between">
                <div className="w-4 h-4 bg-rose-600 rotate-45 rounded-sm shadow-lg shadow-rose-300"></div>
                <div className="w-[2px] h-full bg-gradient-to-b from-rose-500 via-rose-200 to-transparent"></div>
              </div>
            </div>
            
            {/* الكعبة المشرفة في المركز (أيقونة رمزية) */}
            <div className="w-12 h-12 bg-violet-900 rounded-2xl shadow-xl flex items-center justify-center z-10 border-4 border-white">
              <div className="w-6 h-[2px] bg-yellow-400 absolute top-4"></div>
              <div className="text-[10px] text-white font-bold">KABAA</div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="mt-8 px-8 py-3 rounded-full bg-white shadow-lg shadow-rose-100 text-violet-600 font-bold text-sm flex items-center gap-3 active:scale-95 transition-transform"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            {isMuted ? 'تفعيل صوت الأذان' : 'الأذان مفعّل'}
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-violet-300 text-[10px] font-medium tracking-widest uppercase pb-10">Powered by Roqa AI Core</p>
    </div>
  );
};

export default RoqaPrayerPro;
