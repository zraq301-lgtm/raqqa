import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, BellOff, Settings, MapPin, Navigation, 
  Clock, Heart, ChevronLeft, Calendar 
} from 'lucide-react';

// --- التنسيقات المدمجة (تغني عن ملفات CSS الخارجية مؤقتاً) ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Tajawal:wght@300;500;700&display=swap');
  
  :root {
    --roqa-rose: #EC4899;
    --roqa-gold: #D4AF37;
    --roqa-bg: #FFFBF7;
  }

  .font-roqa { font-family: 'Cairo', 'Tajawal', sans-serif; }
  
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(236, 72, 153, 0.1);
    border-radius: 2rem;
  }

  @keyframes pulse-heart {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.15); opacity: 0.8; }
  }
  .animate-heart { animation: pulse-heart 2s ease-in-out infinite; }
`;

const RoqaMainDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [nextPrayer, setNextPrayer] = useState({ name: 'الظهر', time: '12:05', diff: '' });
  const [notifications, setNotifications] = useState({ fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true });

  // بيانات مواقيت الصلاة المستخرجة من الملفات المرفوعة
  const prayerTimes = [
    { id: 'fajr', name: 'الفجر', time: '05:12', icon: '🌙', color: 'from-indigo-500/20' },
    { id: 'sunrise', name: 'الشروق', time: '06:34', icon: '🌅', color: 'from-amber-400/20' },
    { id: 'dhuhr', name: 'الظهر', time: '12:05', icon: '☀️', color: 'from-orange-400/20' },
    { id: 'asr', name: 'العصر', time: '15:32', icon: '🌤️', color: 'from-rose-400/20' },
    { id: 'maghrib', name: 'المغرب', time: '17:45', icon: '🌇', color: 'from-purple-500/20' },
    { id: 'isha', name: 'العشاء', time: '19:15', icon: '🌌', color: 'from-slate-700/20' },
  ];

  // تحديث الوقت والعد التنازلي
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      updateNextPrayer(now);
    }, 1000);

    const handleOrientation = (e) => {
      if (e.alpha !== null) setDeviceHeading(e.alpha);
    };
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);

    return () => {
      clearInterval(timer);
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
    };
  }, []);

  const updateNextPrayer = (now) => {
    for (let prayer of prayerTimes) {
      const [h, m] = prayer.time.split(':').map(Number);
      const pDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
      if (pDate > now) {
        const diffMs = pDate - now;
        const hours = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs / 60000) % 60);
        setNextPrayer({ ...prayer, diff: `${hours}س ${mins}د` });
        break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] font-roqa text-[#4A2C2A] pb-24 selection:bg-rose-100" style={{ direction: 'rtl' }}>
      <style>{styles}</style>

      {/* --- Header Section --- */}
      <header className="p-6 flex justify-between items-center bg-white/50 sticky top-0 z-50 backdrop-blur-md">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-[#BE185D]">رُقعة</h1>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#D4AF37]" /> 15 رمضان، 1447 هـ
          </p>
        </motion.div>
        <div className="flex gap-2">
          <button className="p-2.5 bg-white rounded-2xl shadow-sm border border-rose-50 hover:bg-rose-50 transition-colors">
            <Settings className="w-5 h-5 text-rose-400" />
          </button>
        </div>
      </header>

      <main className="px-5 space-y-8 mt-4">
        
        {/* --- Hero: Next Prayer Card --- */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-xl shadow-rose-200/50 bg-gradient-to-br from-[#EC4899] via-[#F43F5E] to-[#D4AF37]"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm">الصلاة القادمة</span>
              <Clock className="w-6 h-6 opacity-80" />
            </div>
            <div>
              <h2 className="text-5xl font-bold tracking-tight">{nextPrayer.name}</h2>
              <p className="text-rose-100 mt-2 text-lg">متبقي {nextPrayer.diff}</p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-sm font-light opacity-90">
              <MapPin className="w-4 h-4" /> القاهرة، مصر
            </div>
          </div>
        </motion.div>

        {/* --- Qibla Compass Section --- */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#D4AF37]" /> اتجاه القبلة
            </h3>
            <span className="text-xs text-rose-500 font-medium">دقيق بمقدار 2°</span>
          </div>
          
          <div className="flex justify-center py-6">
            <div className="relative w-64 h-64 rounded-full bg-white shadow-inner flex items-center justify-center border-[12px] border-[#FCE4EC]">
              {/* Outer Dial */}
              {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute inset-2" style={{ transform: `rotate(${i * 30}deg)` }}>
                  <div className="w-0.5 h-3 bg-rose-100 rounded-full mx-auto" />
                </div>
              ))}
              
              {/* Luxury Compass Face */}
              <div className="absolute inset-6 rounded-full border border-dashed border-rose-200 animate-[spin_20s_linear_infinite]" />
              
              {/* Heart Pointer */}
              <motion.div 
                animate={{ rotate: 135 - deviceHeading }} // 135 هي زاوية القبلة الافتراضية
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                className="relative z-20 flex flex-col items-center"
              >
                <div className="animate-heart">
                  <Heart fill="#EC4899" className="w-14 h-14 text-[#EC4899] drop-shadow-xl" />
                </div>
                <div className="w-1.5 h-20 bg-gradient-to-t from-[#EC4899] to-transparent -mt-3 rounded-full" />
              </motion.div>

              <div className="absolute bottom-10 text-[10px] font-bold text-rose-300 tracking-widest uppercase">Qibla</div>
            </div>
          </div>
        </section>

        {/* --- Prayer Times List --- */}
        <section className="space-y-4">
          <h3 className="font-bold text-lg px-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#D4AF37]" /> مواقيت الصلاة
          </h3>
          <div className="grid gap-3">
            {prayerTimes.map((prayer) => {
              const isActive = prayer.name === nextPrayer.name;
              return (
                <motion.div
                  key={prayer.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className={`glass-card p-4 flex items-center justify-between transition-all ${
                    isActive ? 'ring-2 ring-[#EC4899] bg-white shadow-lg' : 'hover:bg-white/90'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${prayer.color} flex items-center justify-center text-2xl`}>
                      {prayer.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{prayer.name}</h4>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Prayer Time</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5">
                    <span className={`text-xl font-bold ${isActive ? 'text-[#EC4899]' : 'text-gray-700'}`}>
                      {prayer.time}
                    </span>
                    <button 
                      onClick={() => setNotifications(prev => ({...prev, [prayer.id]: !prev[prayer.id]}))}
                      className={`p-2 rounded-full transition-colors ${notifications[prayer.id] ? 'bg-rose-50 text-rose-500' : 'text-gray-300 hover:bg-gray-50'}`}
                    >
                      {notifications[prayer.id] ? <Bell className="w-5 h-5" fill="currentColor" /> : <BellOff className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* --- Footer Tips --- */}
        <footer className="rounded-3xl bg-[#D4AF37]/10 p-6 border border-[#D4AF37]/20">
          <p className="text-sm text-[#8B6E12] leading-relaxed flex gap-3">
            <span className="text-lg">✨</span>
            "أحبُّ الأعمالِ إلى اللهِ الصلاةُ على وقتِها.." - كوني دائماً على استعداد لصلاتكِ.
          </p>
        </footer>
      </main>

      {/* --- Bottom Navigation (Floating) --- */}
      <nav className="fixed bottom-6 left-6 right-6 h-18 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-2xl flex justify-around items-center px-4 z-[100]">
        {[
          { icon: <Clock className="w-6 h-6" />, label: 'المواقيت' },
          { icon: <Navigation className="w-6 h-6" />, label: 'القبلة' },
          { icon: <Heart className="w-6 h-6" />, label: 'رقعة' },
          { icon: <Settings className="w-6 h-6" />, label: 'الإعدادات' }
        ].map((item, i) => (
          <button key={i} className={`flex flex-col items-center gap-1 p-2 ${i === 0 ? 'text-[#EC4899]' : 'text-gray-400'}`}>
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default RoqaMainDashboard;
