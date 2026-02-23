import React, { useState, useEffect, useRef } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { Camera, CameraResultType } from '@capacitor/camera';

const DoctorClinical = () => {
  const Icon = iconMap.insight;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_doctor')) || {});
  const [aiResponse, setAiResponse] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState(() => JSON.parse(localStorage.getItem('saved_reports')) || []);
  
  // مرجع لرفع الملفات المخفي
  const fileInputRef = useRef(null);

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

  // وظائف الوسائط (Media Functions)
  const openCamera = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri
      });
      alert("تم التقاط الصورة بنجاح!");
    } catch (e) { console.log("Camera cancelled"); }
  };

  const openMic = () => {
    alert("جاري بدء التسجيل الصوتي... (تحتاج لإضافة RecordPlugin)");
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  // معالجة البيانات والحفظ في نيون [cite: 1, 2]
  const handleProcess = async (catName) => {
    setLoading(true);
    const summary = fields.map(f => `${f}: ${data[`${catName}_${f}`] || 'غير متوفر'}`).join('، ');
    
    try {
      // 1. استدعاء الذكاء الصناعي
      const aiRes = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة، إليكِ بيانات عيادة ${catName}: ${summary}. قدمي تقريراً طبياً شاملاً ومتخصصاً.` }
      });

      const responseText = aiRes.data.reply || aiRes.data.message;
      setAiResponse(responseText);
      setIsChatOpen(true);

      // 2. الحفظ في جدول إشعارات نيون (Neon) 
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-health',
        headers: { 'Content-Type': 'application/json' },
        data: { 
            user_id: 1, 
            category: catName, 
            value: summary, 
            note: responseText 
        }
      });

      // إضافة التقرير للقائمة المحلية
      const newReport = { id: Date.now(), title: catName, text: responseText, date: new Date().toLocaleDateString() };
      setSavedReports(prev => [newReport, ...prev]);

    } catch (err) {
      setAiResponse("حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.");
      setIsChatOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = (id) => {
    setSavedReports(savedReports.filter(r => r.id !== id));
  };

  // التصميم المستوحى من ملف الـ CSS المرفوع
  const styles = {
    card: { 
      background: 'white', 
      borderRadius: '25px', 
      padding: '20px', 
      border: '1px solid #ff4d7d26', 
      marginBottom: '20px',
      boxShadow: '0 4px 15px rgba(255, 77, 125, 0.1)'
    },
    accItem: { 
      background: 'var(--female-pink-light, #fff5f7)', 
      borderRadius: '15px', 
      marginBottom: '10px',
      overflow: 'hidden',
      border: '1px solid #ff4d7d1a'
    },
    input: { 
      width: '100%', 
      padding: '10px', 
      borderRadius: '10px', 
      border: '1px solid #ff4d7d33', 
      background: 'white', 
      fontSize: '0.85rem',
      outline: 'none'
    },
    aiBtn: {
      background: 'linear-gradient(45deg, #ff4d7d, #9b59b6)',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '15px',
      marginTop: '15px',
      cursor: 'pointer',
      width: '100%',
      fontWeight: 'bold',
      boxShadow: '0 4px 10px rgba(255, 77, 125, 0.3)'
    },
    mediaBtn: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: '5px'
    }
  };

  return (
    <div style={{ padding: '10px' }}>
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff4d7d', marginBottom: '20px' }}>
          <Icon size={28} /> <h2 style={{ fontSize: '1.2rem', margin: 0 }}>متابعة الطبيب والعيادات</h2>
        </div>

        {categories.map((cat, i) => (
          <div key={i} style={styles.accItem}>
            <div 
              style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }} 
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <span>{cat.icon} عيادة {cat.name}</span>
              <span style={{ color: '#ff4d7d' }}>{openIdx === i ? '−' : '+'}</span>
            </div>

            {openIdx === i && (
              <div style={{ padding: '0 15px 15px 15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {fields.map(f => (
                    <div key={f}>
                      <label style={{ fontSize: '0.7rem', color: '#555', display: 'block', marginBottom: '4px' }}>{f}</label>
                      <input 
                        style={styles.input} 
                        value={data[`${cat.name}_${f}`] || ''} 
                        onChange={e => setData({...data, [`${cat.name}_${f}`]: e.target.value})} 
                        placeholder="..."
                      />
                    </div>
                  ))}
                </div>
                <button style={styles.aiBtn} onClick={() => handleProcess(cat.name)} disabled={loading}>
                  {loading ? 'جاري التحليل الرقمي...' : '✨ استخراج تقرير ذكي'}
                </button>
              </div>
            )}
          </div>
        ))}

        {/* قائمة التقارير المحفوظة - بتصميم جديد */}
        {savedReports.length > 0 && (
          <div style={{ marginTop: '25px', borderTop: '2px solid #fff5f7', paddingTop: '15px' }}>
            <h3 style={{ fontSize: '1rem', color: '#9b59b6', marginBottom: '10px' }}>📂 أرشيف التقارير الطبية</h3>
            {savedReports.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '8px', border: '1px solid #eee' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>تقرير {r.title}</div>
                  <div style={{ fontSize: '0.7rem', color: '#999' }}>{r.date}</div>
                </div>
                <button onClick={() => deleteReport(r.id)} style={{ border: 'none', background: 'none', color: '#ff4d7d', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* شاشة الشات المنبثقة المتطورة */}
      {isChatOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 2000 }}>
          <div style={{ background: 'white', width: '100%', height: '80%', borderRadius: '30px 30px 0 0', padding: '20px', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#ff4d7d' }}>✨ تقرير رقة الطبي الذكي</span>
              <button onClick={() => setIsChatOpen(false)} style={{ border: 'none', background: '#eee', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '15px', fontSize: '0.95rem', lineHeight: '1.6', color: '#444', marginBottom: '100px' }}>
              {aiResponse}
            </div>

            {/* بار الوسائط السفلي داخل الشات */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'white', padding: '15px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <button style={styles.mediaBtn} onClick={openCamera} title="كاميرا">📷</button>
              <button style={styles.mediaBtn} onClick={openMic} title="تسجيل صوتي">🎤</button>
              <button style={styles.mediaBtn} onClick={triggerFileUpload} title="إرفاق صورة">🖼️</button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" />
              
              <div style={{ width: '1px', height: '30px', background: '#eee' }}></div>
              
              {/* زر حفظ كتقرير سريع */}
              <button 
                onClick={() => { alert("تم التأكيد على حفظ التقرير في الأرشيف ونظام نيون ✨"); setIsChatOpen(false); }}
                style={{ background: '#ff4d7d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}
              >
                حفظ التقرير ✅
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorClinical;
