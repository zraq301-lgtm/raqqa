import React, { useState, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

// --- مكون الساعة المطور بأرقام الأيام وألوان المراحل ---
const PeriodClock = ({ startDate }) => {
  const cycleLength = 29;
  const today = new Date();
  const start = startDate ? new Date(startDate) : new Date();
  const diffDays = Math.floor(Math.abs(today - start) / (1000 * 60 * 60 * 24)) % cycleLength;
  
  const rotation = (diffDays / cycleLength) * 360;

  // تحديد لون المرحلة بناءً على اليوم
  const getStageColor = (day) => {
    if (day <= 5) return '#ff4d4d'; // حيض (أحمر)
    if (day >= 12 && day <= 17) return '#4CAF50'; // خصوبة (أخضر)
    return '#eeeeee'; // أيام عادية (رمادي فاتح/أبيض)
  };

  const currentColor = getStageColor(diffDays);

  return (
    <div style={{ position: 'relative', width: '220px', height: '220px', margin: '20px auto' }}>
      {/* إطار الساعة الملون */}
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        border: `10px solid ${currentColor}`,
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: '#fff', position: 'relative'
      }}>
        {/* توزيع أرقام الأيام حول الإطار */}
        {[...Array(cycleLength)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            height: '100%',
            transform: `rotate(${(i / cycleLength) * 360}deg)`,
            paddingTop: '5px',
            fontSize: '9px',
            color: i === diffDays ? '#E91E63' : '#999',
            fontWeight: i === diffDays ? 'bold' : 'normal'
          }}>
            {i + 1}
          </div>
        ))}

        {/* المؤشر (القلب) */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          transform: `rotate(${rotation}deg)`, transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <span style={{ position: 'absolute', top: '-20px', left: 'calc(50% - 12px)', fontSize: '24px' }}>❤️</span>
        </div>

        <div style={{ textAlign: 'center', zIndex: 2 }}>
          <div style={{ fontSize: '14px', color: '#888' }}>اليوم</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#E91E63' }}>{diffDays + 1}</div>
          <div style={{ fontSize: '11px', color: '#ad1457' }}>رقة - متابعكِ الذكي</div>
        </div>
      </div>
    </div>
  );
};

