import React, { useState, useEffect } from 'react';
[cite_start]// التصحيح: الوصول إلى مجلد src ثم الدخول إلى constants [cite: 1]
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';

const DoctorClinical = () => {
  [cite_start]// استخدام أيقونة التبصر (insight) من خريطة الأيقونات المعرفة في iconMap.js [cite: 2]
  const Icon = iconMap.insight;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_doctor')) || {});
  
  // حالات الذكاء الصناعي والشات
  const [aiResponse, setAiResponse] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const styles = {
    card: { 
      background: 'rgba(255, 255, 255, 0.15)', 
      backdropFilter: 'blur(15px)', 
      borderRadius: '25px', 
      padding: '20px', 
      border: '1px solid rgba(255,255,255,0.3)', 
      marginBottom: '20px' 
    },
    accItem: { 
      background: 'rgba(255,255,255,0.2)', 
      borderRadius: '15px', 
      marginBottom: '8px',
      overflow: 'hidden' 
    },
    input: { 
      width: '100%', 
      padding: '8px', 
      borderRadius: '8px', 
      border: 'none', 
      background: 'rgba(255,255,255,0.5)', 
      fontSize: '0.85rem' 
    },
    aiBtn: {
      background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
      color: 'white',
      border: 'none',
      padding: '10px',
      borderRadius: '12px',
      marginTop: '10px',
      cursor: 'pointer',
      width: '100%',
      fontWeight: 'bold'
    }
  };

  const handleProcess = async (catName) => {
    setLoading(true);
    const summary = fields.map(f => `${f}: ${data[`${catName}_${f}`] || 'غير متوفر'}`).join('، ');

    try {
      // 1. الاتصال بالذكاء الصناعي [تحقيقاً للمنطق المطلوب]
      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة، إليكِ بيانات عيادة ${catName}: ${summary}. قدمي تقريراً طبياً شاملاً ومتخصصاً.` }
      };

      const aiRes = await CapacitorHttp.post(aiOptions);
      const responseText = aiRes.data.reply || aiRes.data.message;
      setAiResponse(responseText);
      setIsChatOpen(true);

      // 2. الحفظ في DB نيون عبر API الإشعارات
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { user_id: 1, category: catName, value: summary, note: responseText }
      });

      setSavedReports(prev => [{ id: Date.now(), title: catName, text: responseText }, ...prev]);
    } catch (err) {
      setAiResponse("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت.");
      setIsChatOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = (id) => {
    setSavedReports(savedReports.filter(r => r.id !== id));
  };

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1565c0', marginBottom: '20px' }}>
        <Icon size={24} /> <h2>متابعة الطبيب والعيادات</h2>
      </div>

      {categories.map((cat, i) => (
        <div key={i} style={styles.accItem}>
          <div 
            style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }} 
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
          >
            <span>{cat.icon} عيادة {cat.name}</span>
            <span>{openIdx === i ? '−' : '+'}</span>
          </div>

          {openIdx === i && (
            <div style={{ padding: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {fields.map(f => (
                  <div key={f}>
                    <label style={{ fontSize: '0.7rem' }}>{f}</label>
                    <input 
                      style={styles.input} 
                      value={data[`${cat.name}_${f}`] || ''} 
                      onChange={e => setData({...data, [`${cat.name}_${f}`]: e.target.value})} 
                    />
                  </div>
                ))}
              </div>
              <button style={styles.aiBtn} onClick={() => handleProcess(cat.name)} disabled={loading}>
                {loading ? 'جاري التحليل...' : '✨ تحليل ذكي متخصص'}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* قائمة الردود المحفوظة */}
      {savedReports.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          {savedReports.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px', marginBottom: '5px' }}>
              <span style={{ fontSize: '0.8rem' }}>تقرير {r.title}</span>
              <button onClick={() => deleteReport(r.id)} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>🗑️</button>
            </div>
          ))}
        </div>
      )}

      {/* شاشة الشات المنبثقة */}
      {isChatOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', width: '90%', maxHeight: '70%', borderRadius: '20px', padding: '20px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong>تقرير رقة الذكي</strong>
              <button onClick={() => setIsChatOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✖️</button>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{aiResponse}</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              <span>📷</span> <span>🎤</span> <span>🖼️</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorClinical;
