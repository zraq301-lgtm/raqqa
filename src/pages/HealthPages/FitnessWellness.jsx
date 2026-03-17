import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { LocalNotifications } from '@capacitor/local-notifications'; // لإرسال تنبيه محلي بصوت المنبه
import alarmSound from 'src/assets/fine-alarm.mp3'; 

// --- مكون الساعة المطور (طراز Fitness Watch) ---
const AnalogClock = memo(() => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hoursDeg = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;
  const minutesDeg = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360;
  const secondsDeg = (time.getSeconds() / 60) * 360;

  return (
    <div style={clockStyles.outerRing}>
      <div style={clockStyles.clockFace}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{...clockStyles.tick, transform: `rotate(${i * 30}deg)`}} />
        ))}
        <span style={{...clockStyles.num, top: '10px', left: '50%', transform: 'translateX(-50%)'}}>12</span>
        <span style={{...clockStyles.num, bottom: '10px', left: '50%', transform: 'translateX(-50%)'}}>6</span>
        <span style={{...clockStyles.num, left: '10px', top: '50%', transform: 'translateY(-50%)'}}>9</span>
        <span style={{...clockStyles.num, right: '10px', top: '50%', transform: 'translateY(-50%)'}}>3</span>
        
        <div style={{ ...clockStyles.handHour, transform: `translateX(-50%) rotate(${hoursDeg}deg)` }} />
        <div style={{ ...clockStyles.handMinute, transform: `translateX(-50%) rotate(${minutesDeg}deg)` }} />
        <div style={{ ...clockStyles.handSecond, transform: `translateX(-50%) rotate(${secondsDeg}deg)` }} />
        <div style={clockStyles.centerDot} />
      </div>
    </div>
  );
});

const sections = [
  { id: "bio", title: "القياسات الحيوية", emoji: "📏", fields: ["الوزن الحالي", "نسبة الدهون", "محيط الخصر", "محيط الورك", "BMI", "نسبة العضلات"] },
  { id: "fit", title: "النشاط البدني", emoji: "🏃‍♀️", fields: ["نوع التمرين", "مدة التمرين", "عدد الخطوات", "السعرات", "مستوى الشدة", "وقت التمرين"] },
  { id: "food", title: "التغذية الصحية", emoji: "🥗", fields: ["السعرات", "البروتين", "الألياف", "الدهون الصحية", "الكربوهيدرات", "جودة الأكل"] },
  { id: "water", title: "الهيدرات والماء", emoji: "💧", fields: ["كمية الماء", "مواعيد الشرب", "أعشاب", "ديتوكس", "الترطيب", "تجنب السكر"] },
  { id: "sleep", title: "جودة النوم", emoji: "😴", fields: ["ساعات النوم", "الاستيقاظ", "الجودة", "الاسترخاء", "الكافيين", "القيلولة"] },
  { id: "mind", title: "الصحة النفسية", emoji: "🧠", fields: ["التوتر", "التنفس", "المزاج", "الدافعية", "التأمل", "عادات إيجابية"] },
  { id: "beauty", title: "المكملات والجمال", emoji: "✨", fields: ["فيتامينات", "جلد", "شعر", "كولاجين", "حرق", "أوميجا 3"] },
  { id: "cycle", title: "الهرمونات والدورة", emoji: "🩸", fields: ["يوم الدورة", "الرغبة", "الاحتباس", "تغير الوزن", "الرياضة", "ألم الجسم"] }
];

