import React, { useState, useEffect, useRef } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
// استيراد الخدمات المطلوبة من MediaService
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

const DoctorClinical = () => {
  const Icon = iconMap.insight;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_doctor')) || {});
  const [aiResponse, setAiResponse] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState(() => JSON.parse(localStorage.getItem('saved_reports')) || []);
  const [chatInput, setChatInput] = useState(''); // حالة لإدخال المستخدم في الشات
  
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

  /**
   * دالة متكاملة لفتح الوسائط ورفع الصور مباشرة
   */
  const handleMediaAction = async (type) => {
    try {
        setLoading(true);
        const base64Data = type === 'camera' ? await takePhoto() : await fetchImage();
        if (!base64Data) { setLoading(false); return; }

        const timestamp = Date.now();
        const fileName = `img_${timestamp}.png`;
        const mimeType = 'image/png';

        const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, mimeType);
        console.log("تم الرفع بنجاح، الرابط:", finalAttachmentUrl);
        
        // إرسال الرابط للذكاء الاصطناعي للتحليل
        handleProcess("تحليل صورة مرفقة", finalAttachmentUrl);
        return finalAttachmentUrl;
    } catch (error) {
        console.error("فشل في معالجة أو رفع الصورة:", error);
        alert("حدث خطأ أثناء الوصول للكاميرا أو رفع الصورة.");
    } finally {
        setLoading(false);
    }
  };

  const handleProcess = async (content = "عام", attachmentUrl = null) => {
    setLoading(true);
    const summary = fields.map(f => `${f}: ${data[`${content}_${f}`] || 'غير متوفر'}`).join('، ');
    
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { 
          prompt: `أنا أنثى مسلمة، بصفتك طبيب متخصص ومعتمد من منظمات الصحة، إليكِ المعلومات: ${content === "تحليل صورة مرفقة" ? "صورة تحليل طبي برابط: " + attachmentUrl : "بيانات عيادة " + content + ": " + summary}. قدمي تقريراً طبياً احترافياً.` 
        }
      };

      const aiRes = await CapacitorHttp.post(options);
      const responseText = aiRes.data.reply || aiRes.data.message;
      
      setAiResponse(responseText);
      setIsChatOpen(true);

      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { user_id: 1, category: content, value: summary, note: responseText }
      });

      setSavedReports(prev => [{ id: Date.now(), title: content, text: responseText, date: new Date().toLocaleDateString() }, ...prev]);
      setChatInput('');
    } catch (err) {
      setAiResponse("حدث خطأ في الاتصال. تأكدي من الإنترنت.");
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
    doctorRaqqaBtn: { background: 'linear-gradient(90deg, #9b59b6, #ff4d7d)', color: 'white', border: 'none', padding: '15px', borderRadius: '20px', marginBottom: '15px', width: '100%', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(155, 89, 182, 0.3)' },
    chatOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 3000 },
    chatContent: { background: 'white', width: '100%', maxWidth: '500px', height: '85%', borderTopLeftRadius: '35px', borderTopRightRadius: '35px', padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 25px rgba(0,0,0,0.1)' }
  };

  return (
    <div style={{ padding: '10px', paddingBottom: '100px' }}>
      <button style={styles.doctorRaqqaBtn} onClick={() => setIsChatOpen(true)}>
        <span>🩺</span> طبيب رقة المتخصص
      </button>

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
                      <input style={styles.input} value={data[`${cat.name}_${f}`] || ''} onChange={e => setData({...data, [`${cat.name}_${f}`]: e.target.value})} />
                    </div>
                  ))}
                </div>
                <button style={styles.aiBtn} onClick={() => handleProcess(cat.name)} disabled={loading}>{loading ? 'جاري المعالجة...' : '✨ تحليل وحفظ التقرير'}</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatContent}>
            {/* رأس الشات */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#ff4d7d' }}>طبيب رقة الذكي 👩‍⚕️</span>
              <button onClick={() => setIsChatOpen(false)} style={{ border: 'none', background: 'none', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            {/* منطقة عرض الردود والأرشيف داخل الشات */}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '15px', padding: '10px' }}>
              <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '15px', marginBottom: '20px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {aiResponse || "مرحباً بكِ، كيف يمكنني مساعدتكِ اليوم؟"}
              </div>

              {savedReports.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: '#9b59b6', marginBottom: '10px' }}>📂 الردود المحفوظة:</h4>
                  {savedReports.map(r => (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff5f7', padding: '10px', borderRadius: '10px', marginBottom: '8px', border: '1px solid #ff4d7d1a' }}>
                      <div style={{ fontSize: '0.75rem' }}><strong>{r.title}</strong> - {r.date}</div>
                      <button onClick={() => deleteReport(r.id)} style={{ border: 'none', background: 'none', color: '#ff4d7d', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* أزرار الوسائط وشريط التحدث */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '15px' }}>
                <button onClick={() => handleMediaAction('camera')} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>📸</button>
                <button onClick={() => alert('الميكروفون قيد التطوير')} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>🎙️</button>
                <button onClick={() => handleMediaAction('gallery')} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>🖼️</button>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  style={{ ...styles.input, flex: 1 }} 
                  placeholder="اسألي طبيب رقة..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button 
                  onClick={() => handleProcess(chatInput)}
                  style={{ background: '#ff4d7d', color: 'white', border: 'none', borderRadius: '10px', padding: '0 15px' }}
                >
                  إرسال
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorClinical;
