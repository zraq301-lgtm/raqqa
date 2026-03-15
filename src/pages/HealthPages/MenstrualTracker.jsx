import React, { useState, useEffect, useMemo } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

// --- مكون الساعة المطور (بألوان فترات متحركة وديناميكية) ---
const PeriodClock = ({ prediction, startDate, cycleDuration = 29, periodDays = 5 }) => {
  const [rotation, setRotation] = useState(0);
  
  // حساب الزوايا بناءً على مدخلات المستخدم
  const clockLayout = useMemo(() => {
    const cycle = parseInt(cycleDuration) || 29;
    const period = parseInt(periodDays) || 5;
    
    // تحويل الأيام إلى درجات
    const periodDeg = (period / cycle) * 360;
    const ovulationDay = cycle - 14; // التبويض غالباً قبل الدورة القادمة بـ 14 يوم
    const fertilityStartDeg = ((ovulationDay - 3) / cycle) * 360;
    const fertilityEndDeg = ((ovulationDay + 2) / cycle) * 360;

    return {
      periodEnd: periodDeg,
      fertilityStart: fertilityStartDeg,
      fertilityEnd: fertilityEndDeg,
      cycle: cycle
    };
  }, [cycleDuration, periodDays]);

  // توليد أرقام الأيام حول الساعة
  const dayNumbers = useMemo(() => {
    const days = [];
    const total = clockLayout.cycle;
    for (let i = 1; i <= total; i++) {
      const angle = (i / total) * 360 - 90;
      days.push({ day: i, angle });
    }
    return days;
  }, [clockLayout.cycle]);

  useEffect(() => {
    if (!startDate) return;
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(today - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) % clockLayout.cycle;
    const angle = (diffDays / clockLayout.cycle) * 360;
    setRotation(angle);
  }, [startDate, clockLayout.cycle]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px',
      padding: '20px', background: 'rgba(255,255,255,0.7)', borderRadius: '35px', backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        width: '220px', height: '220px', borderRadius: '50%',
        position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 15px 35px rgba(233, 30, 99, 0.15)', background: '#fff', border: '2px solid #fff'
      }}>
        
        {/* خلفية الساعة الملونة (تتحرك الألوان بناءً على مدخلات الدورة) */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
          background: `conic-gradient(
            #ff4d4d 0deg ${clockLayout.periodEnd}deg, 
            #f0f0f0 ${clockLayout.periodEnd}deg ${clockLayout.fertilityStart}deg, 
            #4CAF50 ${clockLayout.fertilityStart}deg ${clockLayout.fertilityEnd}deg, 
            #f0f0f0 ${clockLayout.fertilityEnd}deg 360deg
          )`,
          opacity: 0.25, clipPath: 'circle(50% at 50% 50%)'
        }}></div>

        {/* أرقام أيام الشهر حول الإطار */}
        {dayNumbers.map((d) => (
          <div key={d.day} style={{
            position: 'absolute',
            transform: `rotate(${d.angle}deg) translate(95px) rotate(${-d.angle}deg)`,
            fontSize: '9px', fontWeight: 'bold', 
            color: d.day <= (parseInt(periodDays) || 5) ? '#ff4d4d' : '#888'
          }}>
            {d.day}
          </div>
        ))}
        
        {/* مؤشر القلب المتحرك */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          transform: `rotate(${rotation}deg)`, transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <span style={{
            position: 'absolute', top: '-10px', left: 'calc(50% - 12px)',
            fontSize: '24px', filter: 'drop-shadow(0 2px 4px rgba(233, 30, 99, 0.4))'
          }}>💖</span>
        </div>

        <div style={{ textAlign: 'center', zIndex: 2 }}>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#E91E63' }}>
            {prediction ? 'توقع رقة' : 'أدخلي البيانات'}
          </div>
          <div style={{ fontSize: '10px', color: '#888', letterSpacing: '1px' }}>متابعكِ الذكي</div>
        </div>
      </div>
    </div>
  );
};

