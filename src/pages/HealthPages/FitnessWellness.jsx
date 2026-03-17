import React, { useState, useCallback, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage } from '../../services/MediaService';

// استيراد صوت المنبه فقط
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
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showClockSettings, setShowClockSettings] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('lady_fitness');
    return saved ? JSON.parse(saved) : {};
  });

  const [alarms, setAlarms] = useState(() => {
    const savedAlarms = localStorage.getItem('roqa_alarms');
    return savedAlarms ? JSON.parse(savedAlarms) : {};
  });

  // تحديث وقت الساعة كل ثانية لجعلها تعمل
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // نظام التنبيه الصوتي
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // فحص المداخلات للبحث عن أوقات مسجلة
      Object.entries(data).forEach(([key, val]) => {
        if (val === currentStr && now.getSeconds() === 0) {
           const audio = new Audio(alarmSound);
           audio.play().catch(e => console.log("تحتاج لتفاعل المستخدم لتشغيل الصوت"));
        }
      });
    };
    const alarmInterval = setInterval(checkAlarms, 1000);
    return () => clearInterval(alarmInterval);
  }, [data]);

  // دالة إرسال الإشعار لـ Firebase عبر الرابط المذكور
  const sendFirebaseNotification = async (title, body) => {
    const fcmToken = localStorage.getItem('fcm_token');
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
        headers: { 'Content-Type': 'application/json' },
        data: {
          to: fcmToken,
          notification: { title, body },
          data: { type: 'health_update' }
        }
      });
    } catch (err) { console.error("Firebase Sync Error:", err); }
  };

  const updateData = useCallback((field, value) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      localStorage.setItem('lady_fitness', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const handleAIQuery = async () => {
    if (!prompt) return;
    setIsLoading(true);
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: prompt, image: capturedImage }
      });
      setAiResponse(response.data.reply || response.data.message);
      await sendFirebaseNotification("استشارة ذكاء اصطناعي", "تم الرد على استفسارك بنجاح");
    } catch (err) { console.error("AI Error:", err); }
    finally { setIsLoading(false); }
  };

  // حسابات زوايا الساعة
  const secondsDeg = (currentTime.getSeconds() / 60) * 360;
  const minutesDeg = ((currentTime.getMinutes() + currentTime.getSeconds() / 60) / 60) * 360;
  const hoursDeg = ((currentTime.getHours() % 12 + currentTime.getMinutes() / 60) / 12) * 360;

  return (
    <div style={mergedStyles.container}>
      {/* قسم الساعة الموف المطورة */}
      <div style={mergedStyles.clockSection}>
        <div style={mergedStyles.clockFace}>
          <div style={mergedStyles.numbers}>
             {[12, 3, 6, 9].map(n => <span key={n} className={`n${n}`}>{n}</span>)}
          </div>
          {/* عقرب الساعات */}
          <div style={{...mergedStyles.handHour, transform: `translateX(-50%) rotate(${hoursDeg}deg)`}} />
          {/* عقرب الدقائق */}
          <div style={{...mergedStyles.handMinute, transform: `translateX(-50%) rotate(${minutesDeg}deg)`}} />
          {/* عقرب الثواني */}
          <div style={{...mergedStyles.handSecond, transform: `translateX(-50%) rotate(${secondsDeg}deg)`}} />
          <div style={mergedStyles.centerDot}></div>
        </div>
        <p style={{color: '#7b1fa2', fontWeight: 'bold'}}>الوقت الآن: {currentTime.toLocaleTimeString('ar-EG')}</p>
      </div>

      {/* كارت الذكاء الاصطناعي المطور (كبير) */}
      <div style={mergedStyles.aiBigCard}>
        <div style={mergedStyles.aiHeader}>
          <span style={{fontSize: '1.5rem'}}>👩‍⚕️</span>
          <h3 style={{margin: 0}}>طبيبة رقة للذكاء الاصطناعي</h3>
        </div>
        
        <div style={mergedStyles.mediaZone}>
           {capturedImage && <img src={capturedImage} style={mergedStyles.previewImg} alt="Preview" />}
           <div style={mergedStyles.mediaButtons}>
              <button onClick={async () => setCapturedImage(await takePhoto())} style={mergedStyles.mediaBtn}>📸 كاميرا</button>
              <button onClick={async () => setCapturedImage(await fetchImage())} style={mergedStyles.mediaBtn}>🖼️ معرض</button>
           </div>
        </div>

        <div style={mergedStyles.chatInputArea}>
           <input 
             value={prompt} 
             onChange={(e) => setPrompt(e.target.value)} 
             placeholder="اسألي طبيبة رقة أي شيء..." 
             style={mergedStyles.chatInput}
           />
           <button onClick={handleAIQuery} style={mergedStyles.sendBtn}>
             {isLoading ? "..." : "إرسال"}
           </button>
        </div>
        
        {aiResponse && (
          <div style={mergedStyles.aiResponseBox}>
            <strong>الرد:</strong> {aiResponse}
          </div>
        )}
      </div>

      {/* الأقسام المنسدلة */}
      <div style={mergedStyles.accordion}>
        {sections.map((sec, i) => (
          <div key={sec.id} style={mergedStyles.sectionCard}>
            <div style={mergedStyles.sectionHeader} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <div style={mergedStyles.sectionTitleGroup}>
                <span style={mergedStyles.emoji}>{sec.emoji}</span>
                <span style={mergedStyles.sectionTitleText}>{sec.title}</span>
              </div>
              <span>{openIdx === i ? '▴' : '▾'}</span>
            </div>
            {openIdx === i && (
              <div style={mergedStyles.gridContainer}>
                {sec.fields.map((f) => (
                  <div key={`${sec.id}-${f}`} style={mergedStyles.inputGroup}>
                    <label style={mergedStyles.label}>{f}</label>
                    <input 
                      type={f.includes("وقت") || f.includes("مواعيد") ? "time" : "text"}
                      style={mergedStyles.input} 
                      value={data[`${sec.id}-${f}`] || ''} 
                      onChange={(e) => updateData(`${sec.id}-${f}`, e.target.value)} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const mergedStyles = {
  container: { background: '#f8f0fb', padding: '20px', direction: 'rtl', maxWidth: '500px', margin: 'auto', minHeight: '100vh', fontFamily: 'Arial' },
  
  // ستايل الساعة الموف
  clockSection: { background: '#fff', borderRadius: '30px', padding: '20px', marginBottom: '20px', textAlign: 'center', boxShadow: '0 4px 15px rgba(123, 31, 162, 0.1)' },
  clockFace: { width: '150px', height: '150px', borderRadius: '50%', background: '#f3e5f5', position: 'relative', margin: '0 auto 15px', border: '6px solid #ce93d8' },
  handHour: { position: 'absolute', bottom: '50%', left: '50%', width: '6px', height: '40px', background: '#4a148c', borderRadius: '10px', transformOrigin: 'bottom center', zIndex: 3 },
  handMinute: { position: 'absolute', bottom: '50%', left: '50%', width: '4px', height: '60px', background: '#7b1fa2', borderRadius: '10px', transformOrigin: 'bottom center', zIndex: 4 },
  handSecond: { position: 'absolute', bottom: '50%', left: '50%', width: '2px', height: '65px', background: '#e91e63', borderRadius: '10px', transformOrigin: 'bottom center', zIndex: 5 },
  centerDot: { position: 'absolute', top: '50%', left: '50%', width: '12px', height: '12px', background: '#4a148c', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 },
  
  // كارت الذكاء الاصطناعي الكبير
  aiBigCard: { background: 'linear-gradient(135deg, #6a1b9a, #ab47bc)', borderRadius: '25px', padding: '20px', color: 'white', marginBottom: '20px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' },
  aiHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' },
  mediaZone: { background: 'rgba(255,255,255,0.1)', borderRadius: '15px', padding: '10px', marginBottom: '15px', textAlign: 'center' },
  previewImg: { width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' },
  mediaButtons: { display: 'flex', gap: '10px', justifyContent: 'center' },
  mediaBtn: { background: '#fff', color: '#6a1b9a', border: 'none', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
  chatInputArea: { display: 'flex', gap: '5px' },
  chatInput: { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', outline: 'none' },
  sendBtn: { background: '#ffd54f', color: '#000', border: 'none', padding: '10px 15px', borderRadius: '12px', fontWeight: 'bold' },
  aiResponseBox: { marginTop: '15px', background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '10px', fontSize: '0.9rem' },

  // الأقسام
  sectionCard: { background: '#fff', borderRadius: '15px', marginBottom: '10px', border: '1px solid #e1bee7' },
  sectionHeader: { padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  sectionTitleText: { fontWeight: 'bold', color: '#4a148c' },
  gridContainer: { padding: '15px', background: '#fdfbff', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.75rem', color: '#9c27b0', marginBottom: '4px' },
  input: { padding: '8px', borderRadius: '8px', border: '1px solid #ce93d8', fontSize: '0.9rem' }
};

export default PregnancyMonitor;
