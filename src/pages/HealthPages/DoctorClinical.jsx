import React, { useState, useEffect, useRef } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';

const DoctorClinical = () => {
  const Icon = iconMap.insight;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_doctor')) || {});
  const [aiResponse, setAiResponse] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState(() => JSON.parse(localStorage.getItem('saved_reports')) || []);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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

  // وظائف الوسائط باستخدام المتصفح مباشرة لتجنب أخطاء الـ Build
  const handleCameraClick = () => cameraInputRef.current.click();
  const handleFileClick = () => fileInputRef.current.click();
  const handleMicClick = () => alert("ميزة التسجيل الصوتي قيد التطوير ✨");

  const handleProcess = async (catName) => {
    setLoading(true);
    const summary = fields.map(f => `${f}: ${data[`${catName}_${f}`] || 'غير متوفر'}`).join('، ');
    
    try {
      // 1. طلب تحليل الذكاء الصناعي
      const aiRes = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة، إليكِ بيانات عيادة ${catName}: ${summary}. قدمي تقريراً طبياً شاملاً.` }
      });

      const responseText = aiRes.data.reply || aiRes.data.message;
      setAiResponse(responseText);
      setIsChatOpen(true);

      // 2. الحفظ في نيون (Neon) عبر API save-health 
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

      const newReport = { id: Date.now(), title: catName, text: responseText, date: new Date().toLocaleDateString() };
      setSavedReports(prev => [newReport, ...prev]);

    } catch (err) {
      setAiResponse("تأكدي من الاتصال بالإنترنت لحفظ التقرير.");
      setIsChatOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = (id) => {
    setSavedReports(savedReports.filter(r => r.id !== id));
  };

  const styles = {
    card: { background: 'white', borderRadius: '25px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(255, 77, 125, 0.1)' },
    accItem: { background: '#fff5f7', borderRadius: '15px', marginBottom: '10px', overflow: 'hidden', border: '1px solid #ff4d7d1a' },
    input: { width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ff4d7d33', fontSize: '0.85rem', outline: 'none' },
    aiBtn: { background: 'linear-gradient(45deg, #ff4d7d, #9b59b6)', color: 'white', border: 'none', padding: '12px', borderRadius: '15px', marginTop: '15px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }
  };

  return (
    <div style={{ padding: '10px' }}>
      {/* مدخلات الكاميرا والملفات المخفية */}
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{ display: 'none' }} />
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} />

      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff4d7d', marginBottom: '20px' }}>
          <Icon size={28} /> <h2 style={{ fontSize: '1.2rem', margin: 0 }}>متابعة الطبيب والعيادات</h2>
        </div>

        {categories.map((cat, i) => (
          <div key={i} style={styles.accItem}>
            <div style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span>{cat.icon} عيادة {cat.name}</span>
              <span style={{ color: '#ff4d7d' }}>{openIdx === i ? '−' : '+'}</span>
            </div>

            {openIdx === i && (
              <div style={{ padding: '0 15px 15px 15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {fields.map(f => (
                    <div key={f}>
                      <label style={{ fontSize: '0.7rem', color: '#555' }}>{f}</label>
                      <input 
                        style={styles.input} 
                        value={data[`${cat.name}_${f}`] || ''} 
                        onChange={e => setData({...data, [`${cat.name}_${f}`]: e.target.value})} 
                      />
                    </div>
                  ))}
                </div>
                <button style={styles.aiBtn} onClick={() => handleProcess(cat.name)} disabled={loading}>
                  {loading ? 'جاري الحفظ والتحليل...' : '✨ تحليل وحفظ التقرير'}
                </button>
              </div>
            )}
          </div>
        ))}

        {/* أرشيف التقارير  */}
        {savedReports.length > 0 && (
          <div style={{ marginTop: '25px', borderTop: '2px solid #fff5f7', paddingTop: '15px' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#9b59b6' }}>📂 التقارير المحفوظة في نيون</h3>
            {savedReports.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#fff', padding: '10px', borderRadius: '12px', marginBottom: '8px', border: '1px solid #eee' }}>
                <span style={{ fontSize: '0.8rem' }}>تقرير {r.title} - {r.date}</span>
                <button onClick={() => deleteReport(r.id)} style={{ border: 'none', background: 'none', color: '#ff4d7d' }}>🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* شاشة الشات والوسائط  */}
      {isChatOpen && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', height: '70%', background: 'white', borderRadius: '30px 30px 0 0', padding: '20px', zIndex: 2000, boxShadow: '0 -5px 20px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <strong>تقرير رقة الذكي</strong>
            <button onClick={() => setIsChatOpen(false)} style={{ border: 'none', background: 'none' }}>✕</button>
          </div>
          <div style={{ height: '70%', overflowY: 'auto', fontSize: '0.9rem', color: '#444' }}>{aiResponse}</div>
          
          <div style={{ position: 'absolute', bottom: 20, width: '90%', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <button onClick={handleCameraClick} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>📷</button>
            <button onClick={handleMicClick} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>🎤</button>
            <button onClick={handleFileClick} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>🖼️</button>
            <button onClick={() => setIsChatOpen(false)} style={{ background: '#ff4d7d', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '20px' }}>تم</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorClinical;
