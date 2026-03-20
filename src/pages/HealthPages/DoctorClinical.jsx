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

  // تحديث الأيقونات والأسماء لتطابق الصورة
  const categories = [
    { name: "العظام", icon: "🦴" }, 
    { name: "العيون", icon: "👁️" }, 
    { name: "الأسنان", icon: "🦷" }, 
    { name: "القلب", icon: "🫀" }, 
    { name: "التحاليل", icon: "📝" }, 
    { name: "الجلدية", icon: "🧴" },
    { name: "المناعة", icon: "🛡️" }, 
    { name: "الأعصاب", icon: "🧠" }
  ];

  const fields = ["التاريخ", "اسم الطبيب", "التشخيص", "الدواء", "الموعد القادم", "الملاحظات", "النتيجة"];

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

      if (catName !== "سؤال مباشر" && catName !== "تحليل صورة") {
          await saveAndNotify(catName, responseText);
          setSavedReports(prev => [{ 
            id: Date.now(), 
            title: catName, 
            text: responseText, 
            date: new Date().toLocaleDateString() 
          }, ...prev]);
      }
    } catch (err) {
      setAiResponse("حدث خطأ في الشبكة.");
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
    container: { padding: '15px', backgroundColor: '#fff9fb', minHeight: '100vh', direction: 'rtl', fontFamily: 'Arial, sans-serif' },
    headerCard: { background: 'white', borderRadius: '25px', padding: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(255, 182, 193, 0.2)', marginBottom: '25px', position: 'relative' },
    gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '25px' },
    gridItem: { background: 'white', borderRadius: '20px', padding: '15px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #fdf0f4' },
    iconCircle: { fontSize: '2rem', marginBottom: '5px' },
    categoryName: { fontSize: '0.85rem', fontWeight: 'bold', color: '#444' },
    directConsultation: { background: 'white', borderRadius: '25px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
    inputArea: { width: '100%', border: 'none', background: '#f8f9fa', borderRadius: '15px', padding: '15px', minHeight: '80px', outline: 'none', fontSize: '0.95rem', marginBottom: '15px' },
    actionRow: { display: 'flex', gap: '10px', justifyContent: 'center' },
    actionBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '15px', border: '1px solid #eee', background: 'white', fontSize: '0.9rem' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    modalContent: { background: 'white', width: '100%', maxWidth: '400px', borderRadius: '30px', padding: '25px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' },
    fieldInput: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ffe4ec', marginBottom: '10px', background: '#fff9fb' },
    submitBtn: { background: 'linear-gradient(45deg, #ff4d7d, #ff8fa3)', color: 'white', border: 'none', width: '100%', padding: '15px', borderRadius: '15px', fontWeight: 'bold', marginTop: '10px' }
  };

  return (
    <div style={styles.container}>
      {/* رأس الصفحة */}
      <div style={styles.headerCard}>
        <div style={{ position: 'absolute', right: '20px', top: '20px', background: '#ff4d7d', color: 'white', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>✨</div>
        <h1 style={{ fontSize: '1.4rem', color: '#333', margin: '0 0 5px 0' }}>طبيبة رقة الذكية</h1>
        <p style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>استشارات طبية فورية مدعومة بالذكاء الاصطناعي</p>
      </div>

      {/* الشبكة (Grid) */}
      <div style={styles.gridContainer}>
        {categories.map((cat, i) => (
          <div key={i} style={styles.gridItem} onClick={() => setOpenIdx(i)}>
            <span style={styles.iconCircle}>{cat.icon}</span>
            <span style={styles.categoryName}>{cat.name}</span>
          </div>
        ))}
      </div>

      {/* استشارة مباشرة */}
      <div style={styles.directConsultation}>
        <h3 style={{ color: '#ff4d7d', textAlign: 'center', marginBottom: '15px' }}>استشارة مباشرة</h3>
        <textarea 
          style={styles.inputArea} 
          placeholder="اشرحي ما تشعرين به..." 
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
        />
        <div style={styles.actionRow}>
          <button style={styles.actionBtn} onClick={() => handleMediaAction('camera')}>📸 كاميرا</button>
          <button style={styles.actionBtn} onClick={() => handleMediaAction('gallery')}>🖼️ استوديو</button>
          <button style={{ ...styles.actionBtn, background: '#ff4d7d', color: 'white', border: 'none' }} onClick={() => handleProcess("سؤال مباشر")}>إرسال</button>
        </div>
      </div>

      {/* مودال العيادة (يظهر عند الضغط على أيقونة) */}
      {openIdx !== null && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button onClick={() => setOpenIdx(null)} style={{ position: 'absolute', left: '20px', top: '20px', border: 'none', background: '#eee', borderRadius: '50%', width: '30px', height: '30px' }}>✕</button>
            <h3 style={{ textAlign: 'center', color: '#ff4d7d', marginBottom: '20px' }}>عيادة {categories[openIdx].name} {categories[openIdx].icon}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {fields.map(f => (
                <div key={f}>
                  <label style={{ fontSize: '0.7rem', color: '#999', paddingRight: '5px' }}>{f}</label>
                  <input 
                    style={styles.fieldInput}
                    value={data[`${categories[openIdx].name}_${f}`] || ''}
                    onChange={e => setData({...data, [`${categories[openIdx].name}_${f}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>

            <button style={styles.submitBtn} onClick={() => { handleProcess(categories[openIdx].name); setOpenIdx(null); }} disabled={loading}>
              {loading ? 'جاري التحليل...' : 'تحليل وحفظ التقرير ✨'}
            </button>
          </div>
        </div>
      )}

      {/* شاشة الرد الذكي والتقارير المحفوظة */}
      {isChatOpen && (
        <div style={{ ...styles.modalOverlay, alignItems: 'flex-end', padding: 0 }}>
          <div style={{ ...styles.modalContent, maxWidth: 'none', height: '85%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <strong style={{ color: '#ff4d7d' }}>استشاري رقة الذكي 👩‍⚕️</strong>
                <button onClick={() => setIsChatOpen(false)} style={{ border: 'none', background: '#eee', borderRadius: '50%', width: '30px', height: '30px' }}>✕</button>
             </div>
             
             <div style={{ background: '#fff5f7', padding: '15px', borderRadius: '20px', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
                {aiResponse || "مرحباً بكِ في رقة.. كيف أساعدك اليوم؟"}
             </div>

             <h4 style={{ fontSize: '0.8rem', color: '#888' }}>السجل الطبي الأخير:</h4>
             {savedReports.map(r => (
                <div key={r.id} style={{ padding: '12px', borderBottom: '1px solid #eee', position: 'relative' }}>
                   <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{r.title} - {r.date}</div>
                   <div style={{ fontSize: '0.8rem', color: '#666' }}>{r.text.substring(0, 50)}...</div>
                   <button onClick={() => deleteReport(r.id)} style={{ position: 'absolute', left: 0, top: '15px', border: 'none', background: 'none' }}>🗑️</button>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorClinical;
