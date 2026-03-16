import React, { useState, useEffect, useMemo } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

// --- مكون الساعة المطور (بألوان ونصوص توضيحية) ---
const PeriodClock = ({ prediction, startDate, cycleDuration = 29, periodDays = 5 }) => {
  const [rotation, setRotation] = useState(0);
  
  const clockLayout = useMemo(() => {
    const cycle = parseInt(cycleDuration) || 29;
    const period = parseInt(periodDays) || 5;
    const periodDeg = (period / cycle) * 360;
    const ovulationDay = cycle - 14;
    const fertilityStartDeg = ((ovulationDay - 3) / cycle) * 360;
    const fertilityEndDeg = ((ovulationDay + 2) / cycle) * 360;

    return { periodEnd: periodDeg, fertilityStart: fertilityStartDeg, fertilityEnd: fertilityEndDeg, cycle };
  }, [cycleDuration, periodDays]);

  const dayNumbers = useMemo(() => {
    const days = [];
    for (let i = 1; i <= clockLayout.cycle; i++) {
      const angle = (i / clockLayout.cycle) * 360 - 90;
      days.push({ day: i, angle });
    }
    return days;
  }, [clockLayout.cycle]);

  useEffect(() => {
    if (!startDate) return;
    const today = new Date();
    const start = new Date(startDate);
    const diffDays = Math.floor(Math.abs(today - start) / (1000 * 60 * 60 * 24)) % clockLayout.cycle;
    setRotation((diffDays / clockLayout.cycle) * 360);
  }, [startDate, clockLayout.cycle]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', padding: '20px', background: 'rgba(255,255,255,0.7)', borderRadius: '35px', backdropFilter: 'blur(10px)' }}>
      {/* مفتاح الألوان (Labels) */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '11px', fontWeight: 'bold' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', background: '#ff4d4d', borderRadius: '2px' }}></div> أيام الحيض</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', background: '#4CAF50', borderRadius: '2px' }}></div> أيام الخصوبة</div>
      </div>

      <div style={{ width: '220px', height: '220px', borderRadius: '50%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 15px 35px rgba(233, 30, 99, 0.15)', background: '#fff' }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: `conic-gradient(#ff4d4d 0deg ${clockLayout.periodEnd}deg, #f0f0f0 ${clockLayout.periodEnd}deg ${clockLayout.fertilityStart}deg, #4CAF50 ${clockLayout.fertilityStart}deg ${clockLayout.fertilityEnd}deg, #f0f0f0 ${clockLayout.fertilityEnd}deg 360deg)`, opacity: 0.25, clipPath: 'circle(50% at 50% 50%)' }}></div>
        {dayNumbers.map((d) => (
          <div key={d.day} style={{ position: 'absolute', transform: `rotate(${d.angle}deg) translate(95px) rotate(${-d.angle}deg)`, fontSize: '9px', fontWeight: 'bold', color: d.day <= (parseInt(periodDays) || 5) ? '#ff4d4d' : '#888' }}>{d.day}</div>
        ))}
        <div style={{ position: 'absolute', width: '100%', height: '100%', transform: `rotate(${rotation}deg)`, transition: 'transform 1.5s' }}><span style={{ position: 'absolute', top: '-10px', left: 'calc(50% - 12px)', fontSize: '24px' }}>💖</span></div>
        <div style={{ textAlign: 'center', zIndex: 2 }}>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#E91E63' }}>{prediction ? 'رقة تتوقع' : 'أهلاً بكِ'}</div>
        </div>
      </div>
    </div>
  );
};