const MenstrualTracker = () => {
  const HealthIcon = iconMap.health;
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('menstrual_data')) || {});
  const [openAccordion, setOpenAccordion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem('chat_history')) || []);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    localStorage.setItem('menstrual_data', JSON.stringify(data));
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
  }, [data, chatHistory]);

  // --- إرسال إشعار Firebase ---
  const sendFirebaseNotification = async (title, message) => {
    const token = localStorage.getItem('fcm_token');
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
        headers: { 'Content-Type': 'application/json' },
        data: { token, title, body: message }
      });
    } catch (e) { console.error("FCM Error", e); }
  };

  // --- التحليل المتخصص عبر AI ---
  const handleDeepAnalysis = async (userInput = null) => {
    setLoading(true);
    const symptoms = JSON.stringify(data);
    
    const promptText = `أنتِ البروفيسورة "رقة"، طبيبة نسائية متخصصة بخبرة 30 عاماً. 
    حللي البيانات التالية بدقة متناهية: ${symptoms}. 
    المطلوب: تقديم تقرير طبي مفصل (أكثر من 200 كلمة) يشمل:
    1. تحليل الحالة الهرمونية المتوقعة بناءً على تاريخ البدء.
    2. نصائح غذائية ونفسية مخصصة للأعراض المذكورة.
    3. تحذيرات طبية إذا لزم الأمر.
    4. أسلوبكِ حنون، مهني، ومطمئن جداً.
    السؤال الحالي: ${userInput || "أريد تقريراً شاملاً عن حالتي الحالية"}`;

    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      });

      const aiReply = response.data.reply || response.data.message;
      
      const newMessage = { id: Date.now(), role: 'ai', content: aiReply };
      setChatHistory(prev => userInput ? [...prev, { role: 'user', content: userInput }, newMessage] : [...prev, newMessage]);
      
      // حفظ في النوتيفيكيشن وإرسال FCM
      await sendFirebaseNotification("تحليل طبي جاهز 🩺", "قامت الطبيبة رقة بإعداد تقرير مفصل لحالتكِ الآن.");
      
    } catch (err) {
      console.error("AI Error", err);
    } finally {
      setLoading(false);
    }
  };

  // --- معالجة الصور ---
  const handleMedia = async (type) => {
    setLoading(true);
    const base64 = type === 'camera' ? await takePhoto() : await fetchImage();
    if (base64) {
      const url = await uploadToVercel(base64, `med_${Date.now()}.png`, 'image/png');
      handleDeepAnalysis(`لقد أرفقت صورة طبية للفحص: ${url}`);
    }
    setLoading(false);
  };

  const sections = [
    { id: 1, title: "سجل التواريخ", emoji: "📅", fields: ["تاريخ البدء", "تاريخ الانتهاء"] },
    { id: 3, title: "الأعراض الجسدية", emoji: "😖", fields: ["تشنجات", "صداع", "انتفاخ"] },
  ];

  return (
    <div style={{ background: '#FDF4F5', minHeight: '100vh', padding: '20px', direction: 'rtl' }}>
      
      {/* الساعة المطورة */}
      <PeriodClock startDate={data['سجل التواريخ_تاريخ البدء']} />

      <div style={{ background: '#fff', borderRadius: '25px', padding: '20px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '15px' }}>
             <HealthIcon size={40} color="#E91E63" />
             <h2 style={{ color: '#ad1457' }}>طبيبة رقة الذكية</h2>
        </div>
        
        <button 
          onClick={() => { setShowChat(true); handleDeepAnalysis(); }} 
          style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', background: '#FCE4EC', color: '#ad1457', fontWeight: 'bold', fontSize: '16px' }}
        >
          {loading ? "جاري إعداد تقريركِ المفصل..." : "توقع التقويم وحفظ البيانات ✨"}
        </button>
      </div>

      {/* الأكورديون للبيانات */}
      {sections.map(sec => (
        <div key={sec.id} style={{ background: '#fff', borderRadius: '20px', padding: '15px', marginTop: '15px' }}>
          <div onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
            <span>{sec.emoji} {sec.title}</span>
            <span>{openAccordion === sec.id ? '▲' : '▼'}</span>
          </div>
          {openAccordion === sec.id && (
            <div style={{ paddingTop: '10px' }}>
              {sec.fields.map(f => (
                <input 
                  key={f}
                  type={f.includes('تاريخ') ? 'date' : 'text'}
                  placeholder={f}
                  style={{ width: '100%', marginBottom: '8px', padding: '10px', borderRadius: '10px', border: '1px solid #eee' }}
                  value={data[`${sec.title}_${f}`] || ''}
                  onChange={(e) => setData({...data, [`${sec.title}_${f}`]: e.target.value})}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* واجهة الشات والكميرا */}
      {showChat && (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', background: '#E91E63', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
            <span onClick={() => setShowChat(false)}>✕ عودة</span>
            <strong>تقرير الطبيبة المفصل</strong>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#F9F9F9' }}>
            {chatHistory.map((m, i) => (
              <div key={i} style={{ 
                background: m.role === 'user' ? '#E91E63' : '#fff', 
                color: m.role === 'user' ? '#fff' : '#333',
                padding: '15px', borderRadius: '15px', marginBottom: '10px',
                textAlign: m.role === 'user' ? 'left' : 'right',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                lineHeight: '1.6'
              }}>
                {m.content}
              </div>
            ))}
          </div>
          <div style={{ padding: '10px', display: 'flex', gap: '5px', borderTop: '1px solid #eee' }}>
            <button onClick={() => handleMedia('camera')} style={{ background: '#eee', border: 'none', padding: '10px', borderRadius: '50%' }}>📷</button>
            <input 
              style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' }} 
              placeholder="اسألي الطبيبة..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
            />
            <button onClick={() => handleDeepAnalysis(chatInput)} style={{ background: '#E91E63', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '20px' }}>إرسال</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualTracker;
