import React, { useState, useEffect, useMemo } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

// --- مكون الساعة الأنيقة المطور بأرقام الأيام وحلقات التقدم ---
const PeriodClock = ({ prediction, startDate }) => {
  const [rotation, setRotation] = useState(0);
  const cycleLength = 29;

  const status = useMemo(() => {
    if (!startDate) return { color: '#eee', day: 0 };
    const today = new Date();
    const start = new Date(startDate);
    const diffDays = Math.floor(Math.abs(today - start) / (1000 * 60 * 60 * 24)) % cycleLength;
    
    let color = '#eeeeee'; 
    if (diffDays <= 5) color = '#ff4d4d'; // أحمر
    else if (diffDays >= 12 && diffDays <= 17) color = '#4CAF50'; // أخضر
    else color = '#FFF'; // أبيض

    return { color, day: diffDays };
  }, [startDate]);

  useEffect(() => {
    setRotation((status.day / cycleLength) * 360);
  }, [status]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', padding: '20px', background: 'rgba(255,255,255,0.5)', borderRadius: '30px' }}>
      <div style={{ width: '200px', height: '200px', borderRadius: '50%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
        
        {/* شريط التقدم الدائري (SVG) للحفاظ على الوسط فارغاً */}
        <svg width="200" height="200" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
          <circle cx="100" cy="100" r="90" stroke="#f3f3f3" strokeWidth="8" fill="transparent" />
          <circle 
            cx="100" cy="100" r="90" 
            stroke={status.color === '#FFF' ? '#f3f3f3' : status.color} 
            strokeWidth="8" fill="transparent" 
            strokeDasharray="565" 
            strokeDashoffset={565 - (565 * (status.day + 1)) / cycleLength}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>

        {/* توزيع أرقام الأيام حول الحافة */}
        {[...Array(cycleLength)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', height: '170px',
            transform: `rotate(${(i / cycleLength) * 360}deg)`,
            fontSize: '9px', color: i === status.day ? '#E91E63' : '#ccc',
            fontWeight: i === status.day ? 'bold' : 'normal', paddingTop: '2px'
          }}>
            {i + 1}
          </div>
        ))}

        {/* مؤشر القلب */}
        <div style={{ position: 'absolute', width: '100%', height: '100%', transform: `rotate(${rotation}deg)`, transition: 'transform 1s ease-in-out' }}>
          <span style={{ position: 'absolute', top: '-15px', left: 'calc(50% - 12px)', fontSize: '24px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>❤️</span>
        </div>

        <div style={{ textAlign: 'center', zIndex: 2 }}>
          <div style={{ fontSize: '12px', color: '#999' }}>الدورة القادمة</div>
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

  // --- إرسال إشعار Firebase ---
  const sendFirebaseNotification = async (title, body) => {
    try {
      const token = localStorage.getItem('fcm_token');
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
        headers: { 'Content-Type': 'application/json' },
        data: { token, title, body }
      });
    } catch (e) { console.error("Notification Error", e); }
  };

  const calculateAndSave = async () => {
    const calc = getAdvancedCalculations(data['سجل التواريخ_تاريخ البدء']);
    if (!calc) return alert("الرجاء تحديد تاريخ البدء أولاً");
    setPrediction(calc);
    try {
      const savedToken = localStorage.getItem('fcm_token');
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1, category: 'cycle_prediction',
          title: 'توقع دورة جديد 🌸',
          body: `موعدك القادم المتوقع: ${calc.nextDateAr}`,
          startDate: data['سجل التواريخ_تاريخ البدء'],
          scheduled_for: calc.nextDate,
          fcmToken: savedToken || undefined
        }
      });
      await sendFirebaseNotification("تحديث من رقة", "تم حفظ بيانات دورتكِ بنجاح وتوقع الموعد القادم.");
    } catch (err) { console.error(err); }
  };

  const handleProcess = async (userInput = null) => {
    setLoading(true);
    const summary = JSON.stringify(data);
    const calc = getAdvancedCalculations(data['سجل التواريخ_تاريخ البدء']);
    
    try {
      // البرومبت المتخصص لتقرير طويل ومميز
      const promptText = `أنتِ الدكتورة "رقة"، خبيرة استشارية في الصحة النسائية. 
      حللي هذه البيانات بدقة: ${summary}. التوقعات: ${calc?.nextDateAr}.
      المطلوب: كتابة تقرير طبي متخصص، مفصل جداً، وطويل (أكثر من 250 كلمة). 
      يجب أن يتضمن التقرير تحليل الهرمونات المتوقع، نصائح نمط الحياة، وتوجيهات نفسية حنونة. 
      السؤال الحالي: ${userInput || "أريد تحليلاً شاملاً لحالتي"}`;

      const aiResponse = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      });

      const responseText = aiResponse.data.reply || aiResponse.data.message || "التحليل جاهز في سجل المحادثة.";
      const newMessage = { id: Date.now(), role: 'ai', content: responseText, time: new Date().toLocaleTimeString('ar-EG') };
      setChatHistory(prev => userInput ? [...prev, { role: 'user', content: userInput, id: Date.now() + 1 }, newMessage] : [...prev, newMessage]);
      setChatInput('');
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleMedia = async (type) => {
    const base64 = type === 'camera' ? await takePhoto() : await fetchImage();
    if (base64) {
      setLoading(true);
      const url = await uploadToVercel(base64, `user_upload_${Date.now()}.png`, 'image/png');
      handleProcess(`لقد رفعت صورة للتحليل: ${url}`);
    }
  };

  const styles = {
    container: { background: 'linear-gradient(180deg, #FDF4F5 0%, #F8E1E7 100%)', minHeight: '100vh', padding: '20px', direction: 'rtl' },
    card: { background: '#fff', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 24px rgba(233, 30, 99, 0.08)', marginBottom: '15px' },
    btnPrimary: { width: '100%', padding: '16px', background: '#E91E63', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer' },
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
        <button onClick={calculateAndSave} style={{ ...styles.btnPrimary, background: '#fce4ec', color: '#ad1457', marginBottom: '10px' }}>توقع التقويم وحفظ البيانات ✨</button>
        {prediction && <div style={{ fontSize: '13px', color: '#E91E63' }}>الموعد القادم: {prediction.nextDateAr}</div>}
      </div>

      {[{ id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء"] }, { id: 3, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "انتفاخ", "صداع"] }].map((sec) => (
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
                  <input type={field.includes('تاريخ') ? 'date' : 'text'} style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #FFE1E9' }}
                    value={data[`${sec.title}_${field}`] || ''} onChange={(e) => setData({...data, [`${sec.title}_${field}`]: e.target.value})} />
                </div>
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
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span onClick={() => setShowChat(false)} style={{ cursor: 'pointer' }}>✕ عودة</span>
            <strong>الدكتورة رقة</strong>
            <button onClick={() => setChatHistory([])} style={{ background: 'none', border: 'none', color: '#fff' }}>مسح</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#FDF4F5' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? '#E91E63' : '#fff', color: msg.role === 'user' ? '#fff' : '#333', padding: '12px', borderRadius: '15px', marginBottom: '10px', maxWidth: '85%', marginLeft: msg.role === 'user' ? 'auto' : '0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', lineHeight: '1.6' }}>
                {msg.content}
              </div>
            ))}
          </div>
          <div style={{ padding: '10px', background: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => handleMedia('camera')} style={{ background: '#fce4ec', border: 'none', padding: '10px', borderRadius: '50%' }}>📷</button>
            <input placeholder="اسألي رقة..." style={{ flex: 1, border: '1px solid #eee', padding: '12px', borderRadius: '25px' }} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleProcess(chatInput)} />
            <button onClick={() => handleProcess(chatInput)} style={{ background: '#E91E63', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%' }}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker;
