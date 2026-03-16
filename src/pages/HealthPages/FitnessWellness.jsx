import React, { useState, useCallback, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage } from '../../services/MediaService';

// استيراد الصور من مجلد Assets الخاص بالمشروع
import hourHand from '../../assets/fine-hour.png';
import minuteHand from '../../assets/fine-minute.png';
import secondHand from '../../assets/fine-second.png';
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
  const Icon = iconMap.intimacy;
  const [openIdx, setOpenIdx] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showClockSettings, setShowClockSettings] = useState(false);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('lady_fitness');
    return saved ? JSON.parse(saved) : {};
  });

  const [alarms, setAlarms] = useState(() => {
    const savedAlarms = localStorage.getItem('roqa_alarms');
    return savedAlarms ? JSON.parse(savedAlarms) : {};
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // تشغيل المنبه
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      Object.values(alarms).forEach(alarmTime => {
        if (alarmTime === currentStr && now.getSeconds() === 0) {
          const audio = new Audio(alarmSound);
          audio.play().catch(e => console.log("التفاعل مطلوب لتشغيل الصوت"));
        }
      });
    };
    const alarmInterval = setInterval(checkAlarms, 1000);
    return () => clearInterval(alarmInterval);
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem('roqa_alarms', JSON.stringify(alarms));
  }, [alarms]);

  // دالة الحفظ والمزامنة (إعادة التفعيل)
  const saveAndNotify = async (categoryTitle, value) => {
    const savedToken = localStorage.getItem('fcm_token');
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { 
          fcmToken: savedToken || undefined, 
          user_id: 1, 
          category: 'health_update', 
          title: `تحديث: ${categoryTitle}`, 
          body: `تم تسجيل بيانات جديدة في قسم ${categoryTitle}`,
          scheduled_for: new Date().toISOString()
        }
      });
    } catch (err) { console.error("Sync Error:", err); }
  };

  const updateData = useCallback((field, value) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      localStorage.setItem('lady_fitness', JSON.stringify(newData));
      return newData;
    });
  }, []);

  // دالة التحليل بالذكاء الاصطناعي (إعادة التفعيل)
  const handleSectionAction = async (section) => {
    setIsLoading(true);
    const sectionData = section.fields.map(f => `${f}: ${data[`${section.id}-${f}`] || 'غير مدخل'}`).join(", ");
    await saveAndNotify(section.title, "تحديث القسم");
    
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `بصفتك طبيبة رقة، حللي هذه البيانات لـ (${section.title}): ${sectionData}` }
      });
      const reply = response.data.reply || response.data.message;
      setAiResponse(reply);
      setIsChatOpen(true);
      setChatHistory(prev => [{ id: Date.now(), query: `تحليل ${section.title}`, reply }, ...prev]);
    } catch (err) { 
      console.error("AI Error:", err); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const secondsDeg = (currentTime.getSeconds() / 60) * 360;
  const minutesDeg = ((currentTime.getMinutes() + currentTime.getSeconds() / 60) / 60) * 360;
  const hoursDeg = ((currentTime.getHours() % 12 + currentTime.getMinutes() / 60) / 12) * 360;

  return (
    <div style={mergedStyles.container}>
      <div style={mergedStyles.clockSection}>
        <div style={mergedStyles.clockFace}>
          {/* عقرب الساعات */}
          <div style={{...mergedStyles.handBase, transform: `translateX(-50%) rotate(${hoursDeg}deg)`}}>
            <img src={hourHand} alt="H" style={mergedStyles.handImg} />
          </div>
          {/* عقرب الدقائق */}
          <div style={{...mergedStyles.handBase, transform: `translateX(-50%) rotate(${minutesDeg}deg)`, height: '70px', width: '6px'}}>
            <img src={minuteHand} alt="M" style={mergedStyles.handImg} />
          </div>
          {/* عقرب الثواني */}
          <div style={{...mergedStyles.handBase, transform: `translateX(-50%) rotate(${secondsDeg}deg)`, height: '80px', width: '2px'}}>
            <img src={secondHand} alt="S" style={mergedStyles.handImg} />
          </div>
          <div style={mergedStyles.centerDot}></div>
        </div>
        
        <button style={mergedStyles.miniClockBtn} onClick={() => setShowClockSettings(!showClockSettings)}>
          {showClockSettings ? "إغلاق الإعدادات" : "ضبط منبه الأنشطة ⏰"}
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

      {isChatOpen && (
        <div style={mergedStyles.chatOverlay}>
          <div style={mergedStyles.chatbox}>
             <div style={mergedStyles.chatHeader}>
                <span>استشارة الطبيبة</span>
                <button onClick={() => setIsChatOpen(false)} style={{background:'none', border:'none', color:'white'}}>✕</button>
             </div>
             <div style={{flex: 1, padding: '15px', overflowY: 'auto'}}>
                {aiResponse && <div style={{background:'#f3e5f5', padding:'10px', borderRadius:'10px'}}>{aiResponse}</div>}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const mergedStyles = {
  container: { background: 'linear-gradient(160deg, #fdfbfb 0%, #ebedee 100%)', padding: '20px', direction: 'rtl', maxWidth: '500px', margin: 'auto', minHeight: '100vh' },
  clockSection: { background: 'rgba(255,255,255,0.7)', borderRadius: '25px', padding: '20px', marginBottom: '20px', textAlign: 'center', border: '1px solid #F8BBD0' },
  clockFace: { width: '160px', height: '160px', borderRadius: '50%', background: '#fff', position: 'relative', margin: '0 auto 15px', border: '5px solid #F8BBD0' },
  handBase: { position: 'absolute', bottom: '50%', left: '50%', transformOrigin: 'bottom center', width: '8px', height: '50px', zIndex: 5 },
  handImg: { width: '100%', height: '100%', objectFit: 'contain' },
  centerDot: { position: 'absolute', top: '50%', left: '50%', width: '12px', height: '12px', background: '#D81B60', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 },
  miniClockBtn: { background: '#F06292', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '15px' },
  aiMasterButton: { width: '100%', background: 'linear-gradient(45deg, #4a148c, #7b1fa2)', color: 'white', border: 'none', padding: '20px', borderRadius: '25px', marginBottom: '20px' },
  sectionCard: { background: '#fff', borderRadius: '20px', marginBottom: '10px', border: '1px solid #f0f0f0', overflow: 'hidden' },
  sectionHeader: { padding: '15px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' },
  sectionTitleGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  gridContainer: { padding: '15px', background: '#fafafa' },
  inputGroup: { display: 'flex', flexDirection: 'column', marginBottom: '10px' },
  label: { fontSize: '0.8rem', color: '#7b1fa2' },
  input: { padding: '10px', borderRadius: '10px', border: '1px solid #eee' },
  saveSectionBtn: { width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#4a148c', color: 'white' },
  chatOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  chatbox: { background: 'white', width: '90%', height: '70vh', borderRadius: '20px', display: 'flex', flexDirection: 'column' },
  chatHeader: { background: '#4a148c', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', borderRadius: '20px 20px 0 0' }
};

export default PregnancyMonitor;