const PregnancyMonitor = () => {
  const [openIdx, setOpenIdx] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem('roqa_chat_history')) || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showClockSettings, setShowClockSettings] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_fitness')) || {});
  const [alarms, setAlarms] = useState(() => JSON.parse(localStorage.getItem('roqa_alarms')) || {});

  // مرجع الصوت
  const audioRef = useRef(new Audio(alarmSound));

  useEffect(() => {
    localStorage.setItem('roqa_alarms', JSON.stringify(alarms));
    localStorage.setItem('roqa_chat_history', JSON.stringify(chatHistory));
  }, [alarms, chatHistory]);

  // --- منطق المنبه: فحص المواعيد وتشغيل الصوت ---
  useEffect(() => {
    const checkAlarms = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      Object.entries(alarms).forEach(([id, time]) => {
        if (time === currentTime && now.getSeconds() === 0) {
          // 1. تشغيل الصوت إذا كان التطبيق مفتوحاً
          audioRef.current.play().catch(e => console.log("Audio play deferred"));
          
          // 2. إرسال إشعار للنظام (يعمل حتى لو التطبيق مغلق)
          const section = sections.find(s => s.id === id);
          LocalNotifications.schedule({
            notifications: [
              {
                title: `حان موعد: ${section?.title || 'تنبيه'} ⏰`,
                body: `عزيزتي، حان وقت تسجيل بيانات ${section?.title}.`,
                id: Math.floor(Math.random() * 1000),
                sound: 'fine_alarm.mp3', // يجب وضع ملف الصوت في المجلدات الأصلية للنظام ليعمل وهو مغلق
                attachments: []
              }
            ]
          });
        }
      });
    }, 1000);

    return () => clearInterval(checkAlarms);
  }, [alarms]);

  const saveAndNotify = async (categoryTitle, currentAnalysis) => {
    const savedToken = localStorage.getItem('fcm_token');
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          fcmToken: savedToken || undefined,
          user_id: 1,
          category: 'medical_report',
          title: `تقرير جديد: ${categoryTitle} 🩺`,
          body: currentAnalysis.substring(0, 100) + "...",
          scheduled_for: new Date().toISOString()
        }
      });

      if (savedToken) {
        await CapacitorHttp.post({
          url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
          headers: { 'Content-Type': 'application/json' },
          data: { token: savedToken, title: 'تنبيه طبي 🔔', body: `تم تحليل بيانات ${categoryTitle}.` }
        });
      }
    } catch (err) { console.error(err); }
  };

  const updateData = useCallback((field, value) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      localStorage.setItem('lady_fitness', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const handleSectionAction = async (section) => {
    setIsLoading(true);
    const sectionData = section.fields.map(f => `${f}: ${data[`${section.id}-${f}`] || 'N/A'}`).join(", ");
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `حللي بيانات ${section.title}: ${sectionData}` }
      });
      const reply = response.data.reply || response.data.message;
      setChatHistory(prev => [{ type: 'ai', text: reply }, ...prev]);
      await saveAndNotify(section.title, reply);
      setIsChatOpen(true);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleAIQuery = async () => {
    if (!prompt.trim() && !capturedImage) return;
    const userMsg = prompt;
    setPrompt("");
    setIsLoading(true);
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: userMsg, image: capturedImage }
      });
      const reply = response.data.reply || response.data.message;
      setChatHistory(prev => [{ type: 'user', text: userMsg, img: capturedImage }, { type: 'ai', text: reply }, ...prev]);
      setCapturedImage(null);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const pickImage = async () => {
    try {
      const image = await Camera.getPhoto({ quality: 90, resultType: 'base64' });
      setCapturedImage(`data:image/jpeg;base64,${image.base64String}`);
    } catch (e) { console.log(e); }
  };

  return (
    <div style={mergedStyles.container}>
      <div style={mergedStyles.clockSection}>
        <AnalogClock />
        <button style={mergedStyles.miniClockBtn} onClick={() => setShowClockSettings(!showClockSettings)}>
          {showClockSettings ? "إغلاق الضبط" : "ضبط المواعيد ⏰"}
        </button>
        {showClockSettings && (
          <div style={mergedStyles.alarmList}>
            {sections.map(s => (
              <div key={s.id} style={mergedStyles.alarmItem}>
                <span>{s.emoji} {s.title}</span>
                <input type="time" value={alarms[s.id] || ''} onChange={(e) => setAlarms({...alarms, [s.id]: e.target.value})} />
              </div>
            ))}
          </div>
        )}
      </div>

      <button style={mergedStyles.openChatBtn} onClick={() => setIsChatOpen(true)}>
        💬 تحدث مع طبيبة رقة الذكية
      </button>

      {isChatOpen && (
        <div style={mergedStyles.chatOverlay}>
          <div style={mergedStyles.chatCard}>
            <div style={mergedStyles.chatHeader}>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <div style={mergedStyles.statusDot}></div>
                <span>👩‍⚕️ طبيبة رقة الذكية</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} style={mergedStyles.closeBtn}>✕</button>
            </div>

            <div style={mergedStyles.chatBody}>
              {chatHistory.map((msg, index) => (
                <div key={index} style={msg.type === 'user' ? mergedStyles.userMsg : mergedStyles.aiMsg}>
                  {msg.img && <img src={msg.img} alt="uploaded" style={mergedStyles.chatImg} />}
                  {msg.text}
                </div>
              ))}
              {isLoading && <div style={mergedStyles.aiMsg}>جاري التحليل... ✨</div>}
            </div>

            <div style={mergedStyles.chatFooter}>
              {capturedImage && (
                <div style={mergedStyles.previewWrapper}>
                  <img src={capturedImage} style={mergedStyles.miniPreview} />
                  <button onClick={() => setCapturedImage(null)} style={mergedStyles.removeImg}>✕</button>
                </div>
              )}
              <div style={mergedStyles.chatInputRow}>
                <button onClick={pickImage} style={mergedStyles.iconBtn}>📷</button>
                <input 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  placeholder="اسألي طبيبتك..." 
                  style={mergedStyles.chatInput}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()}
                />
                <button onClick={handleAIQuery} style={mergedStyles.sendBtn} disabled={isLoading}>
                  {isLoading ? '...' : '➔'} 
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={mergedStyles.accordion}>
        {sections.map((sec, i) => (
          <div key={sec.id} style={mergedStyles.sectionCard}>
            <div style={mergedStyles.sectionHeader} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span>{sec.emoji} {sec.title}</span>
              <span>{openIdx === i ? '▲' : '▼'}</span>
            </div>
            {openIdx === i && (
              <div style={mergedStyles.verticalList}>
                {sec.fields.map((f) => (
                  <div key={`${sec.id}-${f}`} style={mergedStyles.inputGroup}>
                    <label style={mergedStyles.label}>{f}</label>
                    <input type="text" style={mergedStyles.input} value={data[`${sec.id}-${f}`] || ''} onChange={(e) => updateData(`${sec.id}-${f}`, e.target.value)} />
                  </div>
                ))}
                <button style={mergedStyles.saveSectionBtn} onClick={() => handleSectionAction(sec)} disabled={isLoading}>
                   {isLoading ? "جاري التحليل..." : "حفظ وتحليل البيانات 💾"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- الستايلات (مع الحفاظ على ثبات سهم الإرسال) ---
const clockStyles = {
  outerRing: { width: '160px', height: '160px', borderRadius: '50%', background: 'linear-gradient(135deg, #f06292, #f8bbd0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' },
  clockFace: { width: '140px', height: '140px', borderRadius: '50%', background: '#fff', position: 'relative', overflow: 'hidden' },
  tick: { position: 'absolute', width: '2px', height: '8px', background: '#f8bbd0', left: '50%', transformOrigin: '0 70px' },
  num: { position: 'absolute', fontSize: '12px', fontWeight: 'bold', color: '#880e4f' },
  handHour: { position: 'absolute', bottom: '50%', left: '50%', width: '5px', height: '35px', background: '#4a148c', transformOrigin: 'bottom center', borderRadius: '5px' },
  handMinute: { position: 'absolute', bottom: '50%', left: '50%', width: '3px', height: '50px', background: '#ad1457', transformOrigin: 'bottom center', borderRadius: '3px' },
  handSecond: { position: 'absolute', bottom: '50%', left: '50%', width: '1px', height: '55px', background: '#e91e63', transformOrigin: 'bottom center' },
  centerDot: { position: 'absolute', top: '50%', left: '50%', width: '10px', height: '10px', background: '#4a148c', borderRadius: '50%', transform: 'translate(-50%, -50%)', border: '2px solid white' },
};

const mergedStyles = {
  container: { background: '#fdfbff', padding: '15px', direction: 'rtl', minHeight: '100vh' },
  clockSection: { background: 'white', padding: '20px', borderRadius: '30px', textAlign: 'center', marginBottom: '20px' },
  miniClockBtn: { background: '#f06292', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', fontSize: '13px' },
  alarmList: { marginTop: '15px', background: '#fff0f5', padding: '10px', borderRadius: '15px' },
  alarmItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' },
  openChatBtn: { width: '100%', background: 'linear-gradient(45deg, #7b1fa2, #9c27b0)', color: 'white', padding: '18px', borderRadius: '20px', border: 'none', fontWeight: 'bold', marginBottom: '20px' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chatCard: { width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' },
  chatHeader: { background: '#7b1fa2', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between' },
  statusDot: { width: '10px', height: '10px', background: '#4caf50', borderRadius: '50%' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '24px' },
  chatBody: { flex: 1, padding: '20px', overflowY: 'auto', background: '#f9f9f9', display: 'flex', flexDirection: 'column-reverse', gap: '15px' },
  userMsg: { alignSelf: 'flex-start', background: '#e1bee7', padding: '12px', borderRadius: '15px', maxWidth: '85%' },
  aiMsg: { alignSelf: 'flex-end', background: '#fff', padding: '12px', borderRadius: '15px', maxWidth: '85%', border: '1px solid #eee' },
  chatImg: { width: '100%', borderRadius: '10px' },
  chatFooter: { padding: '15px', background: 'white', borderTop: '1px solid #eee' },
  chatInputRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  chatInput: { flex: 1, padding: '12px', borderRadius: '25px', border: '1.5px solid #e1bee7', outline: 'none' },
  iconBtn: { background: '#f3e5f5', border: 'none', borderRadius: '50%', width: '40px', height: '40px' },
  sendBtn: { background: '#ffd54f', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', color: '#4a148c', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  previewWrapper: { position: 'relative', width: '60px', marginBottom: '10px' },
  miniPreview: { width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' },
  removeImg: { position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px' },
  sectionCard: { background: '#fff', borderRadius: '20px', marginBottom: '15px', border: '1px solid #f3e5f5' },
  sectionHeader: { padding: '18px 20px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' },
  verticalList: { padding: '20px', background: '#fffafb', display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '13px', color: '#7b1fa2' },
  input: { padding: '12px', borderRadius: '12px', border: '1px solid #ddd' },
  saveSectionBtn: { background: '#4a148c', color: 'white', border: 'none', padding: '15px', borderRadius: '15px' }
};

export default PregnancyMonitor;
