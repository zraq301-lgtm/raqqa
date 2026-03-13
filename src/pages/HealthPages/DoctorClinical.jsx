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
    { name: "التحاليل", icon: "📝" }, { name: "الجلدية", icon: "✨" },
    { name: "الباطنة", icon: "🩺" }, { name: "الأعصاب", icon: "🧠" },
    { name: "الجراحة", icon: "🩹" }, { name: "الصيدلية", icon: "💊" }
  ];

  const fields = ["التاريخ", "اسم الطبيب", "التشخيص", "الدواء", "الموعد القادم", "الملاحظات", "النتيجة"];

  // --- الدالة المعدلة لإرسال التاريخ المدخل يدوياً من حقل "الموعد القادم" ---
  const saveAndNotify = async (categoryTitle, currentAnalysis) => {
    const savedToken = localStorage.getItem('fcm_token');
    
    // جلب القيمة من حقل "الموعد القادم" الخاص بالقسم المفتوح حالياً
    const userScheduledDate = data[`${categoryTitle}_الموعد القادم`];
    
    let finalDate;
    if (userScheduledDate) {
        const parsedDate = new Date(userScheduledDate);
        // التحقق من صحة التاريخ المحول، إذا كان غير صالح نستخدم التاريخ الحالي كحماية
        finalDate = isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
    } else {
        // إذا كان الحقل فارغاً، يتم الحفظ بتاريخ اللحظة الحالية
        finalDate = new Date().toISOString();
    }

    try {
      const saveToNeonOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          fcmToken: savedToken || undefined,
          user_id: 1,
          category: 'medical_report',
          title: `موعد متابعة: ${categoryTitle} 🩺`,
          body: currentAnalysis.substring(0, 100) + "...",
          scheduled_for: finalDate, // هنا يتم إجبار الحفظ في الخانة المطلوبة (scheduled_for)
          note: `تحليل آلي لـ ${categoryTitle}`
        }
      };
      await CapacitorHttp.post(saveToNeonOptions);

      if (savedToken) {
        const fcmOptions = {
          url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
          headers: { 'Content-Type': 'application/json' },
          data: {
            token: savedToken,
            title: 'تنبيه طبي جديد 🔔',
            body: `تم حفظ تقرير ${categoryTitle} وجدولة موعد المتابعة بتاريخ ${userScheduledDate || 'اليوم'}.`,
            data: { type: 'medical_report' }
          }
        };
        await CapacitorHttp.post(fcmOptions);
      }
      
      console.log("تم الحفظ في قاعدة البيانات بالتاريخ المجدول بنجاح ✅");
    } catch (err) {
      console.error("خطأ في المزامنة:", err);
    }
  };

  const handleMediaAction = async (type) => {
    try {
      setLoading(true);
      let base64Image;
      if (type === 'camera') {
        base64Image = await takePhoto();
      } else {
        base64Image = await fetchImage();
      }
      if (base64Image) {
        const imageUrl = await uploadToVercel(base64Image, `report_${Date.now()}.jpg`, 'image/jpeg');
        await handleProcess("تحليل صورة", imageUrl);
      }
    } catch (error) {
      console.error("فشل في معالجة الوسائط:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (catName = "عام", imageUrl = null) => {
    setLoading(true);
    const summary = fields.map(f => `${f}: ${data[`${catName}_${f}`] || 'غير متوفر'}`).join('، ');
    
    const finalPrompt = userPrompt 
      ? `سؤال المستخدم: ${userPrompt}. سياق البيانات: ${summary}`
      : `بيانات عيادة ${catName}: ${summary}. ${imageUrl ? `رابط الصورة المرفقة: ${imageUrl}` : ''}`;

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { 
          prompt: `أنا أنثى مسلمة، بصفتك استشاري طب متخصص ومعتمد: ${finalPrompt}. يرجى تقديم تقرير طبي استشاري احترافي مفصل.` 
        }
      };

      const aiRes = await CapacitorHttp.post(options);
      const responseText = aiRes.data.reply || aiRes.data.message;
      
      setAiResponse(responseText);
      setIsChatOpen(true);
      setUserPrompt('');

      // استدعاء دالة الحفظ مع تمرير اسم القسم لضمان سحب "الموعد القادم" الصحيح
      await saveAndNotify(catName, responseText);

      setSavedReports(prev => [{ 
        id: Date.now(), 
        title: catName, 
        text: responseText, 
        date: new Date().toLocaleDateString() 
      }, ...prev]);

    } catch (err) {
      console.error("فشل الاتصال:", err);
      setAiResponse("حدث خطأ في الشبكة.");
      setIsChatOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = (id) => {
    if(window.confirm("هل تريد حذف هذا التقرير؟")) {
      setSavedReports(prev => prev.filter(r => r.id !== id));
    }
  };

  const styles = {
    card: { background: '#fff', borderRadius: '25px', padding: '15px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(255, 77, 125, 0.1)' },
    accItem: { background: '#fff5f7', borderRadius: '15px', marginBottom: '8px', overflow: 'hidden' },
    input: { width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ff4d7d33', fontSize: '0.85rem', outline: 'none' },
    aiBtn: { background: 'linear-gradient(45deg, #ff4d7d, #9b59b6)', color: 'white', border: 'none', padding: '12px', borderRadius: '15px', marginTop: '10px', cursor: 'pointer', width: '100%', fontWeight: 'bold' },
    doctorRaqqaBtn: { background: 'linear-gradient(90deg, #9b59b6, #ff4d7d)', color: 'white', border: 'none', padding: '15px', borderRadius: '20px', marginBottom: '15px', width: '100%', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 3000 },
    chatContent: { background: 'white', width: '100%', maxWidth: '500px', height: '90%', borderTopLeftRadius: '35px', borderTopRightRadius: '35px', padding: '20px', overflowY: 'auto' },
    chatInput: { flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }
  };

  return (
    <div style={{ padding: '10px', paddingBottom: '100px' }}>
      <button style={styles.doctorRaqqaBtn} onClick={() => setIsChatOpen(true)}>
        <span>👩‍⚕️</span> استشاري رقة الطبي
      </button>

      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff4d7d', marginBottom: '15px' }}>
          <Icon size={24} /> <h2 style={{ fontSize: '1.1rem', margin: 0 }}>متابعة العيادات التخصصية</h2>
        </div>

        {categories.map((cat, i) => (
          <div key={i} style={styles.accItem}>
            <div style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span style={{fontWeight: 'bold'}}>{cat.icon} {cat.name}</span>
              <span>{openIdx === i ? '−' : '+'}</span>
            </div>

            {openIdx === i && (
              <div style={{ padding: '0 15px 15px 15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {fields.map(f => (
                    <div key={f}>
                      <label style={{ fontSize: '0.65rem', color: '#777' }}>{f}</label>
                      <input 
                        style={styles.input} 
                        placeholder={f === "الموعد القادم" ? "2026-03-20" : ""}
                        value={data[`${cat.name}_${f}`] || ''} 
                        onChange={e => setData({...data, [`${cat.name}_${f}`]: e.target.value})}
                      />
                    </div>
                  ))}
                </div>
                <button style={styles.aiBtn} onClick={() => handleProcess(cat.name)} disabled={loading}>
                  {loading ? 'جاري التحليل...' : '✨ تحليل وحفظ التقرير'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontWeight: 'bold', color: '#ff4d7d' }}>استشاري رقة الذكي 👩‍⚕️</span>
              <button onClick={() => setIsChatOpen(false)} style={{ border: 'none', background: '#eee', borderRadius: '50%', width: '30px', height: '30px' }}>✕</button>
            </div>
            
            <div style={{ fontSize: '0.9rem', background: '#f9f9f9', padding: '15px', borderRadius: '15px', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
              {aiResponse || "مرحباً بكِ!"}
            </div>

            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
              <input 
                style={styles.chatInput} 
                placeholder="اسألي الاستشاري هنا..." 
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
              />
              <button onClick={() => handleProcess("سؤال مباشر")} style={{ background: '#ff4d7d', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px' }}>✈️</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '15px', background: '#fff5f7', borderRadius: '20px', marginBottom: '20px' }}>
              <button onClick={() => handleMediaAction('camera')} style={{ background: 'white', border: '1px solid #eee', padding: '10px', borderRadius: '12px' }}>📸 كاميرا</button>
              <button onClick={() => handleMediaAction('gallery')} style={{ background: 'white', border: '1px solid #eee', padding: '10px', borderRadius: '12px' }}>🖼️ استوديو</button>
            </div>

            {savedReports.map(r => (
              <div key={r.id} style={{ background: '#fff', padding: '10px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #ff4d7d1a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{fontSize: '0.8rem'}}>{r.title}</strong>
                  <button onClick={() => deleteReport(r.id)} style={{ border: 'none', background: 'none', color: '#ff4d7d' }}>🗑️</button>
                </div>
                <p style={{ fontSize: '0.75rem' }}>{r.text.substring(0, 80)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorClinical;
