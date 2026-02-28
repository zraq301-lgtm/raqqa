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

  // دالة التعامل مع الوسائط ورفعها لـ Vercel
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
        // الرفع لـ Vercel Blob عبر الرابط الذي حددتيه
        const imageUrl = await uploadToVercel(base64Image, `report_${Date.now()}.jpg`, 'image/jpeg');
        
        // إرسال الرابط للذكاء الاصطناعي لتحليله
        await handleProcess("تحليل صورة", imageUrl);
      }
    } catch (error) {
      console.error("فشل في معالجة الوسائط:", error);
      alert("حدث خطأ أثناء معالجة الصورة أو رفعها.");
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (catName = "عام", imageUrl = null) => {
    setLoading(true);
    const summary = fields.map(f => `${f}: ${data[`${catName}_${f}`] || 'غير متوفر'}`).join('، ');
    
    // بناء البرومبت سواء كان من الحقول أو من المدخل النصي
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
      setUserPrompt(''); // تصفير الحقل بعد الإرسال

      // حفظ في الإشعارات
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { user_id: 1, category: catName, value: summary, note: responseText }
      });

      // إضافة للأرشيف
      setSavedReports(prev => [{ 
        id: Date.now(), 
        title: catName, 
        text: responseText, 
        date: new Date().toLocaleDateString() 
      }, ...prev]);

    } catch (err) {
      console.error("فشل الاتصال:", err);
      setAiResponse("حدث خطأ في الشبكة. تم حفظ بياناتك محلياً.");
      setIsChatOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = (id) => {
    if(window.confirm("هل تريد حذف هذا التقرير من الأرشيف؟")) {
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
    chatInputContainer: { display: 'flex', gap: '10px', padding: '10px', borderTop: '1px solid #eee', background: '#fff' },
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

      {/* نافذة شات استشاري رقة */}
      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontWeight: 'bold', color: '#ff4d7d' }}>استشاري رقة الذكي 👩‍⚕️</span>
              <button onClick={() => setIsChatOpen(false)} style={{ border: 'none', background: '#eee', borderRadius: '50%', width: '30px', height: '30px' }}>✕</button>
            </div>
            
            {/* عرض الرد الأخير */}
            <div style={{ fontSize: '0.9rem', background: '#f9f9f9', padding: '15px', borderRadius: '15px', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
              {aiResponse || "مرحباً بكِ! يمكنكِ سؤالي عن أي شيء أو رفع صور التحاليل."}
            </div>

            {/* شريط كتابة البرومبت */}
            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
              <input 
                style={styles.chatInput} 
                placeholder="اسألي الاستشاري هنا..." 
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
              />
              <button 
                onClick={() => handleProcess("سؤال مباشر")}
                style={{ background: '#ff4d7d', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px' }}
              >
                ✈️
              </button>
            </div>

            {/* أزرار الوسائط */}
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '15px', background: '#fff5f7', borderRadius: '20px', marginBottom: '20px' }}>
              <button onClick={() => handleMediaAction('camera')} style={{ background: 'white', border: '1px solid #eee', padding: '10px', borderRadius: '12px' }}>📸 كاميرا</button>
              <button onClick={() => handleMediaAction('gallery')} style={{ background: 'white', border: '1px solid #eee', padding: '10px', borderRadius: '12px' }}>🖼️ استوديو</button>
            </div>

            {/* أرشيف الردود داخل الشات */}
            {savedReports.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '0.85rem', color: '#9b59b6', marginBottom: '10px' }}>📂 أرشيف تقاريرك</h3>
                {savedReports.map(r => (
                  <div key={r.id} style={{ display: 'flex', flexDirection: 'column', background: '#fff', padding: '10px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #ff4d7d1a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{fontSize: '0.8rem'}}>{r.title} - {r.date}</strong>
                      <button onClick={() => deleteReport(r.id)} style={{ border: 'none', background: 'none', color: '#ff4d7d', cursor: 'pointer' }}>🗑️</button>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '5px', maxHeight: '60px', overflow: 'hidden' }}>{r.text.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorClinical;
