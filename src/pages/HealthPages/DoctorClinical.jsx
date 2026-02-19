import React, { useState, useEffect } from 'react';
// التصحيح: الخروج مستويين للوصول إلى مجلد src ثم الدخول إلى constants
import { iconMap } from '../../constants/iconMap'; [cite: 1]
import { CapacitorHttp } from '@capacitor/core'; // استيراد المحرك الأصلي للاتصال

const DoctorClinical = () => {
  // استخدام أيقونة التبصر (insight) من خريطة الأيقونات المعرفة في iconMap.js [cite: 2]
  const Icon = iconMap.insight;
  const [openIdx, setOpenIdx] = useState(null); [cite: 3]
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_doctor')) || {}); [cite: 3]
  
  // حالات إضافية للذكاء الصناعي والشات
  const [aiResponse, setAiResponse] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState(() => JSON.parse(localStorage.getItem('saved_reports')) || []);

  useEffect(() => {
    localStorage.setItem('lady_doctor', JSON.stringify(data)); [cite: 4]
  }, [data]);

  useEffect(() => {
    localStorage.setItem('saved_reports', JSON.stringify(savedReports));
  }, [savedReports]);

  const categories = [ [cite: 5]
    { name: "العظام", icon: "🦴" }, { name: "العيون", icon: "👁️" }, 
    { name: "الأسنان", icon: "🦷" }, { name: "القلب", icon: "🫀" }, 
    { name: "التحاليل", icon: "📝" }, { name: "الجلدية", icon: "✨" },
    { name: "الباطنة", icon: "🩺" }, { name: "الأعصاب", icon: "🧠" },
    { name: "الجراحة", icon: "🩹" }, { name: "الصيدلية", icon: "💊" }
  ];

  const fields = ["التاريخ", "اسم الطبيب", "التشخيص", "الدواء", "الموعد القادم", "الملاحظات", "النتيجة"]; [cite: 6]

  const styles = {
    card: { 
      background: 'rgba(255, 255, 255, 0.15)', 
      backdropFilter: 'blur(15px)', 
      borderRadius: '25px', 
      padding: '20px', 
      border: '1px solid rgba(255,255,255,0.3)', 
      marginBottom: '20px' 
    }, [cite: 7]
    accItem: { 
      background: 'rgba(255,255,255,0.2)', 
      borderRadius: '15px', 
      marginBottom: '8px',
      overflow: 'hidden'
    }, [cite: 7, 8]
    input: { 
      width: '100%', 
      padding: '8px', 
      borderRadius: '8px', 
      border: 'none', 
      background: 'rgba(255,255,255,0.5)', 
      fontSize: '0.85rem' 
    }, [cite: 8]
    aiBtn: {
      background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
      color: 'white',
      border: 'none',
      padding: '10px 15px',
      borderRadius: '12px',
      marginTop: '10px',
      cursor: 'pointer',
      width: '100%',
      fontWeight: 'bold'
    },
    chatOverlay: {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    },
    chatWindow: {
      background: 'white', width: '90%', maxHeight: '80%', borderRadius: '20px',
      padding: '20px', overflowY: 'auto', position: 'relative'
    },
    reportItem: {
      background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px',
      marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }
  };

  const handleProcess = async (catName) => {
    setLoading(true);
    // تجميع البيانات المدخلة في القسم المفتوح
    const summary = fields.map(f => `${f}: ${data[`${catName}_${f}`] || 'فارغ'}`).join(', ');

    try {
      // 1. استدعاء الذكاء الصناعي عبر CapacitorHttp
      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنا أنثى مسلمة، إليك تقرير عيادة ${catName}: ${summary}. قدمي لي تقريراً طبياً شاملاً ومتخصصاً بأسلوبك الرقيق.`
        }
      };

      const aiRes = await CapacitorHttp.post(aiOptions);
      const responseText = aiRes.data.reply || aiRes.data.message;
      setAiResponse(responseText);
      setIsChatOpen(true);

      // 2. حفظ البيانات والإشعار في قاعدة البيانات نيون (Neon) 
      const saveOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1, // معرف افتراضي
          category: `عيادة ${catName}`,
          value: summary,
          note: responseText
        }
      };
      await CapacitorHttp.post(saveOptions);

      // إضافة التقرير للقائمة المحلية المحفوظة
      const newReport = { id: Date.now(), title: `تقرير ${catName}`, content: responseText };
      setSavedReports([newReport, ...savedReports]);

    } catch (err) {
      console.error("فشل الاتصال الأصلي:", err);
      setAiResponse("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت يا رفيقتي.");
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
        <Icon size={24} /> <h2>متابعة الطبيب والعيادات الذكية</h2> [cite: 9]
      </div>

      {categories.map((cat, i) => (
        <div key={i} style={styles.accItem}>
          <div 
            style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }} 
            [cite_start]onClick={() => setOpenIdx(openIdx === i ? null : i)} [cite: 9, 10]
          >
            <span>{cat.icon} عيادة {cat.name}</span>
            <span>{openIdx === i ? '−' : '+'}</span> [cite: 10]
          </div>
          
          {openIdx === i && (
            <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}> [cite: 10, 11]
              {fields.map(f => (
                <div key={f}>
                  <label style={{ fontSize: '0.7rem' }}>{f}</label> [cite: 11]
                  <input 
                    style={styles.input} 
                    value={data[`${cat.name}_${f}`] || [cite_start]''} [cite: 12, 13]
                    [cite_start]onChange={e => setData({...data, [`${cat.name}_${f}`]: e.target.value})} [cite: 13]
                  />
                </div>
              ))}
              <button 
                style={styles.aiBtn} 
                onClick={() => handleProcess(cat.name)}
                disabled={loading}
              >
                {loading ? 'جاري التحليل...' : '✨ تحليل التقرير بالذكاء الصناعي'}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* قائمة حفظ الردود */}
      {savedReports.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#1565c0', fontSize: '1rem' }}>التقارير المحفوظة:</h3>
          {savedReports.map(report => (
            <div key={report.id} style={styles.reportItem}>
              <span style={{ fontSize: '0.8rem' }}>{report.title}</span>
              <button onClick={() => deleteReport(report.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>🗑️ حذف</button>
            </div>
          ))}
        </div>
      )}

      {/* نافذة الشات المنبثقة */}
      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatWindow}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#1565c0' }}>رد رقة الذكي ✨</span>
              <span onClick={() => setIsChatOpen(false)} style={{ cursor: 'pointer' }}>✖️</span>
            </div>
            
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#333', marginBottom: '20px' }}>
              {aiResponse}
            </div>

            {/* أزرار الوسائط */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} title="فتح الكاميرا">📷</button>
              <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} title="فتح الميكروفون">🎤</button>
              <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} title="رفع صورة">🖼️</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorClinical; [cite: 15]
