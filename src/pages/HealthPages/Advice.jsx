import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Settings, MapPin, Navigation, Clock } from 'lucide-react';

const RoqaPrayerApp = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [nextPrayerIndex, setNextPrayerIndex] = useState(0);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [qiblaAngle] = useState(135); // زاوية القبلة التقريبية
  const [notifications, setNotifications] = useState({
    fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true 
  });

  // مواقيت الصلاة (يمكن ربطها بـ API لاحقاً)
  const prayerTimes = [
    { name: 'الفجر', id: 'fajr', time: '05:12', icon: '🌙', color: 'from-indigo-500' },
    { name: 'الشروق', id: 'sunrise', time: '06:34', icon: '🌅', color: 'from-amber-400' },
    { name: 'الظهر', id: 'dhuhr', time: '12:05', icon: '☀️', color: 'from-orange-400' },
    { name: 'العصر', id: 'asr', time: '15:32', icon: '🌤️', color: 'from-rose-400' },
    { name: 'المغرب', id: 'maghrib', time: '17:45', icon: '🌇', color: 'from-purple-500' },
    { name: 'العشاء', id: 'isha', time: '19:15', icon: '🌌', color: 'from-slate-700' },
  ];

  // منطق العد التنازلي وتحديث الوقت
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      let foundNext = false;
      for (let i = 0; i < prayerTimes.length; i++) {
        const [h, m] = prayerTimes[i].time.split(':').map(Number);
        const pDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
        
        if (pDate > now) {
          const diff = pDate - now;
          setTimeUntilNext({
            hours: Math.floor(diff / 3600000),
            minutes: Math.floor((diff / 60000) % 60),
            seconds: Math.floor((diff / 1000) % 60)
          });
          setNextPrayerIndex(i);
          foundNext = true;
          break;
        }
      }
      if (!foundNext) setNextPrayerIndex(0);
    }, 1000);

    // محاكاة حركة البوصلة (للعرض فقط)
    const handleOrientation = (e) => setDeviceHeading(e.alpha || 0);
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);

    return () => {
      clearInterval(timer);
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
    };
  }, []);

  const toggleNotify = (id) => setNotifications(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#4a2c2a] font-sans pb-10" style={{ direction: 'rtl' }}>
      
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#BE185D] font-serif">طبتِ وطاب يومك</h1>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-3 h-3 text-[#D4AF37]" />
            <span>القاهرة، مصر</span>
          </div>
        </div>
        <button className="p-2 bg-white rounded-full shadow-sm border border-rose-100">
          <Settings className="w-5 h-5 text-rose-400" />
        </button>
      </header>

      <main className="px-6 space-y-8">
        
        {/* Next Prayer Card (Glassmorphism) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl bg-gradient-to-br from-[#EC4899] to-[#D4AF37]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-white/80 text-sm font-medium mb-2">الصلاة القادمة</span>
            <h2 className="text-5xl font-bold mb-6">{prayerTimes[nextPrayerIndex].name}</h2>
            
            <div className="flex gap-4 text-center">
              {[
                { val: timeUntilNext.hours, label: 'ساعة' },
                { val: timeUntilNext.minutes, label: 'دقيقة' },
                { val: timeUntilNext.seconds, label: 'ثانية' }
              ].map((t, i) => (
                <div key={i} className="flex flex-col">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl w-16 h-16 flex items-center justify-center text-2xl font-bold border border-white/30">
                    {String(t.val).padStart(2, '0')}
                  </div>
                  <span className="text-xs mt-2 opacity-90">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Qibla Compass (Watch Style) */}
        <section>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#D4AF37]" /> بوصلة القبلة
          </h3>
          <div className="flex justify-center py-4">
            <div className="relative w-64 h-64 rounded-full bg-white shadow-[0_20px_50px_rgba(236,72,153,0.15)] border-8 border-[#FCE4EC] flex items-center justify-center">
              {/* Dial Marks */}
              {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute inset-2 text-center" style={{ transform: `rotate(${i * 30}deg)` }}>
                  <div className="w-1 h-3 bg-rose-100 rounded-full mx-auto" />
                </div>
              ))}
              
              {/* The Heart Pointer */}
              <motion.div 
                animate={{ rotate: qiblaAngle - deviceHeading }}
                transition={{ type: 'spring', stiffness: 40 }}
                className="relative z-20 flex flex-col items-center"
              >
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <Heart fill="#EC4899" className="w-12 h-12 text-[#EC4899] drop-shadow-lg" />
                </motion.div>
                <div className="w-1 h-16 bg-gradient-to-t from-[#EC4899] to-transparent -mt-2 rounded-full" />
              </motion.div>

              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <div className="text-8xl font-bold text-rose-900">رقعة</div>
              </div>
            </div>
          </div>
        </section>

        {/* Prayer List */}
        <section className="space-y-3">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#D4AF37]" /> مواقيت اليوم
          </h3>
          {prayerTimes.map((prayer, i) => (
            <motion.div 
              key={prayer.id}
              whileHover={{ x: -5 }}
              className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${
                i === nextPrayerIndex ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl p-2 bg-gray-50 rounded-xl">{prayer.icon}</span>
                <div>
                  <p className="font-bold text-gray-800">{prayer.name}</p>
                  <p className="text-xs text-gray-400">التوقيت المحلي</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-[#4a2c2a]">{prayer.time}</span>
                <button onClick={() => toggleNotify(prayer.id)}>
                  {notifications[prayer.id] ? 
                    <Bell className="w-5 h-5 text-[#EC4899]" fill="currentColor" /> : 
                    <BellOff className="w-5 h-5 text-gray-300" />
                  }
                </button>
              </div>
            </motion.div>
          ))}
        </section>

      </main>
    </div>
  );
};

export default RoqaPrayerApp;
