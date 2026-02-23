import React, { useState, useEffect, useRef } from 'react';
[cite_start]import { iconMap } from '../../constants/iconMap'; [cite: 1]
[cite_start]import { CapacitorHttp } from '@capacitor/core'; [cite: 2]

const DoctorClinical = () => {
  [cite_start]const Icon = iconMap.insight; [cite: 2]
  [cite_start]const [openIdx, setOpenIdx] = useState(null); [cite: 3]
  [cite_start]const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_doctor')) || {}); [cite: 3]
  [cite_start]const [aiResponse, setAiResponse] = useState(''); [cite: 4]
  [cite_start]const [isChatOpen, setIsChatOpen] = useState(false); [cite: 4]
  [cite_start]const [loading, setLoading] = useState(false); [cite: 5]
  [cite_start]const [savedReports, setSavedReports] = useState(() => JSON.parse(localStorage.getItem('saved_reports')) || []); [cite: 5]
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    [cite_start]localStorage.setItem('lady_doctor', JSON.stringify(data)); [cite: 6]
  }, [data]);

  useEffect(() => {
    [cite_start]localStorage.setItem('saved_reports', JSON.stringify(savedReports)); [cite: 7]
  }, [savedReports]);

  [cite_start]const categories = [ [cite: 8]
    { name: "العظام", icon: "🦴" }, { name: "العيون", icon: "👁️" }, 
    { name: "الأسنان", icon: "🦷" }, { name: "القلب", icon: "🫀" }, 
    { name: "التحاليل", icon: "📝" }, { name: "الجلدية", icon: "✨" },
    { name: "الباطنة", icon: "🩺" }, { name: "الأعصاب", icon: "🧠" },
    { name: "الجراحة", icon: "🩹" }, { name: "الصيدلية", icon: "💊" }
  ];

  [cite_start]const fields = ["التاريخ", "اسم الطبيب", "التشخيص", "الدواء", "الموعد القادم", "الملاحظات", "النتيجة"]; [cite: 9]

  const handleProcess = async (catName) => {
    [cite_start]setLoading(true); [cite: 13]
    [cite_start]const summary = fields.map(f => `${f}: ${data[`${catName}_${f}`] || 'غير متوفر'}`).join('، '); [cite: 14]
    
    try {
      // 1. الاتصال بالذكاء الصناعي
      const aiRes = await CapacitorHttp.post({
        [cite_start]url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai', [cite: 15]
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة، إليكِ بيانات عيادة ${catName}: ${summary}. قدمي تقريراً طبياً شاملاً ومتخصصاً.` }
      });

      [cite_start]const responseText = aiRes.data.reply || aiRes.data.message; [cite: 17]
      [cite_start]setAiResponse(responseText); [cite: 17]
      [cite_start]setIsChatOpen(true); [cite: 17]

      // 2. الحفظ في نيون عبر رابط الإشعارات الجديد [التعديل المطلوب]
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        [cite_start]data: { user_id: 1, category: catName, value: summary, note: responseText } [cite: 17]
      });

      [cite_start]setSavedReports(prev => [{ id: Date.now(), title: catName, text: responseText, date: new Date().toLocaleDateString() }, ...prev]); [cite: 18]
    } catch (err) {
      [cite_start]setAiResponse("حدث خطأ في الاتصال، تأكدي من الإنترنت."); [cite: 19]
      setIsChatOpen(true);
    } finally {
      [cite_start]setLoading(false); [cite: 20]
    }
  };

  const deleteReport = (id) => {
    [cite_start]setSavedReports(savedReports.filter(r => r.id !== id)); [cite: 21]
  };

  const styles = {
    [cite_start]card: { background: 'white', borderRadius: '25px', padding: '15px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(255, 77, 125, 0.1)' }, [cite: 10]
    [cite_start]accItem: { background: 'rgba(255, 77, 125, 0.08)', borderRadius: '15px', marginBottom: '8px', overflow: 'hidden' }, [cite: 10, 11]
    [cite_start]input: { width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ff4d7d33', fontSize: '0.85rem', outline: 'none' }, [cite: 11]
    [cite_start]aiBtn: { background: 'linear-gradient(45deg, #ff4d7d, #9b59b6)', color: 'white', border: 'none', padding: '10px', borderRadius: '12px', marginTop: '10px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }, [cite: 11, 12]
    // تنسيق الشات الجديد ليناسب الهاتف
    [cite_start]chatOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }, [cite: 30]
    [cite_start]chatContent: { background: 'white', width: '85%', maxWidth: '350px', maxHeight: '75%', borderRadius: '25px', padding: '20px', overflowY: 'auto', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' } [cite: 30]
  };

  return (
    <div style={{ padding: '10px' }}>
      {/* مدخلات الوسائط المخفية */}
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{ display: 'none' }} />
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} />

      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff4d7d', marginBottom: '20px' }}>
          [cite_start]<Icon size={24} /> <h2 style={{ fontSize: '1.1rem', margin: 0 }}>متابعة الطبيب والعيادات</h2> [cite: 22]
        </div>

        {categories.map((cat, i) => (
          <div key={i} style={styles.accItem}>
            [cite_start]<div style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }} onClick={() => setOpenIdx(openIdx === i ? null : i)}> [cite: 22, 23]
              <span style={{ fontSize: '0.9rem' }}>{cat.icon} عيادة {cat.name}</span>
              <span>{openIdx === i ? '−' : '+'}</span>
            </div>

            {openIdx === i && (
              [cite_start]<div style={{ padding: '15px', borderTop: '1px solid rgba(255, 77, 125, 0.1)' }}> [cite: 23]
                [cite_start]<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}> [cite: 24]
                  {fields.map(f => (
                    <div key={f}>
                      [cite_start]<label style={{ fontSize: '0.65rem', color: '#666' }}>{f}</label> [cite: 24]
                      <input 
                        style={styles.input} 
                        value={data[`${cat.name}_${f}`] || ''} 
                        [cite_start]onChange={e => setData({...data, [`${cat.name}_${f}`]: e.target.value})} [cite: 25, 26]
                      />
                    </div>
                  ))}
                </div>
                [cite_start]<button style={styles.aiBtn} onClick={() => handleProcess(cat.name)} disabled={loading}> [cite: 27]
                  {loading ? [cite_start]'جاري التحليل...' : '✨ تحليل وحفظ التقرير'} [cite: 28]
                </button>
              </div>
            )}
          </div>
        ))}

        {/* أرشيف التقارير المصغر */}
        {savedReports.length > 0 && (
          [cite_start]<div style={{ marginTop: '15px' }}> [cite: 29]
            <h3 style={{ fontSize: '0.85rem', color: '#9b59b6', marginBottom: '10px' }}>📁 أرشيف التقارير (نيون)</h3>
            {savedReports.map(r => (
              [cite_start]<div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#fff5f7', padding: '8px 12px', borderRadius: '10px', marginBottom: '5px', border: '1px solid #ff4d7d1a' }}> [cite: 29]
                <span style={{ fontSize: '0.75rem' }}>تقرير {r.title}</span>
                [cite_start]<button onClick={() => deleteReport(r.id)} style={{ border: 'none', background: 'none', color: '#ff4d7d', cursor: 'pointer' }}>🗑️</button> [cite: 29]
              </div>
            ))}
          </div>
        )}
      </div>

      {/* شاشة الشات المنبثقة المنظمة للهاتف */}
      {isChatOpen && (
        [cite_start]<div style={styles.chatOverlay}> [cite: 30]
          [cite_start]<div style={styles.chatContent}> [cite: 30]
            [cite_start]<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}> [cite: 30, 31]
              <strong style={{ fontSize: '0.9rem', color: '#ff4d7d' }}>تقرير رقة الذكي</strong>
              [cite_start]<button onClick={() => setIsChatOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>✖️</button> [cite: 31]
            </div>
            
            [cite_start]<p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#444', textAlign: 'justify' }}>{aiResponse}</p> [cite: 31]
            
            [cite_start]<div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}> [cite: 31, 32]
              <span onClick={() => cameraInputRef.current.click()} style={{ cursor: 'pointer', fontSize: '1.3rem' }}>📷</span>
              <span onClick={() => alert('جاري تفعيل الميكروفون...')} style={{ cursor: 'pointer', fontSize: '1.3rem' }}>🎤</span>
              <span onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer', fontSize: '1.3rem' }}>🖼️</span>
            </div>
            
            <button 
              onClick={() => setIsChatOpen(false)} 
              style={{ ...styles.aiBtn, marginTop: '20px', background: '#9b59b6' }}
            >
              إغلاق وحفظ التقرير ✅
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorClinical;