const MenstrualTracker = () => {
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('menstrual_data')) || {});
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem('chat_history')) || []);
  const [openAccordion, setOpenAccordion] = useState(1);

  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
  }, [data, chatHistory]);

  const calculateAndSave = async () => {
    const startStr = data['سجل التواريخ_تاريخ البدء'];
    if (!startStr) return alert("الرجاء تحديد تاريخ البدء");

    const cycleLen = parseInt(data['سجل التواريخ_مدة الدورة']) || 29;
    const start = new Date(startStr);
    
    // حساب الموعد القادم والخصوبة
    const nextDate = new Date(start);
    nextDate.setDate(start.getDate() + cycleLen);
    const ovulation = new Date(nextDate);
    ovulation.setDate(nextDate.getDate() - 14);
    const fertStart = new Date(ovulation); fertStart.setDate(ovulation.getDate() - 5);

    const calc = {
      nextDate: nextDate.toLocaleDateString('ar-EG'),
      fertility: `${fertStart.toLocaleDateString('ar-EG')} - ${ovulation.toLocaleDateString('ar-EG')}`,
      status: "تم الحساب والمزامنة"
    };
    setPrediction(calc);

    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
        headers: { 'Content-Type': 'application/json' },
        data: { 
          title: "تحديث رقة 🌸", 
          body: `الدورة القادمة: ${calc.nextDate}. فترة الخصوبة تبدأ: ${fertStart.toLocaleDateString('ar-EG')}`,
          payload: { ...data, ...calc } 
        }
      });
      alert("تم الحفظ وإرسال إشعار Firebase");
    } catch (err) { console.error("FCM Error", err); }
  };

  const handleProcess = async (userInput = null) => {
    setLoading(true);
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `تحليل طبي متخصص وطويل جداً لتطبيق رقة. البيانات: ${JSON.stringify(data)}. المطلوب: تقرير مفصل عن الحالة، نصائح غذائية، توقعات هرمونية، وإرشادات نفسية راقية.` }
      });
      const aiMsg = { id: Date.now(), role: 'ai', content: response.data.reply || response.data.content || "التقرير جاهز.", time: new Date().toLocaleTimeString('ar-EG') };
      setChatHistory(prev => userInput ? [...prev, { role: 'user', content: userInput, id: Date.now() - 1 }, aiMsg] : [...prev, aiMsg]);
      if (!userInput) setShowChat(true);
    } catch (err) { alert("عذراً، حدث خطأ في تحليل الذكاء الاصطناعي"); } finally { setLoading(false); }
  };

  const styles = {
    container: { background: 'linear-gradient(180deg, #FFF5F7 0%, #FCE4EC 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl', fontFamily: 'Arial' },
    card: { background: 'rgba(255,255,255,0.9)', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 30px rgba(233, 30, 99, 0.05)', marginBottom: '15px' },
    input: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #FFD1DF', outline: 'none', marginTop: '5px', fontSize: '14px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة", "مدة الحيض"] },
    { id: 2, title: "البيانات الحيوية", emoji: "⚖️", fields: ["العمر", "الوزن"] },
    { id: 3, title: "الأعراض", emoji: "😖", fields: ["تشنجات", "صداع"] },
  ];

  return (
    <div style={styles.container}>
      <PeriodClock startDate={data['سجل التواريخ_تاريخ البدء']} cycleDuration={data['سجل التواريخ_مدة الدورة']} periodDays={data['سجل التواريخ_مدة الحيض']} prediction={prediction} />

      {prediction && (
        <div style={{ ...styles.card, background: '#E91E63', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '14px' }}>الدورة القادمة: <b>{prediction.nextDate}</b></div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>فترة الخصوبة: {prediction.fertility}</div>
        </div>
      )}

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <button onClick={() => setShowChat(true)} style={{ background: '#FFF', border: '1.5px solid #E91E63', color: '#E91E63', padding: '8px 15px', borderRadius: '12px', fontWeight: 'bold' }}>💬 سجل التقارير</button>
          <h4 style={{ margin: 0, color: '#ad1457' }}>إدخال البيانات الحيوية</h4>
        </div>
        
        {sections.map(sec => (
          <div key={sec.id} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', fontWeight: 'bold', color: '#444' }}>{sec.emoji} {sec.title}</div>
            {openAccordion === sec.id && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                {sec.fields.map(f => (
                  <div key={f}>
                    <label style={{ fontSize: '10px', color: '#888' }}>{f}</label>
                    <input 
                      type={f.includes('تاريخ') ? 'date' : 'text'} 
                      style={styles.input} 
                      value={data[`${sec.title}_${f}`] || ''} 
                      onChange={(e) => setData({ ...data, [`${sec.title}_${f}`]: e.target.value })} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <button onClick={calculateAndSave} style={styles.btnPrimary}>حفظ البيانات وإرسال إشعار 🔔</button>
        <button onClick={() => handleProcess()} style={{ ...styles.btnPrimary, background: '#ad1457' }} disabled={loading}>
          {loading ? "جاري إنشاء التقرير..." : "تحليل الذكاء الاصطناعي (تقرير طويل) ✨"}
        </button>
      </div>

      {showChat && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer' }}>✕ إغلاق</span>
            <span style={{ fontWeight: 'bold' }}>تقرير رقة الطبي</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? '#E91E63' : '#fff', color: msg.role === 'user' ? '#fff' : '#333', padding: '15px', borderRadius: '15px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {msg.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker;
