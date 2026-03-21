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

  // --- وظيفة الحفظ والمزامنة مع الـ API ---
  const saveAndNotify = async (categoryTitle, currentAnalysis) => {
    const savedToken = localStorage.getItem('fcm_token');
    const userScheduledDate = data[`${categoryTitle}_الموعد القادم`];
    
    let finalDate;
    if (userScheduledDate) {
        const parsedDate = new Date(userScheduledDate);
        finalDate = isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
    } else {
        finalDate = new Date().toISOString();
    }

    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          fcmToken: savedToken || undefined,
          user_id: 1,
          category: 'medical_report',
          title: `موعد متابعة: ${categoryTitle} 🩺`,
          body: currentAnalysis.substring(0, 100) + "...",
          scheduled_for: finalDate,
          note: `تحليل آلي لـ ${categoryTitle}`
        }
      });

      if (savedToken) {
        await CapacitorHttp.post({
          url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
          headers: { 'Content-Type': 'application/json' },
          data: {
            token: savedToken,
            title: 'تنبيه طبي جديد 🔔',
            body: `تم حفظ تقرير ${categoryTitle} وجدولة موعد المتابعة بتاريخ ${userScheduledDate || 'اليوم'}.`,
            data: { type: 'medical_report' }
          }
        });
      }
      console.log("تمت المزامنة والحفظ بنجاح ✅");
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

      if (catName !== "سؤال مباشر") {
          await saveAndNotify(catName, responseText);

          setSavedReports(prev => [{ 
            id: Date.now(), 
            title: catName, 
            text: responseText, 
            date: new Date().toLocaleDateString() 
          }, ...prev]);
      }

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
    container: { padding: '15px', paddingBottom: '100px', direction: 'rtl', backgroundColor: '#fffbfc', minHeight: '100vh' },
    doctorRaqqaBtn: { background: 'linear-gradient(90deg, #9b59b6, #ff4d7d)', color: 'white', border: 'none', padding: '18px', borderRadius: '25px', marginBottom: '25px', width: '100%', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(255, 77, 125, 0.2)' },
    gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' },
    categoryCard: { background: 'white', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #fff0f3', transition: 'all 0.3s ease', cursor: 'pointer' },
    categoryIcon: { fontSize: '2rem', marginBottom: '10px' },
    categoryName: { fontSize: '0.95rem', fontWeight: 'bold', color: '#444' },
    fullWidthCard: { gridColumn: '1 / span 2', background: 'white', borderRadius: '25px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', border: '2px solid #ffedf2', animation: 'fadeIn 0.4s ease' },
    inputGroup: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' },
    inputField: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ffccd5', fontSize: '0.85rem', outline: 'none', backgroundColor: '#fffafa' },
    aiBtn: { background: 'linear-gradient(45deg, #ff4d7d, #9b59b6)', color: 'white', border: 'none', padding: '14px', borderRadius: '15px', marginTop: '15px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '0.9rem' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 3000 },
    chatContent: { background: 'white', width: '100%', maxWidth: '500px', height: '90%', borderTopLeftRadius: '35px', borderTopRightRadius: '35px', padding: '20px', overflowY: 'auto' },
    label: { fontSize: '0.75rem', color: '#ff4d7d', fontWeight: 'bold', marginBottom: '4px', display: 'block' }
  };

  return (
    <div style={styles.container}>
      <button style={styles.doctorRaqqaBtn} onClick={() => setIsChatOpen(true)}>
        <span>👩‍⚕️</span> استشاري رقة الطبي
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff4d7d', marginBottom: '20px' }}>
        <Icon size={24} /> <h2 style={{ fontSize: '1.2rem', margin: 0 }}>العيادات التخصصية</h2>
      </div>

      <div style={styles.gridContainer}>
        {categories.map((cat, i) => (
          <React.Fragment key={i}>
            {/* كارت القسم في الشبكة */}
            <div 
              style={{
                ...styles.categoryCard,
                border: openIdx === i ? '2px solid #ff4d7d' : styles.categoryCard.border,
                transform: openIdx === i ? 'scale(0.95)' : 'scale(1)'
              }} 
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <span style={styles.categoryIcon}>{cat.icon}</span>
              <span style={styles.categoryName}>{cat.name}</span>
            </div>

            {/* عرض التفاصيل تحت الكارت المفتوح مباشرة (يأخذ عرض الصف كاملاً) */}
            {openIdx === i && (
              <div style={styles.fullWidthCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong style={{ color: '#ff4d7d' }}>{cat.icon} سجل بيانات {cat.name}</strong>
                  <button onClick={() => setOpenIdx(null)} style={{ border: 'none', background: '#fce4ec', borderRadius: '50%', width: '30px', height: '30px', color: '#ff4d7d' }}>✕</button>
                </div>
                
                <div style={styles.inputGroup}>
                  {fields.map(f => (
                    <div key={f}>
                      <label style={styles.label}>{f}</label>
                      <input 
                        type={f === "الموعد القادم" ? "date" : "text"}
                        style={styles.inputField} 
                        value={data[`${cat.name}_${f}`] || ''} 
                        onChange={e => setData({...data, [`${cat.name}_${f}`]: e.target.value})}
                      />
                    </div>
                  ))}
                </div>
                <button style={styles.aiBtn} onClick={() => handleProcess(cat.name)} disabled={loading}>
                  {loading ? '⏳ جاري معالجة البيانات...' : '✨ تحليل وحفظ التقرير الذكي'}
                </button>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* مودال الشات - كما هو بالظبط */}
      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontWeight: 'bold', color: '#ff4d7d' }}>استشاري رقة الذكي 👩‍⚕️</span>
              <button onClick={() => setIsChatOpen(false)} style={{ border: 'none', background: '#eee', borderRadius: '50%', width: '30px', height: '30px' }}>✕</button>
            </div>
            
            <div style={{ fontSize: '0.9rem', background: '#f9f9f9', padding: '15px', borderRadius: '15px', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
              {aiResponse || "مرحباً بكِ في قسم الاستشارات! كيف يمكنني مساعدتك اليوم؟"}
            </div>

            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
              <input 
                style={{ flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }} 
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
              <div key={r.id} style={{ background: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #ff4d7d1a', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{fontSize: '0.85rem', color: '#9b59b6'}}>{r.title} - {r.date}</strong>
                  <button onClick={() => deleteReport(r.id)} style={{ border: 'none', background: 'none', color: '#ff4d7d' }}>🗑️</button>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>{r.text.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorClinical;
