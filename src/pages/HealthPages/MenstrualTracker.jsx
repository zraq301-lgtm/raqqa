import React, { useState, useEffect, useMemo } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

// --- مكون الساعة الأنيقة المطور ---
const PeriodClock = ({ prediction, startDate }) => {
  const [rotation, setRotation] = useState(0);
  const cycleLength = 29;

  const dayInfo = useMemo(() => {
    if (!startDate) return { currentDay: 0, color: '#eee' };
    const today = new Date();
    const start = new Date(startDate);
    const diffDays = Math.floor(Math.abs(today - start) / (1000 * 60 * 60 * 24)) % cycleLength;
    
    let color = '#eeeeee'; // افتراضي
    if (diffDays <= 5) color = '#ff4d4d'; // حيض
    else if (diffDays >= 12 && diffDays <= 17) color = '#4CAF50'; // خصوبة

    return { currentDay: diffDays, color };
  }, [startDate]);

  useEffect(() => {
    setRotation((dayInfo.currentDay / cycleLength) * 360);
  }, [dayInfo]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', padding: '20px' }}>
      <div style={{ width: '220px', height: '220px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* رسم إطار الساعة الملون بتقنية SVG */}
        <svg width="220" height="220" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
          <circle cx="110" cy="110" r="95" stroke="#f0f0f0" strokeWidth="10" fill="transparent" />
          <circle 
            cx="110" cy="110" r="95" 
            stroke={dayInfo.color} 
            strokeWidth="10" 
            fill="transparent" 
            strokeDasharray="596" 
            strokeDashoffset={596 - (596 * (dayInfo.currentDay + 1)) / cycleLength}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s' }}
          />
        </svg>

        {/* توزيع أرقام الأيام حول الحواف */}
        {[...Array(cycleLength)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            height: '190px',
            transform: `rotate(${(i / cycleLength) * 360}deg)`,
            fontSize: '9px',
            color: i === dayInfo.currentDay ? dayInfo.color : '#bbb',
            fontWeight: i === dayInfo.currentDay ? 'bold' : 'normal',
            paddingTop: '2px'
          }}>
            {i + 1}
          </div>
        ))}

        {/* مؤشر القلب المتدلي */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          transform: `rotate(${rotation}deg)`, transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <span style={{ position: 'absolute', top: '-10px', left: 'calc(50% - 15px)', fontSize: '28px' }}>❤️</span>
        </div>

        <div style={{ textAlign: 'center', background: '#fff', borderRadius: '50%', width: '160px', height: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#999' }}>الدورة القادمة</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#E91E63', margin: '5px 0' }}>
            {prediction ? 'توقع ذكي' : 'أدخلي التاريخ'}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>رقة - متابعكِ اليومي</div>
        </div>
      </div>
    </div>
  );
};

const MenstrualTracker = () => {
  const HealthIcon = iconMap.health;
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('menstrual_data')) || {});
  const [openAccordion, setOpenAccordion] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem('chat_history')) || []);

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

  const sendFirebaseNotification = async (title, body) => {
    const token = localStorage.getItem('fcm_token');
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
        headers: { 'Content-Type': 'application/json' },
        data: { token, title, body }
      });
    } catch (e) { console.error("FCM Error", e); }
  };

  const calculateAndSave = async () => {
    const calc = getAdvancedCalculations(data['سجل التواريخ_تاريخ البدء']);
    if (!calc) return alert("الرجاء تحديد تاريخ البدء");
    setPrediction(calc);

    try {
      const options = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1, category: 'cycle_prediction',
          title: 'توقع دورة جديد 🌸',
          body: `موعدك القادم: ${calc.nextDateAr}`,
          startDate: data['سجل التواريخ_تاريخ البدء'],
          scheduled_for: calc.nextDate
        }
      };
      await CapacitorHttp.post(options);
      await sendFirebaseNotification("تحديث رقة 🌸", `تم جدولة موعد دورتك القادمة بتاريخ ${calc.nextDateAr}`);
    } catch (err) { console.error(err); }
  };

  const handleProcess = async (userInput = null) => {
    setLoading(true);
    const calc = getAdvancedCalculations(data['سجل التواريخ_تاريخ البدء']);
    const promptText = `أنتِ الدكتورة رقة، خبيرة النسائية والتوليد. 
    بناءً على الأعراض: ${JSON.stringify(data)} وموعد الدورة القادم: ${calc?.nextDateAr}.
    قدمي تحليلاً طبياً مفصلاً جداً وطويلاً (تقرير متكامل) يوجه النصائح الغذائية، النفسية، والطبية بشكل مشخص ومميز. 
    السؤال: ${userInput || "حللي حالتي الصحية الحالية"}`;

    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      });
      const aiReply = response.data.reply || response.data.message;
      const newMessage = { id: Date.now(), role: 'ai', content: aiReply, time: new Date().toLocaleTimeString('ar-EG') };
      setChatHistory(prev => userInput ? [...prev, { role: 'user', content: userInput }, newMessage] : [...prev, newMessage]);
      setChatInput('');
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleMedia = async (type) => {
    const base64 = type === 'camera' ? await takePhoto() : await fetchImage();
    if (base64) {
      setLoading(true);
      const url = await uploadToVercel(base64, `doc_${Date.now()}.png`, 'image/png');
      handleProcess(`لقد رفعت صورة طبية للمراجعة: ${url}`);
    }
  };

  const styles = {
    container: { background: 'linear-gradient(180deg, #FDF4F5 0%, #F8E1E7 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl' },
    card: { background: '#fff', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 24px rgba(233, 30, 99, 0.08)', marginBottom: '15px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 'bold' },
    chatOverlay: { position: 'fixed', inset: 0, background: '#fff', zIndex: 1000, display: 'flex', flexDirection: 'column' }
  };

  return (
    <div style={styles.container}>
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
      </div>

      {[{ id: 1, title: "سجل التواريخ", fields: ["تاريخ البدء", "تاريخ الانتهاء"] }, { id: 3, title: "الأعراض الجسدية", fields: ["تشنجات", "صداع"] }].map((sec) => (
        <div key={sec.id} style={styles.card}>
          <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
            <span>{sec.title}</span><span>{openAccordion === sec.id ? '▲' : '▼'}</span>
          </div>
          {openAccordion === sec.id && (
            <div style={{ padding: '10px 0' }}>
              {sec.fields.map(field => (
                <input key={field} type={field.includes('تاريخ') ? 'date' : 'text'} placeholder={field} style={{ width: '100%', padding: '10px', marginBottom: '5px', borderRadius: '10px', border: '1px solid #eee' }} 
                value={data[`${sec.title}_${field}`] || ''} onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})} />
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={() => { setShowChat(true); handleProcess(); }} style={styles.btnPrimary} disabled={loading}>
        {loading ? "جاري التحليل..." : "تحليل الأعراض وتقديم نصائح"}
      </button>

      {showChat && (
        <div style={styles.chatOverlay}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
            <span onClick={() => setShowChat(false)}>✕ عودة</span>
            <strong>طبيبة رقة: تقرير طبي</strong>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? '#E91E63' : '#fff', color: msg.role === 'user' ? '#fff' : '#333', padding: '12px', borderRadius: '15px', marginBottom: '10px', maxWidth: '85%', marginLeft: msg.role === 'user' ? 'auto' : '0' }}>
                {msg.content}
              </div>
            ))}
          </div>
          <div style={{ padding: '10px', display: 'flex', gap: '5px', background: '#fff' }}>
            <button onClick={() => handleMedia('camera')} style={{ background: '#fce4ec', border: 'none', borderRadius: '50%', width: '40px' }}>📷</button>
            <input style={{ flex: 1, border: '1px solid #eee', padding: '10px', borderRadius: '20px' }} value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="اسألي طبيبتك..." />
            <button onClick={() => handleProcess(chatInput)} style={{ background: '#E91E63', color: '#fff', border: 'none', borderRadius: '50%', width: '40px' }}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker;
