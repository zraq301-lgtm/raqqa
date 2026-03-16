import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { Motion } from '@capacitor/motion';
import { 
  Sparkles, Heart, Moon, BookOpen, Activity, 
  ShieldCheck, Users, ShieldAlert, Wind, Gift, 
  Clock, Brain, Flower2, Coins, Hourglass, 
  Camera, Mic, Image, Trash2, X, MapPin, MessageCircle, Bookmark, List,
  CheckCircle2, CircleOff, Star, Droplets, Bath, Smile, Sun, Utensils, 
  Baby, GraduationCap, Zap, Coffee, Shield, Check, Minus, Compass, Volume2, VolumeX
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
            const timings = pData.data.timings;
            setPrayerTimes(timings);
            
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
    return () => {
      if (handler) {
        handler.remove();
      }
    };
  }, []);

  const calculateQiblaRotation = () => {
    return qiblaDirection;
  };

  useEffect(() => {
    const checkAzanAndNextPrayer = () => {
      if (!prayerTimes) return;

      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                          now.getMinutes().toString().padStart(2, '0');

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

  const saveAndNotify = async (categoryTitle, currentAnalysis) => {
    const savedToken = localStorage.getItem('fcm_token');
    const scheduledDate = new Date();
    scheduledDate.setHours(scheduledDate.getHours() + 72); 

    try {
      const saveToNeonOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          fcmToken: savedToken || undefined,
          user_id: 1,
          category: 'spiritual_report',
          title: `تحليل جديد: ${categoryTitle} ✨`,
          body: currentAnalysis.substring(0, 100) + "...",
          scheduled_for: scheduledDate.toISOString(),
          note: `تحليل رقة لـ ${categoryTitle}`
        }
      };
      await CapacitorHttp.post(saveToNeonOptions);

      if (savedToken) {
        const fcmOptions = {
          url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
          headers: { 'Content-Type': 'application/json' },
          data: {
            token: savedToken,
            title: 'رسالة من رقة 🔔',
            body: `رفيقتي، تم إعداد تحليلك الروحاني بخصوص ${categoryTitle}.`,
            data: { type: 'spiritual_report' }
          }
        };
        await CapacitorHttp.post(fcmOptions);
      }
    } catch (err) {
      console.error("خطأ في عملية المزامنة:", err);
    }
  };

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
      
      if (activeCategory) {
        await saveAndNotify(activeCategory.title, responseText);
      }

      if (!directMsg) setShowAnalysisModal(true);
    } catch (err) {
      console.error("فشل الاتصال:", err);
      setAiResponse("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت 🌸");
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = async (type) => {
    try {
      setLoading(true);
      let base64;
      if (type === 'camera') base64 = await takePhoto();
      else base64 = await fetchImage();

      if (base64) {
        const fileName = `raqqa_${Date.now()}.jpg`;
        const fileUrl = await uploadToVercel(base64, fileName, 'image/jpeg');
        const msg = `لقد أرسلت صورة لكِ للمساعدة في التحليل: ${fileUrl}`;
        setHistory(prev => [{ role: 'user', text: "تم رفع صورة 📸" }, ...prev]);
        handleProcess(msg);
      }
    } catch (err) {
      alert("فشل رفع الصورة: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      
      <header style={styles.header}>
        <h1 style={styles.title}>رقة ✨</h1>

        {/* الكارت المطور لركن العبادة */}
        <div style={styles.religiousInfoBar}>
          
          {/* قسم الصلاة القادمة */}
          <div style={styles.advancedAzanClock}>
            <div style={styles.azanMainTime}>
              <Clock size={16} color="#f06292" style={{marginLeft: '4px'}} />
              <span style={styles.azanNextLabel}>القادمة:</span>
              <span style={styles.azanNextName}>{nextPrayer.name}</span>
            </div>
            <div style={styles.azanTimeDigital}>{nextPrayer.time}</div>
            <button 
              style={{...styles.azanToggleBtn, color: isAzanEnabled ? '#f06292' : '#bbb'}} 
              onClick={() => {
                setIsAzanEnabled(!isAzanEnabled);
                if (isAzanEnabled) audioRef.current.pause();
              }}
            >
              {isAzanEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>

          {/* قسم القبلة الكبير والمطور */}
          <div style={styles.qiblaContainerLarge}>
            <div style={styles.qiblaClockFaceLarge}>
              <div style={{...styles.qiblaClockFrame, transform: `rotate(${-phoneHeading}deg)`}}>
                <div style={{...styles.directionMark, top: '5px', left: '50%', transform: 'translateX(-50%)'}}>N</div>
                <div style={{...styles.directionMark, bottom: '5px', left: '50%', transform: 'translateX(-50%)'}}>S</div>
                <div style={{...styles.directionMark, right: '5px', top: '50%', transform: 'translateY(-50%)'}}>E</div>
                <div style={{...styles.directionMark, left: '5px', top: '50%', transform: 'translateY(-50%)'}}>W</div>
                
                <div style={{...styles.qiblaHand, transform: `rotate(${calculateQiblaRotation()}deg)`}}>
                  <img 
                    src="/assets/Kaaba.png" 
                    alt="Kaaba" 
                    style={styles.kaabaImageLarge}
                    onError={(e) => {
                      e.target.style.display = 'none'; 
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <span style={{...styles.kaabaTextFallbackLarge, display: 'none'}}>🕋</span>
                </div>
              </div>
            </div>
            <div style={styles.qiblaDataOverlay}>
               <span style={styles.topBarLabel}>درجة القبلة</span>
               <span style={styles.topBarValueLarge}>{Math.round(qiblaDirection)}°</span>
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

      {activeCategory && (
        <>
          <div style={styles.overlay} onClick={() => setActiveCategory(null)} />
          <div style={styles.activeCard}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>{activeCategory.title}</h2>
              <X style={{cursor: 'pointer'}} onClick={() => setActiveCategory(null)} />
            </div>
            <div style={{marginTop: '10px'}}>
              <input 
                style={styles.promptInput} 
                placeholder="أضيفي ملاحظة خاصة للذكاء الاصطناعي (اختياري)..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </div>
            <div style={styles.inputsList}>
              {activeCategory.items.map((item, idx) => (
                <div key={idx} style={styles.inputStrip}>
                  <div style={styles.stripLabelRow}>
                    <span style={styles.itemIcon}>{item.i}</span>
                    <span style={styles.label}>{item.n}</span>
                  </div>
                  <div style={styles.btnGroup}>
                    <button 
                      onClick={() => setInputs({...inputs, [item.n]: 'yes'})}
                      style={{...styles.toggleBtn, backgroundColor: inputs[item.n] === 'yes' ? '#4caf50' : '#fff', color: inputs[item.n] === 'yes' ? '#fff' : '#888', borderColor: inputs[item.n] === 'yes' ? '#4caf50' : '#ddd'}}
                    >نعم</button>
                    <button 
                      onClick={() => setInputs({...inputs, [item.n]: 'no'})}
                      style={{...styles.toggleBtn, backgroundColor: inputs[item.n] === 'no' ? '#f06292' : '#fff', color: inputs[item.n] === 'no' ? '#fff' : '#888', borderColor: inputs[item.n] === 'no' ? '#f06292' : '#ddd'}}
                    >لا</button>
                  </div>
                </div>
              ))}
            </div>
            <button style={styles.submitBtn} onClick={() => handleProcess()} disabled={loading}>
              {loading ? "جاري التحليل الروحاني..." : "حفظ وتحليل بالذكاء الصناعي ✨"}
            </button>
          </div>
        </>
      )}

      {showAnalysisModal && (
        <div style={styles.chatModal}>
          <div style={styles.chatContent}>
            <div style={styles.chatHeader}>
              <X onClick={() => setShowAnalysisModal(false)} style={{cursor: 'pointer'}} />
              <span style={{fontWeight: 'bold'}}>تحليل رقة الروحاني</span>
              <div style={{width: 20}}></div> 
            </div>
            <div style={styles.chatHistory}>
               <div style={styles.aiMsg}>
                    {aiResponse}
                    <Bookmark size={14} onClick={() => {setSavedReplies([...savedReplies, aiResponse]); alert("تم الحفظ!");}} style={styles.saveIcon} />
               </div>
            </div>
            <div style={styles.chatFooter}>
               <button style={styles.submitBtn} onClick={() => setShowAnalysisModal(false)}>شكراً رقة ✨</button>
            </div>
          </div>
        </div>
      )}

      {showChat && (
        <div style={styles.chatModal}>
          <div style={styles.chatContent}>
            <div style={styles.chatHeader}>
              <X onClick={() => setShowChat(false)} style={{cursor: 'pointer'}} />
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span>دردشة رقة</span>
                <List size={18} onClick={() => setShowSavedList(!showSavedList)} style={{cursor: 'pointer'}} />
              </div>
              <Trash2 size={18} onClick={() => setHistory([])} style={{cursor: 'pointer'}} />
            </div>
            {showSavedList ? (
              <div style={styles.savedArea}>
                <h4 style={{textAlign:'center', color:'#f06292'}}>المحفوظات 🌸</h4>
                {savedReplies.map((r, i) => (
                  <div key={i} style={styles.savedItem}>
                    <p>{r}</p>
                    <Trash2 size={14} onClick={() => {const newList = [...savedReplies]; newList.splice(i, 1); setSavedReplies(newList);}} style={{color: 'red', cursor: 'pointer', marginTop: '5px'}} />
                  </div>
                ))}
                <button onClick={() => setShowSavedList(false)} style={styles.backBtn}>العودة للدردشة</button>
              </div>
            ) : (
              <div style={styles.chatHistory}>
                {history.map((msg, idx) => (
                  <div key={idx} style={msg.role === 'ai' ? styles.aiMsg : styles.userMsg}>
                    {msg.text}
                    {msg.role === 'ai' && <Bookmark size={14} onClick={() => setSavedReplies([...savedReplies, msg.text])} style={styles.saveIcon} />}
                  </div>
                ))}
                {loading && <p style={{textAlign:'center', fontSize: '0.8rem'}}>جاري معالجة طلبك...</p>}
              </div>
            )}
            <div style={styles.chatFooter}>
              <div style={styles.mediaRow}>
                <button style={styles.iconBtn} onClick={() => handleMediaUpload('camera')}><Camera size={20}/></button>
                <button style={styles.iconBtn} onClick={() => alert("الميكروفون قيد التطوير")}><Mic size={20}/></button>
                <button style={styles.iconBtn} onClick={() => handleMediaUpload('gallery')}><Image size={20}/></button>
              </div>
              <div style={styles.inputRow}>
                <input style={styles.chatInput} placeholder="اسألي رقة..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} />
                <button style={styles.sendBtn} onClick={() => { if(!chatMessage) return; setHistory([{role:'user', text:chatMessage}, ...history]); handleProcess(chatMessage); setChatMessage(""); }}>إرسال</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// الستايلات المحدثة لتعطي شكل الكارت العصري والبوصلة الكبيرة
const styles = {
  appContainer: { minHeight: '100vh', background: '#fdfcfb', padding: '20px', pt: '10px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' },
  
  // الكارت العصري الجديد (Glassmorphism effect)
  religiousInfoBar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    gap: '15px', 
    margin: '20px auto', 
    padding: '20px', 
    maxWidth: '550px', 
    background: 'rgba(255, 255, 255, 0.7)', 
    backdropFilter: 'blur(10px)',
    borderRadius: '24px', 
    border: '1px solid rgba(240, 98, 146, 0.2)',
    boxShadow: '0 8px 32px rgba(240, 98, 146, 0.1)'
  },

  advancedAzanClock: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    padding: '12px', 
    background: '#fff', 
    borderRadius: '18px', 
    border: '1px solid #fce4ec',
    flex: 1
  },
  azanMainTime: { display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: '#666', marginBottom: '4px' },
  azanNextLabel: { marginLeft: '3px' },
  azanNextName: { fontWeight: 'bold', color: '#f06292' },
  azanTimeDigital: { fontSize: '1.6rem', fontWeight: 'bold', color: '#444', margin: '4px 0' },
  azanToggleBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px' },

  // البوصلة الكبيرة (أكبر 3 مرات)
  qiblaContainerLarge: { 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    gap: '10px',
    flex: 1.5
  },
  qiblaClockFaceLarge: { 
    width: '140px', 
    height: '140px', 
    background: '#fff', 
    borderRadius: '50%', 
    border: '4px solid #fce4ec', 
    position: 'relative', 
    overflow: 'hidden', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.05), inset 0 2px 10px rgba(0,0,0,0.05)' 
  },
  qiblaClockFrame: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, transition: 'transform 0.3s ease-out' },
  directionMark: { position: 'absolute', fontSize: '0.7rem', color: '#f06292', fontWeight: 'bold', opacity: 0.6 },
  qiblaHand: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, transformOrigin: '50% 50%', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  kaabaImageLarge: { width: '45px', height: '45px', marginTop: '-85px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' },
  kaabaTextFallbackLarge: { fontSize: '2.5rem', marginTop: '-85px' },
  
  qiblaDataOverlay: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  topBarLabel: { fontSize: '0.75rem', color: '#999', fontWeight: '500' },
  topBarValueLarge: { fontSize: '1.2rem', fontWeight: 'bold', color: '#f06292' },

  header: { textAlign: 'center', marginBottom: '30px' },
  title: { color: '#f06292', fontSize: '2.5rem', marginBottom: '5px' },
  subtitle: { color: '#888', fontStyle: 'italic', marginTop: '10px' },
  headerActions: { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px', flexWrap: 'wrap' },
  chatHeaderBtn: { background: '#f06292', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' },
  azharHeaderBtn: { background: '#00897b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textDecoration: 'none', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', maxWidth: '1200px', margin: '0 auto' },
  column: { background: 'rgba(240, 98, 146, 0.03)', padding: '15px', borderRadius: '20px' },
  menuItem: { background: 'white', padding: '15px', marginBottom: '10px', borderRadius: '15px', display: 'flex', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  iconWrapper: { color: '#f06292', marginLeft: '12px' },
  menuText: { fontWeight: 'bold', color: '#444' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10, backdropFilter: 'blur(4px)' },
  activeCard: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '550px', maxHeight: '85vh', background: 'white', borderRadius: '25px', padding: '25px', zIndex: 11, overflowY: 'auto' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px', alignItems: 'center' },
  cardTitle: { color: '#f06292', margin: 0, fontSize: '1.2rem' },
  promptInput: { width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #fce4ec', background: '#fff9fb', fontSize: '0.85rem' },
  inputsList: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' },
  inputStrip: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: '#fff5f8', borderRadius: '15px', border: '1px solid #fce4ec' },
  stripLabelRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  itemIcon: { color: '#f06292' },
  label: { fontSize: '0.9rem', color: '#444', fontWeight: '500' },
  btnGroup: { display: 'flex', gap: '5px' },
  toggleBtn: { padding: '5px 12px', borderRadius: '10px', border: '1px solid #ddd', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' },
  submitBtn: { width: '100%', padding: '15px', background: '#f06292', color: 'white', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  chatModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  chatContent: { width: '90%', maxWidth: '450px', height: '80vh', background: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { padding: '15px', background: '#f06292', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatHistory: { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  aiMsg: { alignSelf: 'flex-start', background: '#fce4ec', padding: '15px', borderRadius: '12px 12px 12px 0', maxWidth: '85%', position: 'relative', lineHeight: '1.6', fontSize: '0.9rem', color: '#444' },
  userMsg: { alignSelf: 'flex-end', background: '#eee', padding: '10px', borderRadius: '12px 12px 0 12px', maxWidth: '85%', fontSize: '0.9rem' },
  saveIcon: { position: 'absolute', bottom: '-20px', left: '0', color: '#f06292', cursor: 'pointer' },
  chatFooter: { padding: '15px', borderTop: '1px solid #eee' },
  mediaRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  inputRow: { display: 'flex', gap: '10px' },
  chatInput: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' },
  sendBtn: { background: '#f06292', color: 'white', border: 'none', padding: '0 15px', borderRadius: '20px', cursor: 'pointer' },
  iconBtn: { border: 'none', background: '#f8f9fa', color: '#f06292', padding: '8px', borderRadius: '50%', cursor: 'pointer' },
  savedArea: { flex: 1, padding: '15px', overflowY: 'auto' },
  savedItem: { background: '#fdf2f8', padding: '10px', borderRadius: '10px', marginBottom: '8px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  backBtn: { width: '100%', padding: '10px', background: '#f06292', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' },
};

export default RaqqaApp;
