import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage } from '../../services/MediaService';
import alarmSound from '../../assets/fine-alarm.mp3';

// --- مكون الساعة المستقل لمنع إعادة رندرة الصفحة كاملة ---
const AnalogClock = memo(() => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hoursDeg = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;
  const minutesDeg = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360;
  const secondsDeg = (time.getSeconds() / 60) * 360;

  // توليد الأرقام حول الساعة
  const numbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  return (
    <div style={clockStyles.clockFace}>
      {numbers.map((num, i) => (
        <span key={num} style={{
          ...clockStyles.number,
          transform: `rotate(${i * 30}deg) translateY(-40px) rotate(-${i * 30}deg)`
        }}>
          {num}
        </span>
      ))}
      <div style={{ ...clockStyles.handHour, transform: `translateX(-50%) rotate(${hoursDeg}deg)` }} />
      <div style={{ ...clockStyles.handMinute, transform: `translateX(-50%) rotate(${minutesDeg}deg)` }} />
      <div style={{ ...clockStyles.handSecond, transform: `translateX(-50%) rotate(${secondsDeg}deg)` }} />
      <div style={clockStyles.centerDot} />
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

  const audioRef = useRef(new Audio(alarmSound));

  // فحص المنبهات
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (Object.values(alarms).includes(currentStr) && now.getSeconds() === 0) {
        audioRef.current.play().catch(() => {});
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem('roqa_alarms', JSON.stringify(alarms));
    localStorage.setItem('roqa_chat_history', JSON.stringify(chatHistory));
  }, [alarms, chatHistory]);

  const updateData = useCallback((field, value) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      localStorage.setItem('lady_fitness', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const sendFirebaseNotification = async (title, body) => {
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
        headers: { 'Content-Type': 'application/json' },
        data: { title, body, token: localStorage.getItem('fcm_token') }
      });
    } catch (e) { console.error("FCM Error", e); }
  };

  const handleSectionAction = async (section) => {
    setIsLoading(true);
    const sectionData = section.fields.map(f => `${f}: ${data[`${section.id}-${f}`] || 'N/A'}`).join(", ");
    try {
      // 1. الحفظ في نيون
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { section: section.title, content: sectionData }
      });
      // 2. التحليل
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `حللي هذه البيانات الصحية: ${sectionData}` }
      });
      const reply = response.data.reply || response.data.message;
      setChatHistory(prev => [{ type: 'ai', text: reply }, ...prev]);
      // 3. إرسال الإشعار عبر Firebase
      await sendFirebaseNotification(`تحليل ${section.title}`, "تم تحليل بياناتك بنجاح، راجعي الطبيبة الذكية.");
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleAIQuery = async () => {
    if (!prompt.trim()) return;
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
      setChatHistory(prev => [{ type: 'user', text: userMsg }, { type: 'ai', text: reply }, ...prev]);
      setCapturedImage(null);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  return (
    <div style={mergedStyles.container}>
      <div style={mergedStyles.clockSection}>
        <AnalogClock />
        <button style={mergedStyles.miniClockBtn} onClick={() => setShowClockSettings(!showClockSettings)}>
          {showClockSettings ? "إغلاق" : "ضبط المواعيد ⏰"}
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
              <span>👩‍⚕️ طبيبة رقة</span>
              <button onClick={() => setIsChatOpen(false)} style={{background:'none', border:'none', color:'white', fontSize:'1.5rem'}}>✕</button>
            </div>
            <div style={mergedStyles.chatBody}>
              {chatHistory.map((msg, index) => (
                <div key={index} style={msg.type === 'user' ? mergedStyles.userMsg : mergedStyles.aiMsg}>
                  {msg.text}
                </div>
              ))}
              {isLoading && <div style={mergedStyles.aiMsg}>... جاري المعالجة</div>}
            </div>
            <div style={mergedStyles.chatFooter}>
              <div style={mergedStyles.chatInputRow}>
                <button onClick={async () => setCapturedImage(await takePhoto())} style={mergedStyles.iconBtn}>📸</button>
                <input 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  placeholder="اكتبي هنا..." 
                  style={mergedStyles.chatInput}
                />
                <button onClick={handleAIQuery} style={mergedStyles.sendBtn}>إرسال</button>
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
                    <input 
                      type="text" 
                      style={mergedStyles.input} 
                      value={data[`${sec.id}-${f}`] || ''} 
                      onChange={(e) => updateData(`${sec.id}-${f}`, e.target.value)} 
                    />
                  </div>
                ))}
                <button style={mergedStyles.saveSectionBtn} onClick={() => handleSectionAction(sec)} disabled={isLoading}>
                   حفظ وتحليل البيانات 💾
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- الستايلات ---
const clockStyles = {
  clockFace: { width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #f06292', margin: '0 auto 10px', position: 'relative', background: '#fff' },
  number: { position: 'absolute', width: '100%', height: '100%', textAlign: 'center', fontSize: '10px', fontWeight: 'bold', color: '#4a148c', top: '5px' },
  handHour: { position: 'absolute', bottom: '50%', left: '50%', width: '4px', height: '30px', background: '#4a148c', transformOrigin: 'bottom center', borderRadius: '4px' },
  handMinute: { position: 'absolute', bottom: '50%', left: '50%', width: '3px', height: '40px', background: '#7b1fa2', transformOrigin: 'bottom center', borderRadius: '3px' },
  handSecond: { position: 'absolute', bottom: '50%', left: '50%', width: '1px', height: '45px', background: '#e91e63', transformOrigin: 'bottom center' },
  centerDot: { position: 'absolute', top: '50%', left: '50%', width: '8px', height: '8px', background: '#4a148c', borderRadius: '50%', transform: 'translate(-50%, -50%)' },
};

const mergedStyles = {
  container: { background: '#fcf8ff', padding: '15px', direction: 'rtl', minHeight: '100vh', fontFamily: 'sans-serif' },
  clockSection: { background: '#fff', borderRadius: '25px', padding: '15px', textAlign: 'center', marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  miniClockBtn: { background: '#f06292', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '10px', fontSize: '12px' },
  alarmList: { marginTop: '10px', background: '#f3e5f5', padding: '10px', borderRadius: '10px' },
  alarmItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
  openChatBtn: { width: '100%', background: 'linear-gradient(to left, #7b1fa2, #9c27b0)', color: 'white', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: 'bold', marginBottom: '15px' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chatCard: { width: '95%', height: '85%', background: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { background: '#7b1fa2', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between' },
  chatBody: { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '10px' },
  userMsg: { alignSelf: 'flex-start', background: '#e1bee7', padding: '10px', borderRadius: '10px', maxWidth: '80%' },
  aiMsg: { alignSelf: 'flex-end', background: '#f3e5f5', padding: '10px', borderRadius: '10px', maxWidth: '80%', border: '1px solid #d1c4e9' },
  chatFooter: { padding: '10px', borderTop: '1px solid #eee' },
  chatInputRow: { display: 'flex', gap: '5px' },
  chatInput: { flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' },
  iconBtn: { background: '#eee', border: 'none', borderRadius: '50%', padding: '10px' },
  sendBtn: { background: '#ffd54f', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold' },
  sectionCard: { background: '#fff', borderRadius: '15px', marginBottom: '10px', border: '1px solid #f3e5f5' },
  sectionHeader: { padding: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' },
  verticalList: { padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '12px', color: '#7b1fa2', marginBottom: '3px' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #eee', width: '100%', boxSizing: 'border-box' },
  saveSectionBtn: { background: '#4a148c', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold' }
};

export default PregnancyMonitor;
