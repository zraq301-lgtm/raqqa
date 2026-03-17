import React, { useState, useCallback, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage } from '../../services/MediaService';

// استيراد صوت المنبه
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
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [capturedImage, setCapturedImage] = useState(null);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('lady_fitness');
    return saved ? JSON.parse(saved) : {};
  });

  // تحديث وقت الساعة (استخدام المنبه)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // نظام التنبيه الصوتي المطور
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      Object.entries(data).forEach(([key, val]) => {
        if (val === currentStr && now.getSeconds() === 0) {
           const audio = new Audio(alarmSound);
           audio.play().catch(e => console.log("Audio play failed"));
        }
      });
    };
    const alarmInterval = setInterval(checkAlarms, 1000);
    return () => clearInterval(alarmInterval);
  }, [data]);

  const sendFirebaseNotification = async (title, body) => {
    const fcmToken = localStorage.getItem('fcm_token');
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
        headers: { 'Content-Type': 'application/json' },
        data: { to: fcmToken, notification: { title, body } }
      });
    } catch (err) { console.error(err); }
  };

  const updateData = (field, value) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    localStorage.setItem('lady_fitness', JSON.stringify(newData));
  };

  const handleAIQuery = async () => {
    if (!prompt) return;
    setIsLoading(true);
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt, image: capturedImage }
      });
      setAiResponse(response.data.reply || response.data.message);
      await sendFirebaseNotification("استشارة ذكاء اصطناعي", "تم الرد على استفسارك");
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // حساب زوايا الساعة
  const secondsDeg = (currentTime.getSeconds() / 60) * 360;
  const minutesDeg = ((currentTime.getMinutes() + currentTime.getSeconds() / 60) / 60) * 360;
  const hoursDeg = ((currentTime.getHours() % 12 + currentTime.getMinutes() / 60) / 12) * 360;

  return (
    <div style={mergedStyles.container}>
      {/* الساعة البرمجية */}
      <div style={mergedStyles.clockSection}>
        <div style={mergedStyles.clockFace}>
          <div style={{...mergedStyles.handHour, transform: `translateX(-50%) rotate(${hoursDeg}deg)`}} />
          <div style={{...mergedStyles.handMinute, transform: `translateX(-50%) rotate(${minutesDeg}deg)`}} />
          <div style={{...mergedStyles.handSecond, transform: `translateX(-50%) rotate(${secondsDeg}deg)`}} />
          <div style={mergedStyles.centerDot} />
        </div>
        <div style={{color: '#4a148c', fontSize: '0.9rem', fontWeight: 'bold'}}>
          {currentTime.toLocaleTimeString('ar-EG')}
        </div>
      </div>

      {/* كارت الذكاء الاصطناعي - تم إصلاح مشكلة الإدخال هنا */}
      <div style={mergedStyles.aiBigCard}>
        <div style={mergedStyles.aiHeader}>
          <span>👩‍⚕️ طبيبة رقة</span>
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
             placeholder="اكتبي سؤالك هنا..." 
             style={mergedStyles.chatInput}
           />
           <button onClick={handleAIQuery} style={mergedStyles.sendBtn}>
             {isLoading ? "..." : "إرسال"}
           </button>
        </div>
        
        {aiResponse && <div style={mergedStyles.aiResponseBox}>{aiResponse}</div>}
      </div>

      {/* الأقسام - جعل المداخلات أسفل بعضها */}
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
  container: { background: '#fdf7ff', padding: '15px', direction: 'rtl', maxWidth: '500px', margin: 'auto', minHeight: '100vh' },
  clockSection: { background: '#fff', borderRadius: '20px', padding: '15px', marginBottom: '15px', textAlign: 'center', border: '1px solid #e1bee7' },
  clockFace: { width: '100px', height: '100px', borderRadius: '50%', background: '#f3e5f5', position: 'relative', margin: '0 auto 10px', border: '4px solid #ce93d8' },
  handHour: { position: 'absolute', bottom: '50%', left: '50%', width: '4px', height: '30px', background: '#4a148c', transformOrigin: 'bottom center' },
  handMinute: { position: 'absolute', bottom: '50%', left: '50%', width: '3px', height: '40px', background: '#7b1fa2', transformOrigin: 'bottom center' },
  handSecond: { position: 'absolute', bottom: '50%', left: '50%', width: '1px', height: '45px', background: '#e91e63', transformOrigin: 'bottom center' },
  centerDot: { position: 'absolute', top: '50%', left: '50%', width: '8px', height: '8px', background: '#4a148c', borderRadius: '50%', transform: 'translate(-50%, -50%)' },

  aiBigCard: { background: '#7b1fa2', borderRadius: '20px', padding: '15px', color: 'white', marginBottom: '15px' },
  aiHeader: { fontWeight: 'bold', marginBottom: '10px' },
  mediaZone: { marginBottom: '10px', textAlign: 'center' },
  previewImg: { width: '80px', height: '80px', borderRadius: '10px', marginBottom: '10px' },
  mediaButtons: { display: 'flex', gap: '10px', justifyContent: 'center' },
  mediaBtn: { background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem' },
  chatInputArea: { display: 'flex', gap: '5px', background: '#fff', borderRadius: '12px', padding: '5px' },
  chatInput: { flex: 1, border: 'none', padding: '8px', outline: 'none', color: '#333' },
  sendBtn: { background: '#ffd54f', color: '#4a148c', border: 'none', padding: '5px 15px', borderRadius: '10px', fontWeight: 'bold' },
  aiResponseBox: { marginTop: '10px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px' },

  sectionCard: { background: '#fff', borderRadius: '12px', marginBottom: '8px', border: '1px solid #eee' },
  sectionHeader: { padding: '12px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#4a148c' },
  verticalList: { padding: '0 15px 15px 15px', display: 'flex', flexDirection: 'column', gap: '12px' }, // عرض عمودي
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.85rem', color: '#7b1fa2' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #e1bee7', background: '#fdfbff', width: '100%', boxSizing: 'border-box' }
};

export default PregnancyMonitor;