const MenstrualTracker = () => {
  const HealthIcon = iconMap.health;
  
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('menstrual_data');
    return saved ? JSON.parse(saved) : {};
  });

  const [openAccordion, setOpenAccordion] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState(() => {
    const savedChat = localStorage.getItem('chat_history');
    return savedChat ? JSON.parse(savedChat) : [];
  });

  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
  }, [data, chatHistory]);

  const getAdvancedCalculations = (startDate) => {
    if (!startDate) return null;
    const cycleLen = parseInt(data['سجل التواريخ_مدة الدورة']) || 29;
    const start = new Date(startDate);
    const nextDate = new Date(start);
    nextDate.setDate(start.getDate() + cycleLen);
    
    const ovulationDay = new Date(nextDate);
    ovulationDay.setDate(nextDate.getDate() - 14);
    const fertilityStart = new Date(ovulationDay);
    fertilityStart.setDate(ovulationDay.getDate() - 5);
    
    const lunarFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' });
    
    return {
      nextDateAr: nextDate.toLocaleDateString('ar-EG'),
      lunarDate: lunarFormatter.format(nextDate),
      fertilityWindow: `${fertilityStart.toLocaleDateString('ar-EG')} إلى ${ovulationDay.toLocaleDateString('ar-EG')}`
    };
  };

  const calculateAndSave = async () => {
    const calc = getAdvancedCalculations(data['سجل التواريخ_تاريخ البدء']);
    if (!calc) return alert("الرجاء تحديد تاريخ البدء أولاً");
    setPrediction(calc);

    try {
      const fcmOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
        headers: { 'Content-Type': 'application/json' },
        data: {
          title: "تم تحديث دورتكِ في نيون 🌸",
          body: `الموعد القادم: ${calc.nextDateAr}. رقة تتابعكِ بدقة.`,
          data: { ...data, ...calc }
        }
      };
      await CapacitorHttp.post(fcmOptions);
      alert("تمت المزامنة مع نيون بنجاح!");
    } catch (err) {
      console.error("خطأ نيون:", err);
    }
  };

  const handleProcess = async (userInput = null) => {
    setLoading(true);
    const summary = JSON.stringify(data);

    try {
      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { 
          prompt: `كمحللة طبية خبيرة في تطبيق "رقة"، حللي البيانات بدقة متناهية: ${summary}. 
                   المطلوب تقرير طبي شامل، عميق، وطويل جداً، يتناول الحالة الجسدية والنفسية، 
                   مع تقديم خطة عناية مخصصة تشمل الغذاء والنشاط البدني المناسب لهذه المرحلة من الدورة.` 
        }
      };

      const aiResponse = await CapacitorHttp.post(aiOptions);
      const responseText = aiResponse.data.reply || aiResponse.data.content || "التحليل الطبي جاهز.";

      const newMessage = {
        id: Date.now(),
        role: 'ai',
        content: responseText,
        time: new Date().toLocaleTimeString('ar-EG'),
      };

      setChatHistory(prev => userInput ? [...prev, { role: 'user', content: userInput, id: Date.now() - 1 }, newMessage] : [...prev, newMessage]);
      setChatInput('');
      setShowChat(true);
    } catch (err) {
      console.error("خطأ AI:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMedia = async (type) => {
    try {
      const img = type === 'camera' ? await takePhoto() : await fetchImage();
      if (img) {
        const url = await uploadToVercel(img);
        setChatHistory(prev => [...prev, { role: 'user', content: `[تم رفع ملف]: ${url}`, type: 'image', id: Date.now() }]);
      }
    } catch (e) { console.error(e); }
  };

  const styles = {
    container: { background: 'linear-gradient(180deg, #FFF5F7 0%, #FCE4EC 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl' },
    card: { background: 'rgba(255,255,255,0.9)', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 30px rgba(233, 30, 99, 0.05)', marginBottom: '15px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' },
    chatInputArea: { padding: '15px', background: '#fff', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #eee' },
    inputField: { flex: 1, border: '1px solid #eee', padding: '12px', borderRadius: '25px', outline: 'none', background: '#f9f9f9' }
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "مدة الدورة", "مدة الحيض"] },
    { id: 2, title: "البيانات الحيوية", emoji: "⚖️", fields: ["العمر", "الوزن"] },
    { id: 3, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع"] },
    { id: 4, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء"] },
  ];

  return (
    <div style={styles.container}>
      <PeriodClock 
        prediction={prediction} 
        startDate={data['سجل التواريخ_تاريخ البدء']} 
        cycleDuration={data['سجل التواريخ_مدة الدورة']}
        periodDays={data['سجل التواريخ_مدة الحيض']}
      />

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button onClick={() => setShowChat(true)} style={{ background: '#FFF', border: '1.5px solid #E91E63', color: '#E91E63', padding: '8px 20px', borderRadius: '15px', fontWeight: 'bold' }}>💬 استشارة رقة</button>
          <h3 style={{ color: '#ad1457', margin: 0 }}>رقة الذكية</h3>
        </div>
        <button onClick={calculateAndSave} style={{ ...styles.btnPrimary, background: '#F8BBD0', color: '#880E4F' }}>حفظ في نيون وتحديث التقويم ✨</button>
      </div>

      {sections.map((sec) => (
        <div key={sec.id} style={styles.card}>
          <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>{sec.emoji} {sec.title}</span>
            <span style={{ color: '#E91E63' }}>{openAccordion === sec.id ? '▲' : '▼'}</span>
          </div>
          {openAccordion === sec.id && (
            <div style={{ padding: '15px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {sec.fields.map(field => (
                <div key={field}>
                  <label style={{ fontSize: '11px', color: '#999' }}>{field}</label>
                  <input 
                    type={field.includes('تاريخ') ? 'date' : 'number'}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #FFD1DF' }}
                    value={data[`${sec.title}_${field}`] || ''}
                    onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={() => handleProcess()} style={{ ...styles.btnPrimary, marginTop: '10px' }} disabled={loading}>
        {loading ? "جاري التحليل المعمق..." : "تحليل طبي شامل وتقرير مطول ✨"}
      </button>

      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer', fontSize: '24px' }}>✕</span>
            <span style={{ fontWeight: 'bold' }}>طبيبة رقة</span>
            <div style={{ display: 'flex', gap: '15px' }}>
               <span onClick={() => handleMedia('camera')} style={{ cursor: 'pointer' }}>📸</span>
               <span onClick={() => handleMedia('gallery')} style={{ cursor: 'pointer' }}>🖼️</span>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#E91E63' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#333',
                padding: '15px', borderRadius: '20px', marginBottom: '15px', maxWidth: '85%',
                marginLeft: msg.role === 'user' ? 'auto' : '0',
                boxShadow: '0 4px 10px rgba(0,0,0,0.03)', whiteSpace: 'pre-wrap'
              }}>{msg.content}</div>
            ))}
          </div>
          <div style={styles.chatInputArea}>
            <input 
              placeholder="اسألي رقة..." 
              style={styles.inputField}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') handleProcess(chatInput); }}
            />
            <button onClick={() => handleProcess(chatInput)} style={{ background: '#E91E63', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%' }}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker;
