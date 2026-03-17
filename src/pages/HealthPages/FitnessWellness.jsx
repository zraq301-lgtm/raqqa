import React, { useState, useCallback, useEffect, useRef } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage } from '../../services/MediaService';

// استيراد الصوت
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

  // تحديث الساعة ثانية بثانية
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // فحص المنبهات (سواء المحددة من قائمة الساعة أو المكتوبة في المدخلات)
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // فحص منبهات قائمة الساعة
      const hasAlarm = Object.values(alarms).some(time => time === currentStr);
      // فحص الأوقات المكتوبة في المدخلات
      const hasInputTime = Object.values(data).some(val => val === currentStr);

      if ((hasAlarm || hasInputTime) && now.getSeconds() === 0) {
        const audio = new Audio(alarmSound);
        audio.play().catch(e => console.warn("Audio trigger required user interaction"));
      }
    };
    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [alarms, data]);

  useEffect(() => {
    localStorage.setItem('roqa_alarms', JSON.stringify(alarms));
  }, [alarms]);

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
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `تحليل بيانات ${section.title}: ${sectionData}` }
      });
      setAiResponse(response.data.reply || response.data.message);
      // إشعار Firebase
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.app/api/send-fcm',
        data: { title: "تحديث جديد", body: `تم تحليل قسم ${section.title}` }
      });
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
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
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const hoursDeg = ((currentTime.getHours() % 12 + currentTime.getMinutes() / 60) / 12) * 360;
  const minutesDeg = ((currentTime.getMinutes() + currentTime.getSeconds() / 60) / 60) * 360;
  const secondsDeg = (currentTime.getSeconds() / 60) * 360;

  return (
    <div style={mergedStyles.container}>
      {/* الساعة وقائمة ضبط المواعيد */}
      <div style={mergedStyles.clockSection}>
        <div style={mergedStyles.clockFace}>
          <div style={{...mergedStyles.handHour, transform: `translateX(-50%) rotate(${hoursDeg}deg)`}} />
          <div style={{...mergedStyles.handMinute, transform: `translateX(-50%) rotate(${minutesDeg}deg)`}} />
          <div style={{...mergedStyles.handSecond, transform: `translateX(-50%) rotate(${secondsDeg}deg)`}} />
          <div style={mergedStyles.centerDot} />
        </div>
        
        <button style={mergedStyles.miniClockBtn} onClick={() => setShowClockSettings(!showClockSettings)}>
          {showClockSettings ? "إغلاق الضبط" : "ضبط منبه الأنشطة ⏰"}
        </button>

        {showClockSettings && (
          <div style={mergedStyles.alarmList}>
            {sections.map(s => (
              <div key={s.id} style={mergedStyles.alarmItem}>
                <span style={{fontSize: '0.8rem'}}>{s.emoji} {s.title}</span>
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

      {/* كارت الذكاء الاصطناعي المطور */}
      <div style={mergedStyles.aiBigCard}>
        <h3 style={{margin: '0 0 15px 0'}}>👩‍⚕️ طبيبة رقة الذكية</h3>
        
        <div style={mergedStyles.mediaZone}>
           {capturedImage && <img src={capturedImage} style={mergedStyles.previewImg} alt="Preview" />}
           <div style={mergedStyles.mediaButtons}>
              <button onClick={async () => setCapturedImage(await takePhoto())} style={mergedStyles.mediaBtn}>📸 كاميرا</button>
              <button onClick={async () => setCapturedImage(await fetchImage())} style={mergedStyles.mediaBtn}>🖼️ معرض</button>
           </div>
        </div>

        <div style={mergedStyles.chatInputArea}>
           <input 
             type="text"
             value={prompt} 
             onChange={(e) => setPrompt(e.target.value)} 
             placeholder="اكتبي استفسارك هنا..." 
             style={mergedStyles.chatInput}
           />
           <button onClick={handleAIQuery} style={mergedStyles.sendBtn}>
             {isLoading ? "..." : "إرسال"}
           </button>
        </div>
        
        {aiResponse && <div style={mergedStyles.aiResponseBox}><strong>الرد:</strong> {aiResponse}</div>}
      </div>

      {/* الأقسام - كل المدخلات أسفل بعضها مع زر الحفظ */}
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
                  {isLoading ? "جاري التحليل..." : `حفظ وتحليل ${sec.title} 🩺`}
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
  container: { background: '#fdf7ff', padding: '15px', direction: 'rtl', maxWidth: '500px', margin: 'auto', minHeight: '100vh' },
  
  // الساعة
  clockSection: { background: '#fff', borderRadius: '25px', padding: '15px', marginBottom: '20px', textAlign: 'center', border: '1px solid #ce93d8' },
  clockFace: { width: '120px', height: '120px', borderRadius: '50%', background: '#f3e5f5', position: 'relative', margin: '0 auto 15px', border: '5px solid #ce93d8' },
  handHour: { position: 'absolute', bottom: '50%', left: '50%', width: '5px', height: '35px', background: '#4a148c', transformOrigin: 'bottom center', borderRadius: '5px' },
  handMinute: { position: 'absolute', bottom: '50%', left: '50%', width: '3px', height: '50px', background: '#7b1fa2', transformOrigin: 'bottom center', borderRadius: '5px' },
  handSecond: { position: 'absolute', bottom: '50%', left: '50%', width: '1px', height: '55px', background: '#e91e63', transformOrigin: 'bottom center' },
  centerDot: { position: 'absolute', top: '50%', left: '50%', width: '10px', height: '10px', background: '#4a148c', borderRadius: '50%', transform: 'translate(-50%, -50%)' },
  miniClockBtn: { background: '#f06292', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '12px', fontSize: '0.9rem', cursor: 'pointer' },
  alarmList: { marginTop: '15px', background: '#fafafa', borderRadius: '15px', padding: '10px' },
  alarmItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #eee' },
  timeInput: { border: '1px solid #ce93d8', borderRadius: '5px', padding: '2px' },

  // كارت الذكاء الاصطناعي
  aiBigCard: { background: 'linear-gradient(135deg, #4a148c, #7b1fa2)', borderRadius: '25px', padding: '20px', color: 'white', marginBottom: '20px' },
  mediaZone: { textAlign: 'center', marginBottom: '15px' },
  previewImg: { width: '100px', height: '100px', borderRadius: '15px', objectFit: 'cover', marginBottom: '10px', border: '2px solid white' },
  mediaButtons: { display: 'flex', gap: '10px', justifyContent: 'center' },
  mediaBtn: { background: 'white', color: '#4a148c', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: 'bold' },
  chatInputArea: { display: 'flex', gap: '8px', background: 'white', padding: '5px', borderRadius: '15px' },
  chatInput: { flex: 1, border: 'none', outline: 'none', padding: '10px', borderRadius: '10px', fontSize: '1rem' },
  sendBtn: { background: '#ffd54f', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  aiResponseBox: { marginTop: '15px', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px', fontSize: '0.9rem' },

  // الأقسام
  sectionCard: { background: '#fff', borderRadius: '15px', marginBottom: '10px', border: '1px solid #e1bee7', overflow: 'hidden' },
  sectionHeader: { padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#4a148c' },
  verticalList: { padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.85rem', color: '#7b1fa2', fontWeight: 'bold' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #ce93d8', fontSize: '1rem' },
  saveSectionBtn: { background: '#4a148c', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
};

export default PregnancyMonitor;
