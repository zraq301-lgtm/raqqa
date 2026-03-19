import React, { useState, useEffect, useMemo } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

// --- مكون الساعة المطور (بناءً على التقويم القمري 29 يوماً) ---
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
      
      {prediction && (
        <div style={{ width: '100%', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ background: '#FFF0F3', padding: '10px', borderRadius: '15px', border: '1px solid #FFD1DF', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#E91E63', fontWeight: 'bold' }}>موعد الدورة القادمة: </span>
            <span style={{ fontSize: '14px', color: '#880E4F', fontWeight: '900' }}>{prediction.nextDate}</span>
          </div>
          <div style={{ background: '#F0FFF4', padding: '10px', borderRadius: '15px', border: '1px solid #C6F6D5', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#38A169', fontWeight: 'bold' }}>فترة الخصوبة: </span>
            <span style={{ fontSize: '13px', color: '#22543D', fontWeight: '900' }}>{prediction.fertility}</span>
          </div>
        </div>
      )}

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
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#E91E63' }}>{prediction ? 'توقعات رقة' : 'أهلاً بكِ'}</div>
        </div>
      </div>
    </div>
  );
};

const MenstrualTracker = () => {
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('menstrual_data')) || {});
  const [prediction, setPrediction] = useState(() => JSON.parse(localStorage.getItem('last_prediction')) || null);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem('chat_history')) || []);
  const [savedNotes, setSavedNotes] = useState(() => JSON.parse(localStorage.getItem('saved_notes')) || []);
  const [openAccordion, setOpenAccordion] = useState(1);
  const [showSavedList, setShowSavedList] = useState(false);

  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
    localStorage.setItem('saved_notes', JSON.stringify(savedNotes));
    if (prediction) {
      localStorage.setItem('last_prediction', JSON.stringify(prediction));
    }
  }, [data, chatHistory, savedNotes, prediction]);

  const saveAndNotify = async (categoryTitle, currentAnalysis, currentPrediction) => {
    const savedToken = localStorage.getItem('fcm_token');
    
    // استخدام التاريخ المتوقع من المعامل الممرر لضمان أحدث قيمة
    let actualScheduledDate = new Date().toISOString(); 
    if (currentPrediction && currentPrediction.nextDate) {
        const dateParts = currentPrediction.nextDate.split('/');
        if (dateParts.length === 3) {
            // تحويل من صيغة YYYY/M/D المتوقعة من toLocaleDateString('ar-EG')
            const formattedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            actualScheduledDate = formattedDate.toISOString();
        }
    }

    const healthPayload = {
      fcmToken: savedToken || undefined,
      user_id: 1,
      category: 'medical_report',
      title: `تقرير جديد: ${categoryTitle} 🩺`,
      body: currentAnalysis.substring(0, 100) + "...",
      scheduled_for: actualScheduledDate, 
      note: `تحليل آلي لـ ${categoryTitle} | موعد القادمة: ${currentPrediction?.nextDate || 'غير محدد'} | البداية: ${data['سجل التواريخ_تاريخ البدء']} | النهاية: ${data['سجل التواريخ_تاريخ الانتهاء']} | الخصوبة: ${currentPrediction?.fertility || 'غير محدد'}`
    };

    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: healthPayload
      });

      if (savedToken) {
        await CapacitorHttp.post({
          url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
          headers: { 'Content-Type': 'application/json' },
          data: {
            token: savedToken,
            title: 'تنبيه طبي جديد 🔔',
            body: `تم تحديث ملفك الطبي بخصوص ${categoryTitle}.`,
            data: { type: 'medical_report' }
          }
        });
      }
      console.log("تم الحفظ والإرسال بنجاح ✅");
    } catch (err) {
      console.error("خطأ في عملية المزامنة:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', content: chatInput, time: new Date().toLocaleTimeString('ar-EG') };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setLoading(true);

    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة، سؤالي هو: ${userMsg.content}. مع مراعاة بياناتي: ${JSON.stringify(data)}` }
      });
      const responseText = response.data.reply || response.data.content || response.data.message;
      const aiMsg = { id: Date.now() + 1, role: 'ai', content: responseText, time: new Date().toLocaleTimeString('ar-EG') };
      setChatHistory(prev => [...prev, aiMsg]);
      
      await saveAndNotify("استشارة فورية", responseText, prediction);

    } catch (err) {
      console.error("AI Error", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = (id) => {
    setChatHistory(prev => prev.filter(msg => msg.id !== id));
  };

  const saveToNotes = (msg) => {
    if (!savedNotes.find(n => n.id === msg.id)) {
      setSavedNotes(prev => [...prev, msg]);
      alert('تم الحفظ في المفضلة');
    }
  };

  const handleSaveAndAnalyze = async () => {
    const startStr = data['سجل التواريخ_تاريخ البدء'];
    if (!startStr) return;
    setLoading(true);
    
    const cycleLen = parseInt(data['سجل التواريخ_مدة الدورة']) || 29;
    const start = new Date(startStr);
    const nextDate = new Date(start);
    nextDate.setDate(start.getDate() + cycleLen);
    const ovulation = new Date(nextDate);
    ovulation.setDate(nextDate.getDate() - 14);
    const fertStart = new Date(ovulation); fertStart.setDate(ovulation.getDate() - 5);

    const calc = {
      nextDate: nextDate.toLocaleDateString('ar-EG'),
      fertility: `${fertStart.toLocaleDateString('ar-EG')} - ${ovulation.toLocaleDateString('ar-EG')}`
    };
    setPrediction(calc);

    try {
      const summary = JSON.stringify(data);
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `حللي بيانات الدورة الشهرية بدقة وقدمي تقرير طبي متخصص: ${summary}` }
      });
      const responseText = response.data.reply || response.data.content || response.data.message;
      
      const aiMsg = { id: Date.now(), role: 'ai', content: responseText, time: new Date().toLocaleTimeString('ar-EG') };
      setChatHistory(prev => [...prev, aiMsg]);

      // تمرير calc مباشرة لضمان أخذ التاريخ الجديد فوراً
      await saveAndNotify("تحليل الدورة الشهرية", responseText, calc);

    } catch (e) { console.error(e); }

    setLoading(false);
    setShowChat(true);
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
    container: { background: 'linear-gradient(180deg, #FFF5F7 0%, #FCE4EC 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl', overflowY: 'auto' },
    card: { background: 'rgba(255,255,255,0.9)', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 30px rgba(233, 30, 99, 0.05)', marginBottom: '15px' },
    input: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #FFD1DF', outline: 'none', marginTop: '5px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' },
    chatBar: { padding: '15px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: '10px', alignItems: 'center' },
    chatInput: { flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #FFD1DF', outline: 'none' },
    sendBtn: { background: '#E91E63', color: '#fff', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer' }
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء", "مدة الدورة", "مدة الحيض"] },
    { id: 2, title: "البيانات الحيوية", emoji: "⚖️", fields: ["العمر", "الوزن"] },
    { id: 3, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع"] },
    { id: 4, title: "الحالة المزاجية", emoji: "😰", fields: ["قلق", "عصبية", "هدوء"] },
  ];

  return (
    <div style={styles.container}>
      <PeriodClock 
        startDate={data['سجل التواريخ_تاريخ البدء']} 
        cycleDuration={data['سجل التواريخ_مدة الدورة']} 
        periodDays={data['سجل التواريخ_مدة الحيض']} 
        prediction={prediction} 
      />

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button onClick={() => setShowChat(true)} style={{ background: '#FFF', border: '1.5px solid #E91E63', color: '#E91E63', padding: '8px 20px', borderRadius: '15px', fontWeight: 'bold' }}>💬 استشارة رقة</button>
          <button onClick={() => setShowSavedList(!showSavedList)} style={{ background: '#f0f0f0', border: 'none', padding: '8px 15px', borderRadius: '15px' }}>🔖 المحفوظات</button>
        </div>
        <button onClick={handleSaveAndAnalyze} style={styles.btnPrimary} disabled={loading}>
          {loading ? "جاري الحفظ والتحليل..." : "حفظ البيانات وتحليل طبي شامل ✨"}
        </button>
      </div>

      {showSavedList && (
        <div style={styles.card}>
          <h4 style={{ color: '#E91E63' }}>الردود المحفوظة</h4>
          {savedNotes.map(n => (
            <div key={n.id} style={{ padding: '10px', borderBottom: '1px solid #eee', fontSize: '12px' }}>
              {n.content.substring(0, 50)}...
              <button onClick={() => { setSavedNotes(savedNotes.filter(x => x.id !== n.id)) }} style={{ color: 'red', border: 'none', background: 'none', marginRight: '10px' }}>حذف</button>
            </div>
          ))}
        </div>
      )}

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
                    type={field.includes('تاريخ') ? 'date' : 'text'}
                    style={styles.input}
                    value={data[`${sec.title}_${field}`] || ''}
                    onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {showChat && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer', fontSize: '24px' }}>✕</span>
            <span style={{ fontWeight: 'bold' }}>طبيبة رقة الذكية</span>
            <div style={{ display: 'flex', gap: '15px' }}>
               <span onClick={() => handleMedia('camera')}>📸</span>
               <span onClick={() => handleMedia('gallery')}>🖼️</span>
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg) => (
              <div key={msg.id} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#E91E63' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#333',
                padding: '15px', borderRadius: '20px', marginBottom: '15px', maxWidth: '85%',
                marginLeft: msg.role === 'user' ? 'auto' : '0',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)', whiteSpace: 'pre-wrap',
                position: 'relative'
              }}>
                {msg.content}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '5px' }}>
                  <button onClick={() => deleteMessage(msg.id)} style={{ fontSize: '10px', color: msg.role === 'user' ? '#ffc1c1' : '#E91E63', background: 'none', border: 'none' }}>حذف 🗑️</button>
                  {msg.role === 'ai' && <button onClick={() => saveToNotes(msg)} style={{ fontSize: '10px', color: '#38A169', background: 'none', border: 'none' }}>حفظ 🔖</button>}
                </div>
              </div>
            ))}
            {loading && <p style={{ textAlign: 'center', color: '#E91E63' }}>جاري التفكير...</p>}
          </div>

          <div style={styles.chatBar}>
            <input 
              style={styles.chatInput} 
              placeholder="اسألي طبيبة رقة أي شيء..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} style={styles.sendBtn}>🚀</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker;
