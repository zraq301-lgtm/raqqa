import React, { useState, useEffect, useRef } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes, Qibla } from 'adhan';
import { DateTime } from 'luxon';
import { motion, AnimatePresence } from 'framer-motion';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Compass, Bell, BellOff, MapPin } from 'lucide-react';

const PrayerPage = () => {
  const [coords, setCoords] = useState(null);
  const [prayerData, setPrayerData] = useState(null);
  const [qiblaRotation, setQiblaRotation] = useState(0);
  const [nextPrayer, setNextPrayer] = useState(null);
  const audioRef = useRef(new Audio('/assets/azan.mp3'));

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          calculatePrayers(latitude, longitude);
        },
        (error) => console.error("Location Error:", error),
        { enableHighAccuracy: true }
      );
    }
  };

  const calculatePrayers = (lat, lng) => {
    const coordinates = new Coordinates(lat, lng);
    const params = CalculationMethod.Egyptian();
    const date = new Date();
    const times = new PrayerTimes(coordinates, date, params);
    
    setPrayerData(times);
    setQiblaRotation(Qibla(coordinates));
    setNextPrayer(times.nextPrayer());
    
    // جدولة التنبيهات تلقائياً
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
      body: 'حي على الصلاة، حي على الفلاح',
      schedule: { at: new Date(p.time) },
      sound: 'azan.mp3',
      extra: { prayer: p.name }
    }));

    await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }] });
    await LocalNotifications.schedule({ notifications });
  };

  const formatTime = (time) => DateTime.fromJSDate(time).toLocaleString(DateTime.TIME_SIMPLE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fce4ec] to-[#f3e5f5] p-6 flex flex-col items-center font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] p-8 shadow-2xl mt-10"
      >
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#8e24aa] flex items-center justify-center gap-2">
            <Bell className="w-6 h-6" /> مواقيت الصلاة
          </h1>
          <p className="text-[#d81b60] text-sm opacity-80">تطبيق رؤاقة - دقة وتوقيت فعال</p>
        </header>

        {/* بوصلة القبلة */}
        <div className="relative flex justify-center my-10">
          <div className="w-48 h-48 rounded-full border-2 border-dashed border-[#ba68c8] flex items-center justify-center relative">
            <motion.div 
              style={{ rotate: -qiblaRotation }}
              transition={{ type: 'spring', stiffness: 50 }}
              className="w-32 h-32"
            >
              <img src="/assets/Kaaba.png" alt="Qibla" className="w-full h-full object-contain" />
            </motion.div>
            <div className="absolute -top-4 bg-[#8e24aa] text-white px-3 py-1 rounded-full text-xs">القبلة</div>
          </div>
        </div>

        {/* عرض المواقيت */}
        <div className="space-y-3">
          {prayerData && [
            { id: 'fajr', label: 'الفجر', time: prayerData.fajr },
            { id: 'dhuhr', label: 'الظهر', time: prayerData.dhuhr },
            { id: 'asr', label: 'العصر', time: prayerData.asr },
            { id: 'maghrib', label: 'المغرب', time: prayerData.maghrib },
            { id: 'isha', label: 'العشاء', time: prayerData.isha },
          ].map((prayer) => (
            <motion.div
              key={prayer.id}
              whileHover={{ x: 5 }}
              className={clsx(
                "flex justify-between items-center p-4 rounded-2xl transition-all",
                nextPrayer === prayer.id 
                  ? "bg-gradient-to-r from-[#8e24aa] to-[#d81b60] text-white shadow-lg" 
                  : "bg-white/50 text-[#4a148c] border border-white/20"
              )}
            >
              <span className="font-semibold text-lg">{prayer.label}</span>
              <span className="text-xl font-mono">{formatTime(prayer.time)}</span>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={() => audioRef.current.play()}
          className="w-full mt-8 py-4 bg-white/60 border border-[#ba68c8]/30 rounded-2xl text-[#8e24aa] font-bold hover:bg-[#8e24aa] hover:text-white transition-all shadow-sm"
        >
          تجربة صوت الأذان
        </button>
      </motion.div>
    </div>
  );
};

export default PrayerPage;
