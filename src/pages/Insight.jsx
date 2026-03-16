import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { Motion } from '@capacitor/motion';
import { 
  Sparkles, Heart, Moon, BookOpen, Activity, 
  ShieldCheck, Users, ShieldAlert, Wind, Gift, 
  Clock, Brain, Flower2, Coins, Hourglass, 
  Camera, Mic, Image, Trash2, X, MapPin, MessageCircle, Bookmark, List,
  CheckCircle2, CircleOff, Star, Droplets, Bath, Smile, Sun, Utensils, 
  Baby, GraduationCap, Zap, Coffee, Shield, Check, Minus, Compass, Volume2, VolumeX, Calendar
} from 'lucide-react';

// استيراد خدمات الميديا
import { takePhoto, fetchImage, uploadToVercel } from '../services/MediaService';

const RaqqaApp = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [inputs, setInputs] = useState({});
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [savedReplies, setSavedReplies] = useState([]);
  const [showSavedList, setShowSavedList] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showPrayerTimesModal, setShowPrayerTimesModal] = useState(false); // كارت مواقيت الصلاة
  const [chatMessage, setChatMessage] = useState("");
  const [customPrompt, setCustomPrompt] = useState(""); 

  // --- حالات ركن العبادة المحدثة ---
  const [isAzanEnabled, setIsAzanEnabled] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(0); 
  const [phoneHeading, setPhoneHeading] = useState(0); 
  const [nextPrayer, setNextPrayer] = useState({ name: "جاري التحميل", time: "--:--" });

  const audioRef = useRef(new Audio("/assets/azan.mp3"));

  useEffect(() => {
    const fetchReligiousData = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const pRes = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=5`);
            const pData = await pRes.json();
            setPrayerTimes(pData.data.timings);
            
            const qRes = await fetch(`https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`);
            const qData = await qRes.json();
            setQiblaDirection(qData.data.direction);
          } catch (err) {
            console.error("Error fetching religious data", err);
          }
        });
      }
    };
    fetchReligiousData();
  }, []);

  useEffect(() => {
    let handler = null;
    const startWatchingOrientation = async () => {
      try {
        handler = await Motion.addListener('orientation', (data) => {
          if (data.alpha !== null) {
            setPhoneHeading(data.alpha);
          }
        });
      } catch (error) {
        console.error("خطأ في تفعيل مستشعر الاتجاه:", error);
      }
    };
    startWatchingOrientation();
    return () => { if (handler) handler.remove(); };
  }, []);

  // معادلة تحديد القبلة: زاوية القبلة من الشمال - اتجاه الهاتف الحالي
  const calculateQiblaRotation = () => {
    return qiblaDirection - phoneHeading;
  };

  useEffect(() => {
    const checkAzanAndNextPrayer = () => {
      if (!prayerTimes) return;
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

      const prayers = [
        { name: "الفجر", time: prayerTimes.Fajr },
        { name: "الظهر", time: prayerTimes.Dhuhr },
        { name: "العصر", time: prayerTimes.Asr },
        { name: "المغرب", time: prayerTimes.Maghrib },
        { name: "العشاء", time: prayerTimes.Isha }
      ];

      if (isAzanEnabled) {
        const currentPrayerMatch = prayers.find(p => p.time === currentTime);
        if (currentPrayerMatch && audioRef.current.paused) {
          audioRef.current.play().catch(e => console.log("تفاعل المستخدم مطلوب"));
        }
      }

      const upcoming = prayers.find(p => {
        const [h, m] = p.time.split(':');
        const pDate = new Date();
        pDate.setHours(parseInt(h), parseInt(m), 0);
        return pDate > now;
      }) || prayers[0];

      setNextPrayer(upcoming);
    };

    const interval = setInterval(checkAzanAndNextPrayer, 30000);
    checkAzanAndNextPrayer();
    return () => clearInterval(interval);
  }, [prayerTimes, isAzanEnabled]);

  const menuData = [
    { id: 1, title: "فقه الطهارة", icon: <Sparkles />, items: [{n: "سنن الفطرة", i: <Smile size={14}/>}, {n: "صفة الغسل", i: <Bath size={14}/>}, {n: "الوضوء الجمالي", i: <Droplets size={14}/>}, {n: "طهارة الثوب", i: <Shield size={14}/>}, {n: "طيب الرائحة", i: <Zap size={14}/>}, {n: "أحكام المسح", i: <Minus size={14}/>}]},
    { id: 2, title: "فقه الصلاة", icon: <Heart />, items: [{n: "أوقات الصلاة", i: <Clock size={14}/>}, {n: "السنن الرواتب", i: <Star size={14}/>}, {n: "سجدة الشكر", i: <Heart size={14}/>}, {n: "لباس الصلاة", i: <Shield size={14}/>}, {n: "صلاة الوتر", i: <Moon size={14}/>}]},
    // ... باقي البيانات (تم اختصارها لسهولة القراءة)
  ];

  const handleProcess = async (directMsg = null) => {
    setLoading(true);
    const summary = Object.entries(inputs).map(([k, v]) => `${k}: ${v === 'yes' ? 'تم بحمد الله' : 'لم يتم'}`).join(", ");
    const promptText = directMsg || `أنا أنثى مسلمة، إليكِ تقريري في ${activeCategory?.title}: (${summary}). حللي نمو روحي بأسلوب ديني ونفسي دافئ دون فتاوى.`;
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      };
      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || response.data.message || "عذراً رفيقتي، لم أتمكن من الرد الآن.";
      setAiResponse(responseText);
      setHistory(prev => [{ role: 'ai', text: responseText, id: Date.now() }, ...prev]);
      if (!directMsg) setShowAnalysisModal(true);
    } catch (err) {
      setAiResponse("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت 🌸");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>رقة ✨</h1>

        {/* الكارت المطور لركن العبادة - القبلة في المنتصف */}
        <div style={styles.religiousInfoBar}>
          
          {/* الجانب الأيمن: زر مواقيت الصلاة */}
          <div style={styles.sideControl}>
             <button style={styles.prayerTimesBtn} onClick={() => setShowPrayerTimesModal(true)}>
                <Calendar size={20} />
                <span>مواقيت الأذان</span>
             </button>
             <div style={styles.nextPrayerLabel}>
                <small>القادمة: {nextPrayer.name}</small>
                <strong>{nextPrayer.time}</strong>
             </div>
          </div>

          {/* المنتصف: البوصلة الكبيرة جداً */}
          <div style={styles.qiblaCenter}>
            <div style={styles.qiblaCircle}>
              <div style={{...styles.compassFrame, transform: `rotate(${-phoneHeading}deg)`}}>
                <span style={{...styles.mark, top: 5}}>N</span>
                <span style={{...styles.mark, bottom: 5}}>S</span>
                <span style={{...styles.mark, right: 5}}>E</span>
                <span style={{...styles.mark, left: 5}}>W</span>
              </div>
              <div style={{...styles.qiblaNeedle, transform: `rotate(${qiblaDirection}deg)`}}>
                 <img src="/assets/Kaaba.png" alt="Kaaba" style={styles.kaabaIcon} />
                 <div style={styles.qiblaLine}></div>
              </div>
            </div>
            <div style={styles.qiblaDegreeText}>درجة القبلة: {Math.round(qiblaDirection)}°</div>
          </div>

          {/* الجانب الأيسر: التحكم بالصوت */}
          <div style={styles.sideControl}>
             <button 
              style={{...styles.audioToggle, color: isAzanEnabled ? '#f06292' : '#bbb'}} 
              onClick={() => { setIsAzanEnabled(!isAzanEnabled); if (isAzanEnabled) audioRef.current.pause(); }}
             >
              {isAzanEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
             </button>
          </div>
        </div>

        <p style={styles.subtitle}>فقه المرأة الوعي والجمال</p>
      </header>

      {/* مودال مواقيت الصلاة (Card overlay) */}
      {showPrayerTimesModal && prayerTimes && (
        <div style={styles.prayerModalOverlay} onClick={() => setShowPrayerTimesModal(false)}>
          <div style={styles.prayerCard} onClick={e => e.stopPropagation()}>
            <div style={styles.prayerCardHeader}>
              <h3>مواقيت الصلاة اليوم 🌸</h3>
              <X onClick={() => setShowPrayerTimesModal(false)} />
            </div>
            <div style={styles.prayerTable}>
              <div style={styles.prayerRow}><span>الفجر</span> <strong>{prayerTimes.Fajr}</strong></div>
              <div style={styles.prayerRow}><span>الشروق</span> <strong>{prayerTimes.Sunrise}</strong></div>
              <div style={styles.prayerRow}><span>الظهر</span> <strong>{prayerTimes.Dhuhr}</strong></div>
              <div style={styles.prayerRow}><span>العصر</span> <strong>{prayerTimes.Asr}</strong></div>
              <div style={styles.prayerRow}><span>المغرب</span> <strong>{prayerTimes.Maghrib}</strong></div>
              <div style={styles.prayerRow}><span>العشاء</span> <strong>{prayerTimes.Isha}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* باقي محتوى التطبيق (Grid) */}
      {!activeCategory && (
        <div style={styles.grid}>
          {menuData.map(cat => (
            <div key={cat.id} style={styles.menuItem} onClick={() => setActiveCategory(cat)}>
              <span style={styles.iconWrapper}>{cat.icon}</span>
              <span style={styles.menuText}>{cat.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  appContainer: { minHeight: '100vh', background: '#fff9fb', padding: '20px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' },
  header: { textAlign: 'center' },
  title: { color: '#f06292', fontSize: '2.2rem', marginBottom: '10px' },
  subtitle: { color: '#888', fontStyle: 'italic' },
  
  // كارت العبادة المطور
  religiousInfoBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '30px',
    padding: '25px',
    margin: '20px auto',
    maxWidth: '500px',
    border: '1px solid rgba(240, 98, 146, 0.2)',
    boxShadow: '0 10px 30px rgba(240, 98, 146, 0.1)'
  },

  sideControl: { display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', flex: 1 },
  prayerTimesBtn: { background: '#f06292', color: '#white', border: 'none', padding: '8px 12px', borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', fontSize: '0.7rem' },
  nextPrayerLabel: { textAlign: 'center', color: '#666' },
  audioToggle: { background: 'none', border: 'none', cursor: 'pointer' },

  // القبلة في المنتصف
  qiblaCenter: { flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  qiblaCircle: {
    width: '160px', height: '160px', borderRadius: '50%',
    background: '#fff', border: '6px solid #fce4ec',
    position: 'relative', overflow: 'hidden',
    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.05)'
  },
  compassFrame: { width: '100%', height: '100%', position: 'absolute', transition: 'transform 0.1s linear' },
  mark: { position: 'absolute', fontSize: '0.7rem', color: '#f06292', width: '100%', textAlign: 'center', fontWeight: 'bold' },
  qiblaNeedle: { 
    width: '100%', height: '100%', position: 'absolute', 
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    transition: 'transform 0.5s ease-out'
  },
  kaabaIcon: { width: '40px', height: '40px', zIndex: 2, marginTop: '-10px' },
  qiblaLine: { width: '2px', height: '60px', background: 'linear-gradient(to top, #f06292, transparent)', position: 'absolute', top: '10px' },
  qiblaDegreeText: { marginTop: '10px', fontSize: '0.8rem', color: '#f06292', fontWeight: 'bold' },

  // مودال مواقيت الصلاة
  prayerModalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  prayerCard: { width: '85%', maxWidth: '350px', background: '#fff', borderRadius: '25px', padding: '20px', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' },
  prayerCardHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #fce4ec', paddingBottom: '10px', marginBottom: '15px' },
  prayerTable: { display: 'flex', flexDirection: 'column', gap: '12px' },
  prayerRow: { display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#fff9fb', borderRadius: '12px' },

  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' },
  menuItem: { background: '#fff', padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' },
  iconWrapper: { color: '#f06292' },
  menuText: { fontSize: '0.9rem', fontWeight: 'bold', color: '#444' }
};

export default RaqqaApp;
