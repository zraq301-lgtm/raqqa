import React, { useState, useEffect, useMemo } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

// --- مكون الساعة المطور (بألوان الفترات وأرقام الشهر) ---
const PeriodClock = ({ prediction, startDate }) => {
  const [rotation, setRotation] = useState(0);
  const cycleLength = 29; // طول الدورة الافتراضي

  // توليد أرقام أيام الشهر حول الساعة
  const dayNumbers = useMemo(() => {
    const days = [];
    for (let i = 1; i <= cycleLength; i++) {
      const angle = (i / cycleLength) * 360 - 90;
      days.push({ day: i, angle });
    }
    return days;
  }, []);

  useEffect(() => {
    if (!startDate) return;
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(today - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) % cycleLength;
    const angle = (diffDays / cycleLength) * 360;
    setRotation(angle);
  }, [startDate]);

  // دالة لتحديد لون الخلفية بناءً على اليوم في الدورة (نظام الفترات)
  const getSegmentColor = (dayIndex) => {
    if (dayIndex <= 5) return '#ff4d4d'; // أحمر - أيام الحيض
    if (dayIndex >= 12 && dayIndex <= 17) return '#4CAF50'; // أخضر - أيام الخصوبة
    return '#f0f0f0'; // رمادي فاتح - أيام عادية
  };

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
        
        {/* رسم فترات الدورة الملونة في الخلفية */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
          background: `conic-gradient(
            #ff4d4d 0deg 62deg, 
            #f0f0f0 62deg 148deg, 
            #4CAF50 148deg 211deg, 
            #f0f0f0 211deg 360deg
          )`,
          opacity: 0.2, clipPath: 'circle(50% at 50% 50%)'
        }}></div>

        {/* أرقام أيام الشهر حول الإطار */}
        {dayNumbers.map((d) => (
          <div key={d.day} style={{
            position: 'absolute',
            transform: `rotate(${d.angle}deg) translate(95px) rotate(${-d.angle}deg)`,
            fontSize: '9px', fontWeight: 'bold', color: d.day <= 5 ? '#ff4d4d' : '#888'
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
  const CameraIcon = iconMap.camera || (() => <span>📸</span>);
  
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

  const FIXED_AVERAGE_CYCLE = 29;

  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
  }, [data, chatHistory]);

  const getAdvancedCalculations = (startDate) => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const nextDate = new Date(start);
    nextDate.setDate(start.getDate() + FIXED_AVERAGE_CYCLE);
    const ovulationDay = new Date(nextDate);
    ovulationDay.setDate(nextDate.getDate() - 14);
    const fertilityStart = new Date(ovulationDay);
    fertilityStart.setDate(ovulationDay.getDate() - 5);
    const lunarFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' });
    
    return {
      nextDate: nextDate.toLocaleDateString('en-CA'),
      nextDateAr: nextDate.toLocaleDateString('ar-EG'),
      lunarDate: lunarFormatter.format(nextDate),
      ovulation: ovulationDay.toLocaleDateString('ar-EG'),
      fertilityWindow: `${fertilityStart.toLocaleDateString('ar-EG')} إلى ${ovulationDay.toLocaleDateString('ar-EG')}`
    };
  };

  const calculateAndSave = async () => {
    const calc = getAdvancedCalculations(data['سجل التواريخ_تاريخ البدء']);
    if (!calc) return alert("الرجاء تحديد تاريخ البدء أولاً");
    setPrediction(calc);

    try {
      // 1. حفظ البيانات وإرسال إشعار FCM
      const fcmOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
        headers: { 'Content-Type': 'application/json' },
        data: {
          title: "تحديث من رقة 🌸",
          body: `توقعاتكِ الجديدة جاهزة. موعد الدورة القادم: ${calc.nextDateAr}`,
          data: { ...data, ...calc }
        }
      };
      await CapacitorHttp.post(fcmOptions);

      // 2. حفظ في النيون (الرابط الاحتياطي)
      const saveOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { category: 'update', title: 'تم الحفظ', body: 'تم مزامنة بياناتك' }
      };
      await CapacitorHttp.post(saveOptions);
      
      alert("تم الحفظ وإرسال الإشعار بنجاح!");
    } catch (err) {
      console.error("خطأ في المزامنة:", err);
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
          prompt: `كمحللة طبية ذكية في تطبيق "رقة"، حللي هذه البيانات: ${summary}. 
                   المطلوب: تقرير تفصيلي وطويل جداً، موجه للمستخدمة بأسلوب راقٍ وداعم، 
                   يشمل نصائح تغذية، رياضة، حالة نفسية، وتوقعات دقيقة بناءً على الأعراض المدخلة. 
                   اجعلي الرد احترافي وطبي متميز.` 
        }
      };

      const aiResponse = await CapacitorHttp.post(aiOptions);
      const responseText = aiResponse.data.reply || aiResponse.data.content || "التحليل جاهز في سجل الدردشة.";

      const newMessage = {
        id: Date.now(),
        role: 'ai',
        content: responseText,
        time: new Date().toLocaleTimeString('ar-EG'),
      };

      if (userInput) {
        setChatHistory(prev => [...prev, { role: 'user', content: userInput, id: Date.now() - 1 }, newMessage]);
      } else {
        setChatHistory(prev => [...prev, newMessage]);
      }
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
        setChatHistory(prev => [...prev, { role: 'user', content: `[صورة مرفوعة]: ${url}`, type: 'image', id: Date.now() }]);
      }
    } catch (e) { console.error(e); }
  };

  const styles = {
    container: { background: 'linear-gradient(180deg, #FFF5F7 0%, #FCE4EC 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl', fontFamily: 'Arial' },
    card: { background: 'rgba(255,255,255,0.9)', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 30px rgba(233, 30, 99, 0.05)', marginBottom: '15px', border: '1px solid #fff' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.3s' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' },
    chatInputArea: { padding: '15px', background: '#fff', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #eee' },
    inputField: { flex: 1, border: '1px solid #eee', padding: '12px 20px', borderRadius: '25px', outline: 'none', background: '#f9f9f9' }
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة"] },
    { id: 2, title: "البيانات الحيوية", emoji: "⚖️", fields: ["العمر", "الوزن"] },
    { id: 3, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع"] },
    { id: 4, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء"] },
  ];

  return (
    <div style={styles.container}>
      <PeriodClock prediction={prediction} startDate={data['سجل التواريخ_تاريخ البدء']} />

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button onClick={() => setShowChat(true)} style={{ background: '#FFF', border: '1.5px solid #E91E63', color: '#E91E63', padding: '8px 20px', borderRadius: '15px', fontWeight: 'bold' }}>💬 الدردشة</button>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ color: '#ad1457', margin: 0, fontSize: '18px' }}>ذكاء رقة الاصطناعي</h3>
          </div>
        </div>

        <button onClick={calculateAndSave} style={{ ...styles.btnPrimary, background: '#F8BBD0', color: '#880E4F' }}>توقع وحفظ البيانات وإرسال إشعار ✨</button>
      </div>

      {sections.map((sec) => (
        <div key={sec.id} style={styles.card}>
          <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#444' }}>{sec.emoji} {sec.title}</span>
            <span style={{ color: '#E91E63' }}>{openAccordion === sec.id ? '▲' : '▼'}</span>
          </div>
          {openAccordion === sec.id && (
            <div style={{ padding: '15px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {sec.fields.map(field => (
                <div key={field}>
                  <label style={{ fontSize: '11px', color: '#999', marginBottom: '5px', display: 'block' }}>{field}</label>
                  <input 
                    type={field.includes('تاريخ') ? 'date' : 'text'}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #FFD1DF', outline: 'none' }}
                    value={data[`${sec.title}_${field}`] || ''}
                    onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={() => handleProcess()} style={{ ...styles.btnPrimary, marginTop: '10px', boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)' }} disabled={loading}>
        {loading ? "جاري تحليل البيانات..." : "تحليل متخصص وتقرير طويل ✨"}
      </button>

      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer', fontSize: '24px' }}>✕</span>
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>طبيبة رقة</span>
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
                boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                lineHeight: '1.6', fontSize: '14px', whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>
            ))}
            {loading && <div style={{ color: '#E91E63', fontSize: '12px' }}>رقة تفكر الآن... 🌸</div>}
          </div>
          <div style={styles.chatInputArea}>
            <input 
              placeholder="اكتبي استفسارك هنا..." 
              style={styles.inputField}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') handleProcess(chatInput); }}
            />
            <button onClick={() => handleProcess(chatInput)} style={{ background: '#E91E63', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer' }}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker;
