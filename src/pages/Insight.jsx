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
  const [showPrayerTimesModal, setShowPrayerTimesModal] = useState(false); // كارت مواقيت الصلاة الجديد
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
            // التصحيح: alpha هي زاوية دوران الهاتف حول نفسه
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

  // حساب الدوران الصحيح للكعبة لتبدو وكأنها بوصلة حقيقية
  const calculateVisualRotation = () => {
    // زاوية القبلة بالنسبة للشمال الحقيقي - زاوية دوران الهاتف الحالية
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
    { id: 1, title: "فقه الطهارة", icon: <Sparkles />, items: [
      {n: "سنن الفطرة", i: <Smile size={14}/>}, {n: "صفة الغسل", i: <Bath size={14}/>}, {n: "الوضوء الجمالي", i: <Droplets size={14}/>}, 
      {n: "طهارة الثوب", i: <Shield size={14}/>}, {n: "طيب الرائحة", i: <Zap size={14}/>}, {n: "أحكام المسح", i: <Minus size={14}/>}
    ]},
    { id: 2, title: "فقه الصلاة", icon: <Heart />, items: [
      {n: "أوقات الصلاة", i: <Clock size={14}/>}, {n: "السنن الرواتب", i: <Star size={14}/>}, 
      {n: "سجدة الشكر", i: <Heart size={14}/>}, 
      {n: "لباس الصلاة", i: <Shield size={14}/>}, {n: "صلاة الوتر", i: <Moon size={14}/>}
    ]},
    { id: 3, title: "فقه الصيام", icon: <Moon />, items: [
      {n: "صيام التطوع", i: <Sun size={14}/>}, {n: "قضاء ما فات", i: <Check size={14}/>}, {n: "سحور البركة", i: <Coffee size={14}/>}, 
      {n: "كف اللسان", i: <ShieldAlert size={14}/>}, {n: "نية الصيام", i: <Heart size={14}/>}
    ]},
    { id: 4, title: "فقه القرآن", icon: <BookOpen />, items: [
      {n: "تلاوة يومية", i: <BookOpen size={14}/>}, {n: "تدبر آية", i: <Brain size={14}/>}, {n: "حفظ جديد", i: <Sparkles size={14}/>}, 
      {n: "الاستماع بإنصات", i: <Activity size={14}/>}, {n: "مراجعة الورد", i: <Clock size={14}/>}
    ]},
    { id: 5, title: "الذكر الذكي", icon: <Activity />, items: [
      {n: "أذكار الصباح", i: <Sun size={14}/>}, {n: "أذكار المساء", i: <Moon size={14}/>}, {n: "الاستغفار", i: <Wind size={14}/>}, 
      {n: "الصلاة على النبي", i: <Heart size={14}/>}, {n: "التسبيح", i: <Sparkles size={14}/>}
    ]},
    { id: 6, title: "العفة والحجاب", icon: <ShieldCheck />, items: [
      {n: "حجاب القلب", i: <Heart size={14}/>}, {n: "غض البصر", i: <ShieldCheck size={14}/>}, {n: "الحياء في القول", i: <MessageCircle size={14}/>}, 
      {n: "سمو الفكر", i: <Brain size={14}/>}, {n: "الستر الأنيق", i: <Shield size={14}/>}
    ]},
    { id: 7, title: "المعاملات والبيوت", icon: <Users />, items: [
      {n: "بر الوالدين", i: <Heart size={14}/>}, {n: "مودة الزوج", i: <Heart size={14}/>}, {n: "رحمة الأبناء", i: <Baby size={14}/>}, 
      {n: "صلة الرحم", i: <Users size={14}/>}, {n: "حسن الجوار", i: <MapPin size={14}/>}
    ]},
    { id: 8, title: "تجنب المحرمات", icon: <ShieldAlert />, items: [
      {n: "محاربة الغيبة", i: <ShieldAlert size={14}/>}, {n: "ترك النميمة", i: <X size={14}/>}, {n: "تجنب الإباحية", i: <Shield size={14}/>}, 
      {n: "الصدق", i: <CheckCircle2 size={14}/>}, {n: "ترك الجدال", i: <Minus size={14}/>}
    ]},
    { id: 9, title: "الهدوء النفسي", icon: <Wind />, items: [
      {n: "تفريغ الانفعالات", i: <Wind size={14}/>}, {n: "الرضا بالقدر", i: <Smile size={14}/>}, {n: "حسن الظن بالله", i: <Sparkles size={14}/>}, 
      {n: "الصبر الجميل", i: <Clock size={14}/>}
    ]},
    { id: 10, title: "أعمال صالحة", icon: <Gift />, items: [
      {n: "صدقة خفية", i: <Coins size={14}/>}, {n: "إماطة الأذى", i: <Trash2 size={14}/>}, {n: "إفشاء السلام", i: <MessageCircle size={14}/>}, 
      {n: "نفع الناس", i: <Users size={14}/>}, {n: "جبر الخواطر", i: <Gift size={14}/>}
    ]},
    { id: 11, title: "الوقت والإنجاز", icon: <Clock />, items: [
      {n: "البكور", i: <Sun size={14}/>}, {n: "تنظيم المهام", i: <List size={14}/>}, {n: "ترك ما لا يعني", i: <X size={14}/>}, 
      {n: "استغلال الفراغ", i: <Hourglass size={14}/>}
    ]},
    { id: 12, title: "الوعي الفقهي", icon: <Brain />, items: [
      {n: "مقاصد الشريعة", i: <GraduationCap size={14}/>}, {n: "قراءة السيرة", i: <BookOpen size={14}/>}, {n: "فقه الواقع", i: <Brain size={14}/>}, 
      {n: "طلب العلم", i: <GraduationCap size={14}/>}
    ]},
    { id: 13, title: "الرعاية الذاتية", icon: <Flower2 />, items: [
      {n: "النوم على طهارة", i: <Moon size={14}/>}, {n: "رياضة بنية القوة", i: <Activity size={14}/>}, {n: "الأكل الطيب", i: <Utensils size={14}/>}, 
      {n: "التزين المشروع", i: <Sparkles size={14}/>}
    ]},
    { id: 14, title: "العطاء والزكاة", icon: <Coins />, items: [
      {n: "زكاة المال", i: <Coins size={14}/>}, {n: "زكاة العلم", i: <GraduationCap size={14}/>}, {n: "زكاة الجمال", i: <Heart size={14}/>}, 
      {n: "الهدية", i: <Gift size={14}/>}
    ]},
    { id: 15, title: "لقاء الله", icon: <Hourglass />, items: [
      {n: "تجديد التوبة", i: <Wind size={14}/>}, {n: "كتابة الوصية", i: <BookOpen size={14}/>}, {n: "ذكر هادم اللذات", i: <Hourglass size={14}/>}, 
      {n: "حسن الخاتمة", i: <Star size={14}/>}
    ]},
  ];

  const handleProcess = async (directMsg = null) => {
    setLoading(true);
    const contextText = customPrompt ? `[سياق إضافي: ${customPrompt}] ` : "";
    const summary = Object.entries(inputs).map(([k, v]) => `${k}: ${v === 'yes' ? 'تم بحمد الله' : 'لم يتم'}`).join(", ");
    const promptText = directMsg || `${contextText}أنا أنثى مسلمة، إليكِ تقريري في ${activeCategory?.title}: (${summary}). حللي نمو روحي بأسلوب ديني ونفسي دافئ دون فتاوى.`;

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
      console.error("فشل الاتصال:", err);
      setAiResponse("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت 🌸");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      
      <header style={styles.header}>
        <h1 style={styles.title}>رقة ✨</h1>

        {/* كارت العبادة المطور - البوصلة في المنتصف */}
        <div style={styles.qiblaMainHero}>
            <div style={styles.qiblaGlassCard}>
                <div style={styles.qiblaCompassWrapper}>
                    <div style={{...styles.qiblaRotatingFrame, transform: `rotate(${calculateVisualRotation()}deg)`}}>
                        <img src="/assets/Kaaba.png" alt="Qibla" style={styles.kaabaHeroIcon} />
                        <div style={styles.qiblaPointerLine}></div>
                    </div>
                    {/* علامات الجهات ثابتة خلف البوصلة */}
                    <div style={styles.compassStaticMarks}>
                        <span style={{top: '5%', left: '50%', transform: 'translateX(-50%)'}}>N</span>
                        <span style={{bottom: '5%', left: '50%', transform: 'translateX(-50%)'}}>S</span>
                        <span style={{right: '5%', top: '50%', transform: 'translateY(-50%)'}}>E</span>
                        <span style={{left: '5%', top: '50%', transform: 'translateY(-50%)'}}>W</span>
                    </div>
                </div>
                
                <div style={styles.qiblaInfoFooter}>
                    <div style={styles.qiblaBadge}>
                        <Compass size={14} />
                        <span>درجة القبلة: {Math.round(qiblaDirection)}°</span>
                    </div>
                    <button style={styles.azanTriggerBtn} onClick={() => setShowPrayerTimesModal(true)}>
                        <Calendar size={18} />
                        <span>مواقيت الأذان</span>
                    </button>
                </div>
            </div>
        </div>

        <p style={styles.subtitle}>فقه المرأة الوعي والجمال</p>
        
        <div style={styles.headerActions}>
          <button style={styles.chatHeaderBtn} onClick={() => setShowChat(true)}>
            <MessageCircle size={18} />
            <span>دردشة فقه رقة</span>
          </button>
          <a href="https://www.azhar.eg/fatwacenter" target="_blank" rel="noreferrer" style={styles.azharHeaderBtn}>
            <MapPin size={18} />
            <span>اسألي الأزهر</span>
          </a>
        </div>
      </header>

      {/* Grid Menu and Modals (بقية الكود كما هو مع إضافة مودال مواقيت الصلاة) */}
      {!activeCategory && (
        <div style={styles.grid}>
          {[0, 1, 2].map(colIndex => (
            <div key={colIndex} style={styles.column}>
              {menuData.slice(colIndex * 5, (colIndex + 1) * 5).map(cat => (
                <div key={cat.id} style={styles.menuItem} onClick={() => {setActiveCategory(cat); setInputs({}); setAiResponse("");}}>
                  <span style={styles.iconWrapper}>{cat.icon}</span>
                  <span style={styles.menuText}>{cat.title}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* مودال مواقيت الصلاة الجديد (التصميم الكلاسيكي المرفوع) */}
      {showPrayerTimesModal && (
          <div style={styles.prayerModalOverlay}>
              <div style={styles.prayerClockCard}>
                  <div style={styles.prayerCardHeader}>
                      <X onClick={() => setShowPrayerTimesModal(false)} style={{cursor: 'pointer', color: '#8d6e63'}} />
                      <div style={styles.hijriDate}>رمضان ١٤٤٧ هـ</div>
                      <Clock size={20} color="#8d6e63" />
                  </div>
                  
                  <div style={styles.prayerDigitalDisplay}>
                        <div style={styles.mainTimer}>{new Date().toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</div>
                        <div style={styles.subTimer}>باقي لـ {nextPrayer.name}: {nextPrayer.time}</div>
                  </div>

                  <div style={styles.prayerGrid}>
                      {[
                          {n: 'الفجر', t: prayerTimes?.Fajr},
                          {n: 'الظهر', t: prayerTimes?.Dhuhr},
                          {n: 'العصر', t: prayerTimes?.Asr},
                          {n: 'المغرب', t: prayerTimes?.Maghrib},
                          {n: 'العشاء', t: prayerTimes?.Isha},
                      ].map((p, i) => (
                          <div key={i} style={{...styles.prayerSlot, backgroundColor: nextPrayer.name === p.n ? '#fff3e0' : 'transparent'}}>
                              <span style={styles.slotName}>{p.n}</span>
                              <span style={styles.slotTime}>{p.t || '--:--'}</span>
                          </div>
                      ))}
                  </div>
                  
                  <div style={styles.prayerFooter}>
                      <button 
                        style={{...styles.audioToggle, color: isAzanEnabled ? '#f06292' : '#999'}}
                        onClick={() => setIsAzanEnabled(!isAzanEnabled)}
                      >
                          {isAzanEnabled ? <Volume2 /> : <VolumeX />}
                          <span>تنبيه الأذان</span>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* ... بقية المودالات (activeCategory, showAnalysisModal, showChat) تبقى كما هي في كودك الأصلي ... */}

    </div>
  );
};

const styles = {
  appContainer: { minHeight: '100vh', background: '#fff9fb', padding: '20px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { color: '#f06292', fontSize: '2.5rem', marginBottom: '5px' },
  subtitle: { color: '#888', fontStyle: 'italic', marginTop: '10px' },

  // البوصلة الكبيرة في المنتصف
  qiblaMainHero: { display: 'flex', justifyContent: 'center', margin: '30px 0' },
  qiblaGlassCard: {
      width: '320px',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(15px)',
      borderRadius: '40px',
      padding: '30px',
      boxShadow: '0 20px 40px rgba(240, 98, 146, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
  },
  qiblaCompassWrapper: {
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      background: '#fff',
      position: 'relative',
      boxShadow: 'inset 0 0 15px rgba(0,0,0,0.05)',
      border: '8px solid #fce4ec',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
  },
  qiblaRotatingFrame: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'transform 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67)'
  },
  kaabaHeroIcon: {
      width: '60px',
      height: '60px',
      marginTop: '-110px', // وضع الكعبة في طرف الدائرة العلوي
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
  },
  qiblaPointerLine: {
      position: 'absolute',
      top: '20px',
      width: '2px',
      height: '80px',
      background: 'linear-gradient(to top, transparent, #f06292)',
  },
  compassStaticMarks: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      color: '#ce93d8'
  },
  qiblaInfoFooter: { marginTop: '20px', textAlign: 'center', width: '100%' },
  qiblaBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      background: '#fce4ec',
      color: '#f06292',
      padding: '5px 15px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 'bold'
  },
  azanTriggerBtn: {
      width: '100%',
      marginTop: '15px',
      padding: '12px',
      borderRadius: '15px',
      border: 'none',
      background: 'linear-gradient(135deg, #f06292, #ba68c8)',
      color: '#white',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
      boxShadow: '0 5px 15px rgba(240, 98, 146, 0.3)'
  },

  // ستايل مودال مواقيت الصلاة (الشكل الكلاسيكي)
  prayerModalOverlay: { position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' },
  prayerClockCard: {
      width: '320px',
      background: '#fff5e6', // لون بيج دافئ مثل الصورة
      borderRadius: '20px',
      border: '5px solid #8d6e63',
      padding: '15px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  },
  prayerCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #8d6e63', paddingBottom: '10px' },
  hijriDate: { fontSize: '1.2rem', fontWeight: 'bold', color: '#5d4037' },
  prayerDigitalDisplay: { textAlign: 'center', padding: '15px 0', borderBottom: '2px solid #8d6e63' },
  mainTimer: { fontSize: '2.5rem', fontWeight: 'bold', color: '#d32f2f', fontFamily: 'monospace' },
  subTimer: { fontSize: '0.9rem', color: '#5d4037', fontWeight: 'bold' },
  prayerGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '15px 0' },
  prayerSlot: { 
      padding: '10px 5px', 
      borderRadius: '8px', 
      border: '1px solid #8d6e63', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
  },
  slotName: { fontSize: '0.8rem', color: '#5d4037', fontWeight: 'bold' },
  slotTime: { fontSize: '1rem', color: '#d32f2f', fontWeight: 'bold' },
  prayerFooter: { paddingTop: '10px', borderTop: '2px solid #8d6e63', display: 'flex', justifyContent: 'center' },
  audioToggle: { background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' },

  // ستايلات القائمة (كما كانت)
  chatHeaderBtn: { background: '#f06292', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' },
  azharHeaderBtn: { background: '#00897b', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', maxWidth: '1200px', margin: '0 auto' },
  column: { background: 'rgba(240, 98, 146, 0.05)', padding: '15px', borderRadius: '25px' },
  menuItem: { background: 'white', padding: '18px', marginBottom: '12px', borderRadius: '20px', display: 'flex', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' },
  iconWrapper: { color: '#f06292', marginLeft: '12px' },
  menuText: { fontWeight: 'bold', color: '#444' }
};

export default RaqqaApp;
