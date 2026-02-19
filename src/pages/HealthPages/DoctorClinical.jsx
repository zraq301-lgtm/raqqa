import React, { useState, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core'; // الاستيراد المطلوب للاتصال الأصلي

const DoctorClinical = () => {
  const Icon = iconMap.insight;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_doctor')) || {});
  const [aiResponse, setAiResponse] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [savedReports, setSavedReports] = useState(() => JSON.parse(localStorage.getItem('saved_medical_reports')) || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('lady_doctor', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('saved_medical_reports', JSON.stringify(savedReports));
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
    card: { background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(15px)', borderRadius: '25px', padding: '20px', border: '1px solid rgba(255,255,255,0.3)', marginBottom: '20px' },
    accItem: { background: 'rgba(255,255,255,0.2)', borderRadius: '15px', marginBottom: '8px', overflow: 'hidden' },
    input: { width: '100%', padding: '8px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' },
    aiBtn: { background: 'linear-gradient(45deg, #1565c0, #42a5f5)', color: 'white', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', marginTop: '10px', width: '100%', fontWeight: 'bold' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    chatBox: { background: 'white', width: '90%', maxHeight: '80%', borderRadius: '20px', padding: '20px', overflowY: 'auto', position: 'relative' },
    actionIcon: { fontSize: '1.5rem', cursor: 'pointer', margin: '0 10px' }
  };

  const handleProcessAI = async (catName) => {
    setLoading(true);
    // تجميع البيانات الخاصة بالقسم المختار فقط
    const summary = fields.map(f => `${f}: ${data[`${catName}_${f}`] || 'غير محدد'}`).join('، ');
    
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة، إليكِ تقرير عيادة ${catName}: ${summary}. أريد تحليلاً طبياً رقيقاً وشاملاً وتوجيهات بناءً على هذه المعطيات.` }
      };

      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || "عذراً رقيقة، حدث خطأ في معالجة البيانات.";
      
      setAiResponse(responseText);
      setIsChatOpen(true);

      // حفظ في قاعدة البيانات Neon عبر API الإشعارات
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { user_id: 1, category: catName, value: summary, note: responseText }
      });

      // إضافة لقائمة الحفظ المحلية
      setSavedReports([{ id: Date.now(), cat: catName, text: responseText }, ...savedReports]);

    } catch (err) {
      console.error("فشل الاتصال:", err);
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
        <Icon size={24} /> <h2>متابعة الطبيب والعيادات الذكية</h2>
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
              <button 
                style={styles.aiBtn} 
                onClick={() => handleProcessAI(cat.name)}
                disabled={loading}
              >
                {loading ? 'جاري التحليل رقيقة...' : '✨ تحليل ذكي للتقرير'}
              </button>
            </div>
          )}
        </div>
      ))}

      {/* قائمة التقارير المحفوظة */}
      {savedReports.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#1565c0', fontSize: '1rem' }}>📜 التقارير السابقة</h3>
          {savedReports.map(report => (
            <div key={report.id} style={{ ...styles.accItem, padding: '10px', fontSize: '0.8rem', position: 'relative' }}>
              <strong>{report.cat}:</strong> {report.text.substring(0, 50)}...
              <button 
                onClick={() => deleteReport(report.id)}
                style={{ position: 'absolute', left: '10px', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
              >🗑️</button>
            </div>
          ))}
        </div>
      )}

      {/* واجهة الشات المنبثقة */}
      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', marginBottom: '15px' }}>
              <h3 style={{ color: '#1565c0' }}>رقة - التقرير الطبي</h3>
              <span style={{ cursor: 'pointer' }} onClick={() => setIsChatOpen(false)}>✖️</span>
            </div>
            
            <p style={{ lineHeight: '1.6', color: '#444' }}>{aiResponse}</p>

            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'center' }}>
              <span style={styles.actionIcon} title="فتح الكاميرا">📷</span>
              <span style={styles.actionIcon} title="تسجيل صوتي">🎙️</span>
              <span style={styles.actionIcon} title="إرفاق صورة">🖼️</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorClinical;
