import React, { useState, useEffect, useRef } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
// استيراد خدمات الميديا التي وفرتها
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

const DoctorClinical = () => {
  const Icon = iconMap.insight;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_doctor')) || {});
  const [aiResponse, setAiResponse] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState(''); // حالة لإدخال النص اليدوي
  const [savedReports, setSavedReports] = useState(() => JSON.parse(localStorage.getItem('saved_reports')) || []);

  useEffect(() => {
    localStorage.setItem('lady_doctor', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('saved_reports', JSON.stringify(savedReports));
  }, [savedReports]);

  const categories = [
    { name: "العظام", icon: "🦴" }, { name: "العيون", icon: "👁️" }, 
    { name: "الأسنان", icon: "🦷" }, { name: "القلب", icon: "🫀" }, 
    { name: "التحاليل", icon: "📝" }, { name: "الجلدية", icon: "🧴" },
    { name: "المناعة", icon: "🛡️" }, { name: "الأعصاب", icon: "🧠" }
  ];

  // --- وظيفة الحفظ والمزامنة مع الـ API ---
  const saveAndNotify = async (title, content) => {
    const fcmToken = localStorage.getItem('fcm_token');
    
    const postData = {
      user_id: 1,
      category: 'medical_consultation',
      title: `تقرير طبي: ${title}`,
      body: content.substring(0, 100) + "...", // ملخص بسيط للإشعار
      fcmToken: fcmToken,
      extra_data: {
        full_report: content,
        category_name: title,
        timestamp: new Date().toISOString(),
        user_input_summary: JSON.stringify(data)
      }
    };

    try {
      // 1. الحفظ في قاعدة بيانات نيون عبر API الحفظ الموحد
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: postData
      });

      // 2. إرسال إشعار FCM إذا توفر التوكن
      if (fcmToken) {
        await CapacitorHttp.post({
          url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
          headers: { 'Content-Type': 'application/json' },
          data: {
            token: fcmToken,
            title: 'تقرير طبي جديد 🩺',
            body: `تم تجهيز تحليل طبي بخصوص ${title}`,
            data: { type: 'medical_report' }
          }
        });
      }
      console.log("تمت المزامنة والحفظ بنجاح ✅");
    } catch (err) {
      console.error("خطأ في المزامنة:", err);
    }
  };

  const handleProcess = async (categoryName) => {
    setLoading(true);
    setIsChatOpen(true);
    try {
      const promptText = categoryName === "سؤال مباشر" 
        ? userPrompt 
        : `أنا سيدة أعاني من مشاكل في قسم ${categoryName}. إليك بياناتي المذكورة في التطبيق: ${JSON.stringify(data)}. يرجى تقديم تحليل طبي أولي وتوجيهات صحيحة.`;

      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      });

      const result = response.data.reply || response.data.content || response.data.message;
      setAiResponse(result);
      
      // حفظ التقرير محلياً
      const newReport = { id: Date.now(), title: categoryName, content: result, date: new Date().toLocaleString('ar-EG') };
      setSavedReports(prev => [newReport, ...prev]);

      // مزامنة مع الـ API الخارجي (نيون + FCM)
      await saveAndNotify(categoryName, result);

    } catch (error) {
      setAiResponse("عذراً، حدث خطأ في الاتصال بالطبيبة الذكية.");
    } finally {
      setLoading(false);
      setUserPrompt('');
    }
  };

  const handleMediaAction = async (type) => {
    try {
      const img = type === 'camera' ? await takePhoto() : await fetchImage();
      if (img) {
        const url = await uploadToVercel(img);
        setUserPrompt(prev => prev + ` [صورة مرفقة: ${url}] `);
      }
    } catch (e) { console.error(e); }
  };

  const deleteReport = (id) => {
    setSavedReports(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{ padding: '20px', background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)', minHeight: '100vh', direction: 'rtl' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', background: 'white', padding: '20px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(255, 77, 125, 0.1)' }}>
        <div style={{ background: '#ff4d7d', padding: '12px', borderRadius: '18px', color: 'white' }}><Icon size={28} /></div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>طبيبة رقة الذكية</h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>استشارات طبية فورية مدعومة بالذكاء الاصطناعي</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '25px' }}>
        {categories.map((cat, idx) => (
          <div key={idx} onClick={() => handleProcess(cat.name)} style={{ background: 'white', padding: '15px 10px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', cursor: 'pointer', transition: '0.3s' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{cat.icon}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#555' }}>{cat.name}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '1rem', color: '#ff4d7d', marginBottom: '15px' }}>استشارة مباشرة</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input 
            style={{ flex: 1, padding: '15px', borderRadius: '15px', border: '1px solid #eee', outline: 'none', background: '#f9f9f9' }}
            placeholder="اشرحي ما تشعرين به..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
          />
          <button onClick={() => handleProcess("سؤال مباشر")} style={{ background: '#ff4d7d', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer' }}>✈️</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px', background: '#fff5f7', borderRadius: '20px', marginBottom: '20px' }}>
          <button onClick={() => handleMediaAction('camera')} style={{ background: 'white', border: '1px solid #eee', padding: '10px 20px', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer' }}>📸 كاميرا</button>
          <button onClick={() => handleMediaAction('gallery')} style={{ background: 'white', border: '1px solid #eee', padding: '10px 20px', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer' }}>🖼️ استوديو</button>
        </div>

        {savedReports.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>التقارير الأخيرة والمحفوظة</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '10px' }}>
              {savedReports.map(r => (
                <div key={r.id} style={{ background: '#fff', padding: '15px', borderRadius: '18px', marginBottom: '12px', border: '1px solid #ff4d7d10', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#ff4d7d' }}>{r.title}</strong>
                    <button onClick={() => deleteReport(r.id)} style={{ border: 'none', background: 'none', color: '#ff4d7d', cursor: 'pointer' }}>🗑️</button>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{r.content}</p>
                  <div style={{ fontSize: '0.65rem', color: '#bbb', textAlign: 'left', marginTop: '8px' }}>{r.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isChatOpen && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, top: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'white', width: '100%', height: '80%', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', padding: '25px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <strong style={{ color: '#ff4d7d' }}>تحليل الطبيبة الذكية</strong>
              <button onClick={() => setIsChatOpen(false)} style={{ border: 'none', background: 'none', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', fontSize: '0.9rem', lineHeight: '1.7', color: '#444' }}>
              {loading ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                  <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #ff4d7d', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                  <p style={{ marginTop: '15px' }}>جاري تحليل البيانات الطبية...</p>
                </div>
              ) : (
                <div style={{ whiteSpace: 'pre-wrap' }}>{aiResponse}</div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DoctorClinical;
