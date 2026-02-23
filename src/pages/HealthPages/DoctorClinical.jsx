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

  const handleProcess = async (catName) => {
    setLoading(true);
    const summary = fields.map(f => `${f}: ${data[`${catName}_${f}`] || 'غير متوفر'}`).join('، ');
    
    try {
      // 1. طلب التحليل من الذكاء الصناعي
      const aiRes = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة، إليكِ بيانات عيادة ${catName}: ${summary}. قدمي تقريراً طبياً شاملاً.` }
      });

      const responseText = aiRes.data.reply || aiRes.data.message;
      setAiResponse(responseText);
      setIsChatOpen(true);

      // 2. حفظ البيانات في جدول الإشعارات (الرابط الجديد)
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { 
          user_id: 1, 
          category: catName, 
          value: summary, 
          note: responseText 
        }
      });

      setSavedReports(prev => [{ id: Date.now(), title: catName, text: responseText, date: new Date().toLocaleDateString() }, ...prev]);
    } catch (err) {
      setAiResponse("تم حفظ البيانات محلياً، يرجى التحقق من الاتصال بالإنترنت لمزامنة التقرير.");
      setIsChatOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = (id) => {
    setSavedReports(prev => prev.filter(r => r.id !== id));
  };

  const styles = {
    card: { background: '#fff', borderRadius: '25px', padding: '15px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(255, 77, 125, 0.1)' },
    accItem: { background: 'var(--female-pink-light, #fff5f7)', borderRadius: '15px', marginBottom: '8px', overflow: 'hidden' },
    input: { width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ff4d7d33', fontSize: '0.85rem', outline: 'none', background: '#fff' },
    aiBtn: { background: 'linear-gradient(45deg, #ff4d7d, #9b59b6)', color: 'white', border: 'none', padding: '12px', borderRadius: '15px', marginTop: '10px', cursor: 'pointer', width: '100%', fontWeight: 'bold' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
    chatContent: { background: 'white', width: '90%', maxWidth: '320px', maxHeight: '80%', borderRadius: '30px', padding: '20px', position: 'relative', overflowY: 'auto' }
  };

  return (
    <div style={{ padding: '10px', paddingBottom: '100px' }}>
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{ display: 'none' }} />
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} />

      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--female-pink, #ff4d7d)', marginBottom: '15px' }}>
          <Icon size={24} /> <h2 style={{ fontSize: '1.1rem', margin: 0 }}>متابعة العيادات</h2>
        </div>

        {categories.map((cat, i) => (
          <div key={i} style={styles.accItem}>
            <div style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem' }} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span>{cat.icon} {cat.name}</span>
              <span>{openIdx === i ? '−' : '+'}</span>
            </div>

            {openIdx === i && (
              <div style={{ padding: '0 15px 15px 15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {fields.map(f => (
                    <div key={f}>
                      <label style={{ fontSize: '0.65rem', color: '#777', display: 'block', marginBottom: '2px' }}>{f}</label>
                      <input 
                        style={styles.input} 
                        value={data[`${cat.name}_${f}`] || ''} 
                        onChange={e => setData({...data, [`${cat.name}_${f}`]: e.target.value})}
                      />
                    </div>
                  ))}
                </div>
                <button style={styles.aiBtn} onClick={() => handleProcess(cat.name)} disabled={loading}>
                  {loading ? 'جاري المعالجة...' : '✨ تحليل وحفظ التقرير'}
                </button>
              </div>
            )}
          </div>
        ))}

        {savedReports.length > 0 && (
          <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <h3 style={{ fontSize: '0.85rem', color: '#9b59b6' }}>📂 أرشيف التقارير</h3>
            {savedReports.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#fff', padding: '10px', borderRadius: '12px', marginBottom: '8px', border: '1px solid #ff4d7d1a' }}>
                <div style={{ fontSize: '0.75rem' }}><strong>{r.title}</strong> - {r.date}</div>
                <button onClick={() => deleteReport(r.id)} style={{ border: 'none', background: 'none', color: '#ff4d7d' }}>🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#ff4d7d', fontSize: '0.9rem' }}>تقرير رقة الذكي</span>
              <button onClick={() => setIsChatOpen(false)} style={{ border: 'none', background: 'none', fontSize: '1rem' }}>✕</button>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#444', lineHeight: '1.6', marginBottom: '20px' }}>{aiResponse}</div>
            <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '15px', borderTop: '1px solid #eee' }}>
              <button onClick={() => cameraInputRef.current.click()} style={{ background: 'none', border: 'none', fontSize: '1.4rem' }}>📷</button>
              <button onClick={() => alert('تم تفعيل الميكروفون')} style={{ background: 'none', border: 'none', fontSize: '1.4rem' }}>🎤</button>
              <button onClick={() => fileInputRef.current.click()} style={{ background: 'none', border: 'none', fontSize: '1.4rem' }}>🖼️</button>
            </div>
            <button onClick={() => setIsChatOpen(false)} style={{ ...styles.aiBtn, background: '#9b59b6', marginTop: '20px' }}>تم الحفظ بنجاح ✅</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorClinical;
