import React, { useState, useEffect, useRef } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes, Qibla } from 'adhan';
import { DateTime } from 'luxon';
import { motion, AnimatePresence } from 'framer-motion';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Compass, Bell, BellOff, MapPin, Play, Square, Settings } from 'lucide-react';
import clsx from 'clsx';

// تنسيق الوقت
const formatTime = (time) => DateTime.fromJSDate(time).toLocaleString(DateTime.TIME_SIMPLE);

const PrayerClock = ({ rotation, kabaImg }) => (
  <div className="relative flex justify-center my-10 group">
    <div className="w-56 h-56 rounded-full border-4 border-[#e91e63]/30 flex items-center justify-center relative shadow-inner bg-white/20 backdrop-blur-sm transition-all group-hover:border-[#e91e63]/60">
      
      {/* مؤشر القبلة: صورة الكعبة */}
      <motion.div 
        style={{ rotate: -rotation }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }}
        className="w-40 h-40 origin-center"
      >
        <img src={kabaImg} alt="Qibla" className="w-full h-full object-contain" />
      </motion.div>
      
      {/* علامة القبلة */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#e91e63] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md z-10 flex gap-1 items-center">
        <Compass className="w-4 h-4" /> القبلة
      </div>

      {/* بوصلة "ساعة" وهمية حولها */}
      <div className="absolute inset-2 rounded-full border border-dashed border-[#ba68c8]/30"></div>
    </div>
  </div>
);

const PrayerCard = ({ id, label, time, isNext }) => (
  <motion.div
    whileHover={{ x: 5 }}
    className={clsx(
      "flex justify-between items-center p-5 rounded-3xl transition-all shadow-sm border",
      isNext 
        ? "bg-gradient-to-r from-[#8e24aa] to-[#d81b60] text-white shadow-lg border-transparent scale-105" 
        : "bg-white/50 text-[#4a148c] border-[#ba68c8]/10 hover:bg-white/70"
    )}
  >
    <div className="flex flex-col gap-0.5">
      <span className="font-bold text-lg">{label}</span>
      <span className="text-xs opacity-70">أذان {label}</span>
    </div>
    <span className="text-2xl font-mono font-black text-right">{formatTime(time)}</span>
  </motion.div>
);

const AlAsilPrayerPage = () => {
  const [coords, setCoords] = useState(null);
  const [prayerData, setPrayerData] = useState(null);
  const [qiblaRotation, setQiblaRotation] = useState(0);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [isAzanPlaying, setIsAzanPlaying] = useState(false);
  
  const audioRef = useRef(new Audio('/assets/azan.mp3'));
  const kabaImg = '/assets/Kaaba.png';

  useEffect(() => {
    // جلب الموقع تلقائياً
    getUserLocation();
    
    // مستمع لانتهاء صوت الأذان
    audioRef.current.addEventListener('ended', () => setIsAzanPlaying(false));
    return () => audioRef.current.removeEventListener('ended', () => setIsAzanPlaying(false));
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          calculatePrayers(latitude, longitude);
        },
        (error) => {
          console.error("Location Error:", error);
          // في حالة الخطأ، يمكنك تعيين إحداثيات افتراضية هنا
          calculatePrayers(24.4686, 39.6142); // إحداثيات المدينة المنورة كمثال
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const calculatePrayers = (lat, lng) => {
    const coordinates = new Coordinates(lat, lng);
    const params = CalculationMethod.Egyptian(); // الهيئة المصرية العامة للمساحة - دقيقة جداً
    const date = new Date();
    const times = new PrayerTimes(coordinates, date, params);
    
    setPrayerData(times);
    setQiblaRotation(Qibla(coordinates));
    setNextPrayer(times.nextPrayer());
    
    // جدولة التنبيهات المحلية فوراً
    scheduleNotifications(times);
  };

  const scheduleNotifications = async (times) => {
    await LocalNotifications.requestPermissions();
    const prayers = [
      { id: 1, name: 'الفجر', time: times.fajr },
      { id: 2, name: 'الظهر', time: times.dhuhr },
      { id: 3, name: 'العصر', time: times.asr },
      { id: 4, name: 'المغرب', time: times.maghrib },
      { id: 5, name: 'العشاء', time: times.isha }
    ];

    const notifications = prayers.map(p => ({
      id: p.id,
      title: `حان موعد صلاة ${p.name}`,
      body: 'تطبيق رؤاقة - حي على الصلاة، حي على الفلاح',
      schedule: { at: new Date(p.time) }, // سيعمل التنبيه في الوقت بالضبط
      sound: 'azan.mp3', // يجب أن يكون الملف في مجلد res/raw للأندرويد
      extra: { prayer: p.name }
    }));

    // إلغاء التنبيهات السابقة لضمان التحديث
    await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }] });
    // جدولة التنبيهات الجديدة للصلوات الخمس اليوم
    await LocalNotifications.schedule({ notifications });
  };

  const toggleAzan = () => {
    if (isAzanPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      audioRef.current.play();
    }
    setIsAzanPlaying(!isAzanPlaying);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fce4ec] to-[#f3e5f5] p-6 flex flex-col items-center font-sans rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[50px] p-10 shadow-3xl mt-12 mb-10 relative"
      >
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-[#ba68c8]/20">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-3xl font-extrabold text-[#8e24aa] flex items-center gap-2.5">
              <Bell className="w-8 h-8 text-[#e91e63]" /> مواقيت الصلاة
            </h1>
            <p className="text-[#d81b60] text-sm opacity-80 font-medium">تطبيق رؤاقة - دقة وتوقيت فعال</p>
          </div>
          <button className="text-[#8e24aa] hover:text-[#d81b60] p-2 rounded-full hover:bg-white/40">
            <Settings className="w-6 h-6" />
          </button>
        </header>

        {/* عرض القبلة على شكل ساعة */}
        <PrayerClock rotation={qiblaRotation} kabaImg={kabaImg} />

        {/* زر تشغيل/إيقاف الأذان */}
        <div className="flex justify-center -mt-6 mb-12 relative z-10">
          <button 
            onClick={toggleAzan}
            className={clsx(
              "flex items-center gap-2.5 px-8 py-4 rounded-full text-white font-bold transition-all shadow-xl",
              isAzanPlaying 
                ? "bg-[#e91e63] hover:bg-[#c2185b]" 
                : "bg-[#8e24aa] hover:bg-[#7b1fa2]"
            )}
          >
            {isAzanPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isAzanPlaying ? "إيقاف الأذان التجريبي" : "تجربة صوت الأذان"}
          </button>
        </div>

        {/* شبكة مواقيت الصلاة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prayerData && [
            { id: 'fajr', label: 'الفجر', time: prayerData.fajr },
            { id: 'dhuhr', label: 'الظهر', time: prayerData.dhuhr },
            { id: 'asr', label: 'العصر', time: prayerData.asr },
            { id: 'maghrib', label: 'المغرب', time: prayerData.maghrib },
            { id: 'isha', label: 'العشاء', time: prayerData.isha },
          ].map((prayer) => (
            <PrayerCard
              key={prayer.id}
              id={prayer.id}
              label={prayer.label}
              time={prayer.time}
              isNext={nextPrayer === prayer.id}
            />
          ))}
        </div>

        {coords && (
          <div className="mt-10 pt-4 border-t border-[#ba68c8]/20 text-center text-[#4a148c]/60 text-xs flex items-center justify-center gap-1.5 font-medium">
            <MapPin className="w-4 h-4" /> يتم الحساب بناءً على موقعك الحالي: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AlAsilPrayerPage;
