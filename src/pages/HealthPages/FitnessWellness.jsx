import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage } from '../../services/MediaService';

// استيراد الصوت من المسار الصحيح
import alarmSound from '../../assets/fine-alarm.mp3';

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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showClockSettings, setShowClockSettings] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_fitness')) || {});
  const [alarms, setAlarms] = useState(() => JSON.parse(localStorage.getItem('roqa_alarms')) || {});

  const audioRef = useRef(new Audio(alarmSound));

  // تحديث وقت الساعة
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // فحص المنبهات وتشغيل الصوت
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const hasAlarm = Object.values(alarms).some(time => time === currentStr);
      const hasInputTime = Object.values(data).some(val => val === currentStr);

      if ((hasAlarm || hasInputTime) && now.getSeconds() === 0) {
        audioRef.current.play().catch(e => console.log("تفاعل مع الصفحة لتفعيل الصوت"));
      }
    };
    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [alarms, data]);

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
        data: { title, body, to: localStorage.getItem('fcm_token') }
      });
    } catch (e) { console.error("Firebase Error", e); }
  };

  const handleSectionAction = async (section) => {
    setIsLoading(true);
    const sectionData = section.fields.map(f => `${f}: ${data[`${section.id}-${f}`] || 'N/A'}`).join(", ");
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `حللي هذه البيانات: ${sectionData}` }
      });
      const reply = response.data.reply || response.data.message;
      setChatHistory([{ type: 'ai', text: reply }, ...chatHistory]);
      await sendFirebaseNotification(`تحديث ${section.title}`, "تم تحليل بياناتك بنجاح");
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleAIQuery = async () => {
    if (!prompt) return;
    setIsLoading(true);
    const userMsg = prompt;
    setPrompt(""); // مسح الشريط فوراً لتسهيل الكتابة التالية
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: userMsg, image: capturedImage }
      });
      const reply = response.data.reply || response.data.message;
      setChatHistory([{ type: 'user', text: userMsg }, { type: 'ai', text: reply }, ...chatHistory]);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const hoursDeg = ((currentTime.getHours() % 12 + currentTime.getMinutes() / 60) / 12) * 360;
  const minutesDeg = ((currentTime.getMinutes() + currentTime.getSeconds() / 60) / 60) * 360;
  const secondsDeg = (currentTime.getSeconds() / 60) * 360;

  return (
    <div style={mergedStyles.container}>
      {/* الساعة */}
      <div style={mergedStyles.clockSection}>
        <div style={mergedStyles.clockFace}>
          <div style={{...mergedStyles.handHour, transform: `translateX(-50%) rotate(${hoursDeg}deg)`}} />
          <div style={{...mergedStyles.handMinute, transform: `translateX(-50%) rotate(${minutesDeg}deg)`}} />
          <div style={{...mergedStyles.handSecond, transform: `translateX(-50%) rotate(${secondsDeg}deg)`}} />
          <div style={mergedStyles.centerDot} />
        </div>
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

      {/* زر فتح الشات */}
      <button style={mergedStyles.openChatBtn} onClick={() => setIsChatOpen(true)}>
        💬 تحدث مع طبيبة رقة الذكية
      </button>

      {/* كارت الشات المنبثق */}
      {isChatOpen && (
        <div style={mergedStyles.chatOverlay}>
          <div style={mergedStyles.chatCard}>
            <div style={mergedStyles.chatHeader}>
              <span>👩‍⚕️ طبيبة رقة</span>
              <button onClick={() => setIsChatOpen(false)} style={{background:'none', border:'none', color:'white', fontSize:'1.2rem'}}>✕</button>
            </div>
            
            <div style={mergedStyles.chatBody}>
              {chatHistory.map((msg, index) => (
                <div key={index} style={msg.type === 'user' ? mergedStyles.userMsg : mergedStyles.aiMsg}>
                  {msg.text}
                </div>
              ))}
            </div>

            <div style={mergedStyles.chatFooter}>
              {capturedImage && <img src={capturedImage} style={mergedStyles.miniPreview} alt="upload" />}
              <div style={mergedStyles.chatInputRow}>
                <button onClick={async () => setCapturedImage(await takePhoto())} style={mergedStyles.iconBtn}>📸</button>
                <button onClick={async () => setCapturedImage(await fetchImage())} style={mergedStyles.iconBtn}>🖼️</button>
                <input 
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  placeholder="اكتبي سؤالك..." 
                  style={mergedStyles.chatInput}
                />
                <button onClick={handleAIQuery} style={mergedStyles.sendBtn}>{isLoading ? "..." : "إرسال"}</button>
              </div>
              <button onClick={() => setChatHistory([])} style={mergedStyles.clearBtn}>مسح السجل</button>
            </div>
          </div>
        </div>
      )}

      {/* الأقسام */}
      <div style={mergedStyles.accordion}>
        {sections.map((sec, i) => (
          <div key={sec.id} style={mergedStyles.sectionCard}>
            <div style={mergedStyles.sectionHeader} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span>{sec.emoji} {sec.title}</span>
              <span>{openIdx === i ? '▴' : '▾'}</span>
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
                   حفظ وإرسال تنبيه 🔔
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const mergedStyles = {
  container: { background: '#f8f0fb', padding: '15px', direction: 'rtl', minHeight: '100vh', fontFamily: 'sans-serif' },
  clockSection: { background: '#fff', borderRadius: '25px', padding: '15px', textAlign: 'center', marginBottom: '15px' },
  clockFace: { width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #ce93d8', margin: '0 auto 10px', position: 'relative' },
  handHour: { position: 'absolute', bottom: '50%', left: '50%', width: '4px', height: '30px', background: '#4a148c', transformOrigin: 'bottom center' },
  handMinute: { position: 'absolute', bottom: '50%', left: '50%', width: '3px', height: '40px', background: '#7b1fa2', transformOrigin: 'bottom center' },
  handSecond: { position: 'absolute', bottom: '50%', left: '50%', width: '1px', height: '45px', background: '#e91e63', transformOrigin: 'bottom center' },
  centerDot: { position: 'absolute', top: '50%', left: '50%', width: '8px', height: '8px', background: '#4a148c', borderRadius: '50%', transform: 'translate(-50%, -50%)' },
  miniClockBtn: { background: '#f06292', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '15px' },
  alarmList: { background: '#f3e5f5', borderRadius: '15px', padding: '10px', marginTop: '10px' },
  alarmItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },

  openChatBtn: { width: '100%', background: '#7b1fa2', color: 'white', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: 'bold', marginBottom: '15px' },
  
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chatCard: { width: '90%', height: '80%', background: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { background: '#7b1fa2', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between' },
  chatBody: { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '10px', background: '#f9f9f9' },
  userMsg: { alignSelf: 'flex-start', background: '#e1bee7', padding: '10px', borderRadius: '10px', maxWidth: '80%' },
  aiMsg: { alignSelf: 'flex-end', background: '#fff', border: '1px solid #ddd', padding: '10px', borderRadius: '10px', maxWidth: '80%' },
  chatFooter: { padding: '10px', borderTop: '1px solid #eee' },
  chatInputRow: { display: 'flex', gap: '5px', alignItems: 'center' },
  chatInput: { flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #ddd' },
  iconBtn: { background: '#f3e5f5', border: 'none', padding: '8px', borderRadius: '50%' },
  sendBtn: { background: '#ffd54f', border: 'none', padding: '10px', borderRadius: '10px' },
  miniPreview: { width: '50px', height: '50px', borderRadius: '5px', marginBottom: '5px' },
  clearBtn: { width: '100%', marginTop: '5px', background: 'none', border: 'none', color: '#999', fontSize: '0.8rem' },

  sectionCard: { background: '#fff', borderRadius: '15px', marginBottom: '10px', border: '1px solid #e1bee7' },
  sectionHeader: { padding: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' },
  verticalList: { padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.8rem', color: '#7b1fa2' },
  input: { padding: '10px', borderRadius: '10px', border: '1px solid #eee' },
  saveSectionBtn: { background: '#4a148c', color: 'white', border: 'none', padding: '10px', borderRadius: '10px' }
};

export default PregnancyMonitor;
