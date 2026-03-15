import React, { useState, useEffect, useMemo } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

// --- مكون الساعة الأنيقة ---
const PeriodClock = ({ prediction, startDate }) => {
  const [rotation, setRotation] = useState(0);
  const [statusColor, setStatusColor] = useState('#fff');

  useEffect(() => {
    if (!startDate) return;

    const today = new Date();
    const start = new Date(startDate);
    const cycleLength = 29; // طول الدورة الافتراضي
    
    // حساب اليوم الحالي في الدورة (1 - 29)
    const diffTime = Math.abs(today - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) % cycleLength;
    
    // تحريك المؤشر (360 درجة مقسمة على 29 يوم)
    const angle = (diffDays / cycleLength) * 360;
    setRotation(angle);

    // تحديد اللون بناءً على المرحلة
    if (diffDays <= 5) {
      setStatusColor('#ff4d4d'); // أحمر - أيام الحيض
    } else if (diffDays >= 12 && diffDays <= 17) {
      setStatusColor('#4CAF50'); // أخضر - أيام الخصوبة
    } else {
      setStatusColor('#fff'); // أبيض - أيام عادية
    }
  }, [startDate, prediction]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px',
      padding: '20px', background: 'rgba(255,255,255,0.5)', borderRadius: '30px'
    }}>
      <div style={{
        width: '180px', height: '180px', borderRadius: '50%', border: `8px solid ${statusColor}`,
        position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)', background: '#fff'
      }}>
        {/* أرقام توضيحية بسيطة */}
        <div style={{ fontSize: '12px', color: '#999', position: 'absolute', top: '10px' }}>الدورة القادمة</div>
        
        {/* مؤشر القلب */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          transform: `rotate(${rotation}deg)`, transition: 'transform 1s ease-in-out'
        }}>
          <span style={{
            position: 'absolute', top: '-15px', left: 'calc(50% - 12px)',
            fontSize: '24px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }}>❤️</span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#E91E63' }}>
            {prediction ? 'توقع ذكي' : 'أدخلي التاريخ'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>رقة - متابعكِ اليومي</div>
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
  const [notifications, setNotifications] = useState([]);
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
    const lunarDate = lunarFormatter.format(nextDate);

    return {
      nextDate: nextDate.toLocaleDateString('en-CA'), // صيغة YYYY-MM-DD للحفظ
      nextDateAr: nextDate.toLocaleDateString('ar-EG'),
      lunarDate: lunarDate,
      ovulation: ovulationDay.toLocaleDateString('ar-EG'),
      fertilityWindow: `${fertilityStart.toLocaleDateString('ar-EG')} إلى ${ovulationDay.toLocaleDateString('ar-EG')}`
    };
  };

  const calculateAndSave = async () => {
    const calc = getAdvancedCalculations(data['سجل التواريخ_تاريخ البدء']);
    if (!calc) return alert("الرجاء تحديد تاريخ البدء أولاً");
    
    setPrediction(calc);

    // حفظ المدخلات في Neon عبر الرابط المزود
    try {
      const savedToken = localStorage.getItem('fcm_token');
      const options = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1,
          category: 'cycle_prediction',
          title: 'توقع دورة جديد 🌸',
          body: `موعدك القادم المتوقع: ${calc.nextDateAr}. نافذة الخصوبة: ${calc.fertilityWindow}`,
          startDate: data['سجل التواريخ_تاريخ البدء'],
          scheduled_for: calc.nextDate,
          fcmToken: savedToken || undefined,
          note: `التبويض: ${calc.ovulation}`
        }
      };
      await CapacitorHttp.post(options);
      console.log("تم حفظ التوقعات في نيون بنجاح");
    } catch (err) {
      console.error("فشل حفظ البيانات:", err);
    }
  };

  const handleProcess = async (userInput = null) => {
    setLoading(true);
    const calc = getAdvancedCalculations(data['سجل التواريخ_تاريخ البدء']);
    const summary = JSON.stringify(data);

    try {
      const promptText = `أنت طبيبة "رقة" الخبيرة... تحليل الحالة: ${summary}, التوقعات: ${calc?.nextDateAr}`;
      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      };

      const aiResponse = await CapacitorHttp.post(aiOptions);
      const responseText = aiResponse.data.reply || "عذراً، لم أتمكن من التحليل حالياً.";

      const newMessage = {
        id: Date.now(),
        role: 'ai',
        content: responseText,
        time: new Date().toLocaleTimeString('ar-EG'),
      };

      setChatHistory(prev => userInput ? [...prev, { role: 'user', content: userInput, id: Date.now() + 1 }, newMessage] : [...prev, newMessage]);
      setChatInput('');
    } catch (err) {
      console.error("خطأ AI:", err);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { background: 'linear-gradient(180deg, #FDF4F5 0%, #F8E1E7 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl' },
    card: { background: '#fff', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 24px rgba(233, 30, 99, 0.08)', marginBottom: '15px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' },
    badge: { background: '#FFF0F3', color: '#E91E63', padding: '5px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', marginTop: '5px' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 1000, display: 'flex', flexDirection: 'column' },
    chatInputArea: { padding: '10px', background: '#F9F9F9', display: 'flex', alignItems: 'center', gap: '5px', borderTop: '1px solid #eee' },
    inputField: { flex: 1, border: 'none', padding: '12px', borderRadius: '20px', outline: 'none' },
    sendBtn: { background: '#E91E63', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة"] },
    { id: 2, title: "البيانات الحيوية", emoji: "⚖️", fields: ["العمر", "الوزن"] },
    { id: 3, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع"] },
    { id: 4, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء"] },
  ];

  return (
    <div style={styles.container}>
      {/* الساعة في أعلى الشاشة */}
      <PeriodClock prediction={prediction} startDate={data['سجل التواريخ_تاريخ البدء']} />

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button onClick={() => setShowChat(true)} style={{ background: '#FFF', border: '1px solid #E91E63', color: '#E91E63', padding: '8px 15px', borderRadius: '12px', fontWeight: 'bold' }}>💬 استشارة رقة</button>
          <div style={{ textAlign: 'right' }}>
            <HealthIcon size={30} color="#E91E63" />
            <h3 style={{ color: '#ad1457', margin: 0 }}>طبيبة رقة الذكية</h3>
          </div>
        </div>

        <button onClick={calculateAndSave} style={{ ...styles.btnPrimary, background: '#fce4ec', color: '#ad1457' }}>توقع التقويم وحفظ البيانات ✨</button>
        
        {prediction && (
          <div style={{ marginTop: '10px', padding: '10px', borderTop: '1px dashed #FFC1D6' }}>
            <div style={{ color: '#E91E63', fontSize: '14px' }}>📅 القادمة: <strong>{prediction.nextDateAr}</strong></div>
            <div style={{ color: '#888', fontSize: '12px' }}>🌙 قمري: {prediction.lunarDate}</div>
            <div style={styles.badge}>✨ نافذة الخصوبة: {prediction.fertilityWindow}</div>
          </div>
        )}
      </div>

      {sections.map((sec) => (
        <div key={sec.id} style={styles.card}>
          <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '600' }}>{sec.emoji} {sec.title}</span>
            <span>{openAccordion === sec.id ? '▲' : '▼'}</span>
          </div>
          {openAccordion === sec.id && (
            <div style={{ padding: '15px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {sec.fields.map(field => (
                <div key={field}>
                  <label style={{ fontSize: '11px', color: '#888' }}>{field}</label>
                  <input 
                    type={field.includes('تاريخ') ? 'date' : 'text'}
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #FFE1E9' }}
                    value={data[`${sec.title}_${field}`] || ''}
                    onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={() => { setShowChat(true); handleProcess(); }} style={styles.btnPrimary} disabled={loading}>
        {loading ? "جاري التحليل..." : "تحليل الأعراض وتقديم نصائح"}
      </button>

      {/* شاشة الاستشارة (Chat) */}
      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer', fontSize: '20px' }}>✕</span>
            <span style={{ fontWeight: 'bold' }}>طبيبة رقة</span>
            <button onClick={() => setChatHistory([])} style={{ background: 'none', border: 'none', color: '#fff' }}>مسح</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#E91E63' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#333',
                padding: '12px', borderRadius: '15px', marginBottom: '10px', maxWidth: '85%',
                marginLeft: msg.role === 'user' ? 'auto' : '0',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
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
            <button onClick={() => handleProcess(chatInput)} style={styles.sendBtn}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker;
