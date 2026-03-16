import React, { useState, useCallback, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage } from '../../services/MediaService';

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
  const Icon = iconMap.intimacy;
  const [openIdx, setOpenIdx] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showClockSettings, setShowClockSettings] = useState(false);

  // --- إدارة البيانات والمنبهات (LocalStorage) ---
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('lady_fitness');
    return saved ? JSON.parse(saved) : {};
  });

  const [alarms, setAlarms] = useState(() => {
    const savedAlarms = localStorage.getItem('roqa_alarms');
    return savedAlarms ? JSON.parse(savedAlarms) : {};
  });

  // تحديث الساعة كل ثانية
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- إضافة مراقب المنبهات وتشغيل الصوت ---
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      // تنسيق الوقت الحالي ليطابق تنسيق input time (HH:mm)
      const currentStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // التحقق مما إذا كان الوقت الحالي يطابق أي منبه
      Object.values(alarms).forEach(alarmTime => {
        if (alarmTime === currentStr && now.getSeconds() === 0) {
          playAlarmSound();
        }
      });
    };

    const playAlarmSound = () => {
      const audio = new Audio('/assets/fine-alarm.mp3');
      audio.play().catch(e => console.log("تفاعل المستخدم مطلوب لتشغيل الصوت"));
    };

    const alarmInterval = setInterval(checkAlarms, 1000);
    return () => clearInterval(alarmInterval);
  }, [alarms]);

  // حفظ المنبهات عند تغييرها
  useEffect(() => {
    localStorage.setItem('roqa_alarms', JSON.stringify(alarms));
  }, [alarms]);

  // استرجاع سجل الدردشة
  useEffect(() => {
    const savedChats = localStorage.getItem('raqqa_ai_chats');
    if (savedChats) setChatHistory(JSON.parse(savedChats));
  }, []);

  // --- حسابات زوايا الساعة ---
  const secondsDeg = (currentTime.getSeconds() / 60) * 360;
  const minutesDeg = ((currentTime.getMinutes() + currentTime.getSeconds() / 60) / 60) * 360;
  const hoursDeg = ((currentTime.getHours() % 12 + currentTime.getMinutes() / 60) / 12) * 360;

  // --- دالات الأكشن والحفظ ---
  const saveAndNotify = async (categoryTitle, value) => {
    const savedToken = localStorage.getItem('fcm_token');
    const scheduledDate = new Date();
    scheduledDate.setMonth(scheduledDate.getMonth() + 9);
    try {
      const saveToNeonOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { fcmToken: savedToken || undefined, user_id: 1, category: 'medical_report', title: `تحديث بيانات: ${categoryTitle} 🩺`, body: `تم تسجيل قيمة جديدة لـ ${categoryTitle}: ${value}`, scheduled_for: scheduledDate.toISOString(), note: `تحديث يدوي لـ ${categoryTitle}` }
      };
      await CapacitorHttp.post(saveToNeonOptions);
      if (savedToken) {
        await CapacitorHttp.post({
          url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
          headers: { 'Content-Type': 'application/json' },
          data: { token: savedToken, title: 'تحديث في ملفك 🔔', body: `تم حفظ بيانات جديدة لـ ${categoryTitle}.`, data: { type: 'medical_report' } }
        });
      }
    } catch (err) { console.error("Sync Error:", err); }
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
    const sectionData = section.fields.map(f => `${f}: ${data[`${section.id}-${f}`] || 'غير مدخل'}`).join(", ");
    await saveAndNotify(section.title, "تم تحديث القسم بالكامل");
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا طبيبة رقة للرشاقة والتخسيس. حللي هذه البيانات الخاصة بقسم (${section.title}) وقدمي نصيحة طبية سريعة: ${sectionData}` }
      };
      const response = await CapacitorHttp.post(options);
      const reply = response.data.reply || response.data.message;
      setAiResponse(reply);
      setIsChatOpen(true);
      const newChat = { id: Date.now(), query: `تحليل قسم ${section.title}`, reply: reply };
      const updatedHistory = [newChat, ...chatHistory];
      setChatHistory(updatedHistory);
      localStorage.setItem('raqqa_ai_chats', JSON.stringify(updatedHistory));
    } catch (err) { console.error("AI Error:", err); } finally { setIsLoading(false); }
  };

  const handleMediaAction = async (type) => {
    try {
      setIsLoading(true);
      let base64Data = type === 'camera' ? await takePhoto() : await fetchImage();
      if (base64Data) {
        const uploadResponse = await CapacitorHttp.post({
          url: 'https://raqqa-v6cd.vercel.app/api/upload',
          headers: { 'Content-Type': 'application/json' },
          data: { image: base64Data, filename: `lady_fit_${Date.now()}.png` }
        });
        if (uploadResponse.data.url) handleProcessAI(uploadResponse.data.url);
      }
    } catch (error) { console.error("Media error:", error); } finally { setIsLoading(false); }
  };

  const handleProcessAI = async (imageUrl = null) => {
    if (!prompt && !imageUrl) return;
    setIsLoading(true);
    const summary = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(", ");
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة، وهذه بياناتي الصحية: ${summary}. ${imageUrl ? `الصورة: ${imageUrl}` : ''} بصفتك طبيبة متخصصة، حللي: ${prompt}` }
      });
      const reply = response.data.reply || response.data.message;
      const newChat = { id: Date.now(), query: prompt || "تحليل صورة", reply: reply, attachment: imageUrl };
      setChatHistory([newChat, ...chatHistory]);
      localStorage.setItem('raqqa_ai_chats', JSON.stringify([newChat, ...chatHistory]));
      setAiResponse(reply);
      setPrompt("");
    } catch (err) { setAiResponse("عذراً رفيقتي، حدث خطأ."); } finally { setIsLoading(false); }
  };

  const deleteChat = (id) => {
    const filtered = chatHistory.filter(c => c.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('raqqa_ai_chats', JSON.stringify(filtered));
  };

  return (
    <div style={mergedStyles.container}>
      {/* --- قسم الساعة التناظرية (في الأعلى) --- */}
      <div style={mergedStyles.clockSection}>
        <div style={mergedStyles.clockFace}>
          <div style={mergedStyles.hand(hoursDeg, 8, 50, 3)}>
            <img src="/assets/fine-hour.png" alt="hour" style={{ width: '100%' }} />
          </div>
          <div style={mergedStyles.hand(minutesDeg, 6, 70, 2)}>
            <img src="/assets/fine-minute.png" alt="minute" style={{ width: '100%' }} />
          </div>
          <div style={mergedStyles.hand(secondsDeg, 2, 80, 1)}>
            <img src="/assets/fine-second.png" alt="second" style={{ width: '100%' }} />
          </div>
          <div style={mergedStyles.centerDot}></div>
        </div>
        <button style={mergedStyles.miniClockBtn} onClick={() => setShowClockSettings(!showClockSettings)}>
          {showClockSettings ? "إغلاق المنبه" : "ضبط منبه الأنشطة ⏰"}
        </button>
        
        {showClockSettings && (
          <div style={mergedStyles.alarmList}>
            {sections.map(s => (
              <div key={s.id} style={mergedStyles.alarmItem}>
                <span>{s.emoji} {s.title}</span>
                <input 
                  type="time" 
                  value={alarms[s.id] || ''} 
                  onChange={(e) => setAlarms({...alarms, [s.id]: e.target.value})}
                  style={mergedStyles.timeInput}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <button style={mergedStyles.aiMasterButton} onClick={() => setIsChatOpen(true)}>
        <div style={{fontSize: '2rem', marginBottom: '10px'}}>👩‍⚕️</div>
        <div style={{fontSize: '1.3rem', fontWeight: 'bold'}}>طبيبة رقة للرشاقة والتغذية</div>
      </button>

      <div style={mergedStyles.header}>
        <div style={mergedStyles.iconWrapper}><Icon size={28} color="#fff" /></div>
        <h2 style={mergedStyles.title}>متابعة الرشاقة والصحة</h2>
      </div>

      <div style={mergedStyles.accordion}>
        {sections.map((sec, i) => (
          <div key={sec.id} style={mergedStyles.sectionCard}>
            <div style={{...mergedStyles.sectionHeader, borderBottom: openIdx === i ? '1px solid #eee' : 'none'}} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <div style={mergedStyles.sectionTitleGroup}>
                <span style={mergedStyles.emoji}>{sec.emoji}</span>
                <span style={mergedStyles.sectionTitleText}>{sec.title}</span>
              </div>
              <span style={{transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s'}}>▾</span>
            </div>
            <div style={{...mergedStyles.gridContainer, maxHeight: openIdx === i ? '1200px' : '0', opacity: openIdx === i ? 1 : 0}}>
              {sec.fields.map((f) => (
                <div key={`${sec.id}-${f}`} style={mergedStyles.inputGroup}>
                  <label style={mergedStyles.label}>{f}</label>
                  <input style={mergedStyles.input} value={data[`${sec.id}-${f}`] || ''} onChange={(e) => updateData(`${sec.id}-${f}`, e.target.value)} placeholder="..." />
                </div>
              ))}
              <button style={mergedStyles.saveSectionBtn} onClick={() => handleSectionAction(sec)} disabled={isLoading}>
                {isLoading ? "جاري المعالجة..." : `حفظ وتحليل ${sec.title} 🩺`}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isChatOpen && (
        <div style={mergedStyles.chatOverlay}>
          <div style={mergedStyles.chatbox}>
            <div style={mergedStyles.chatHeader}>
              <span>استشارة طبيبة رقة 👩‍⚕️</span>
              <button onClick={() => setIsChatOpen(false)} style={mergedStyles.closeBtn}>✕</button>
            </div>
            <div style={mergedStyles.chatContent}>
              {aiResponse && !isLoading && <div style={mergedStyles.latestReply}><strong>رد الطبيبة:</strong><p>{aiResponse}</p></div>}
              {chatHistory.map(chat => (
                <div key={chat.id} style={mergedStyles.historyCard}>
                   <div style={mergedStyles.historyHeader}>
                      <span><strong>س:</strong> {chat.query}</span>
                      <button style={{color: 'red', border: 'none', background: 'none'}} onClick={() => deleteChat(chat.id)}>حذف 🗑️</button>
                   </div>
                   <div style={{fontSize: '0.8rem', marginTop: '5px'}}><strong>ج:</strong> {chat.reply}</div>
                </div>
              ))}
            </div>
            <div style={mergedStyles.chatFooter}>
              <textarea style={mergedStyles.chatInput} placeholder="اكتبي سؤالك هنا..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />
              <div style={{display: 'flex', gap: '8px', marginTop: '10px'}}>
                <button style={mergedStyles.toolBtn} onClick={() => handleMediaAction('camera')}>📷</button>
                <button style={mergedStyles.toolBtn} onClick={() => handleMediaAction('gallery')}>📁</button>
                <button style={mergedStyles.sendBtn} onClick={() => handleProcessAI()}>إرسال</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
         <button style={mergedStyles.backBtn} onClick={() => window.history.back()}>عودة</button>
      </div>
    </div>
  );
};

const mergedStyles = {
  container: { background: 'linear-gradient(160deg, #fdfbfb 0%, #ebedee 100%)', borderRadius: '30px', padding: '20px', direction: 'rtl', maxWidth: '500px', margin: 'auto', minHeight: '100vh' },
  clockSection: { background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: '25px', padding: '20px', marginBottom: '20px', textAlign: 'center', border: '1px solid #F8BBD0' },
  clockFace: { width: '160px', height: '160px', borderRadius: '50%', background: '#fff', position: 'relative', margin: '0 auto 15px', border: '5px solid #F8BBD0', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)' },
  hand: (deg, width, height, z) => ({ position: 'absolute', bottom: '50%', left: '50%', transformOrigin: 'bottom center', transform: `translateX(-50%) rotate(${deg}deg)`, width: `${width}px`, height: `${height}px`, zIndex: z }),
  centerDot: { position: 'absolute', top: '50%', left: '50%', width: '10px', height: '10px', background: '#D81B60', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 },
  miniClockBtn: { background: '#F06292', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '15px', cursor: 'pointer', fontSize: '0.85rem' },
  alarmList: { marginTop: '15px', maxHeight: '200px', overflowY: 'auto' },
  alarmItem: { display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #FCE4EC', fontSize: '0.85rem' },
  timeInput: { border: '1px solid #F8BBD0', borderRadius: '5px', padding: '2px' },
  aiMasterButton: { width: '100%', background: 'linear-gradient(45deg, #4a148c, #7b1fa2)', color: 'white', border: 'none', padding: '20px', borderRadius: '25px', marginBottom: '20px' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  iconWrapper: { background: 'linear-gradient(45deg, #6a1b9a, #ab47bc)', padding: '10px', borderRadius: '15px', display: 'flex' },
  title: { margin: 0, fontSize: '1.2rem', color: '#4a148c', fontWeight: '800' },
  sectionCard: { background: '#fff', borderRadius: '20px', marginBottom: '10px', overflow: 'hidden', border: '1px solid #f0f0f0' },
  sectionHeader: { padding: '15px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' },
  sectionTitleGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  gridContainer: { padding: '15px', background: '#fafafa', transition: 'all 0.4s ease-in-out', overflow: 'hidden' },
  inputGroup: { display: 'flex', flexDirection: 'column', marginBottom: '10px' },
  label: { fontSize: '0.8rem', color: '#7b1fa2', fontWeight: 'bold' },
  input: { padding: '10px', borderRadius: '10px', border: '1px solid #eee', outline: 'none' },
  saveSectionBtn: { width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(45deg, #7b1fa2, #4a148c)', color: 'white', fontWeight: 'bold' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  chatbox: { background: 'white', width: '90%', maxWidth: '450px', borderRadius: '25px', height: '80vh', display: 'flex', flexDirection: 'column' },
  chatHeader: { background: '#4a148c', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between' },
  chatContent: { flex: 1, padding: '15px', overflowY: 'auto' },
  chatFooter: { padding: '15px', borderTop: '1px solid #eee' },
  chatInput: { width: '100%', height: '50px', borderRadius: '10px', border: '1px solid #ddd', padding: '8px' },
  sendBtn: { flex: 2, background: '#4a148c', color: 'white', border: 'none', borderRadius: '8px' },
  toolBtn: { padding: '10px', background: '#f5f5f5', border: '1px solid #eee', borderRadius: '8px' },
  backBtn: { background: '#8E24AA', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '20px' },
  latestReply: { background: '#f3e5f5', padding: '10px', borderRadius: '10px', marginBottom: '10px' },
  historyCard: { background: '#f8f9fa', padding: '10px', borderRadius: '10px', marginBottom: '10px' },
  historyHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }
};

export default PregnancyMonitor;
