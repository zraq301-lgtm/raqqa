import React, { useState, useEffect, useRef } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
// استيراد خدمة الميديا المطلوبة
import { MediaService } from '../../services/MediaService'; 

const DoctorClinical = () => {
  const Icon = iconMap.insight;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_doctor')) || {});
  const [aiResponse, setAiResponse] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedReports, setSavedReports] = useState(() => JSON.parse(localStorage.getItem('saved_reports')) || []);
  
  // حالة جديدة للمدخل النصي داخل الشات
  const [userPrompt, setUserPrompt] = useState('');

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

  // تفعيل الكاميرا والمعرض ورفع الصور لـ Vercel Blob
  const handleMediaAction = async (type) => {
    try {
        setLoading(true);
        let image;
        if (type === 'camera') {
            image = await MediaService.takePhoto();
        } else {
            image = await MediaService.pickImage();
        }

        if (image) {
            // رفع الصورة إلى Vercel Blob
            const uploadRes = await CapacitorHttp.post({
                url: 'https://raqqa-v6cd.vercel.app/api/upload',
                headers: { 'Content-Type': 'application/json' },
                data: { image: image.base64String || image.webPath }
            });

            const imageUrl = uploadRes.data.url;
            setAiResponse(`تم رفع الصورة بنجاح: ${imageUrl} \n جاري تحليل الصورة بواسطة الذكاء الاصطناعي...`);
            
            // إرسال الرابط للذكاء الاصطناعي
            handleProcess("تحليل صورة", imageUrl);
        }
    } catch (error) {
        console.error("فشل في معالجة الوسائط:", error);
        alert("حدث خطأ أثناء الوصول للكاميرا أو رفع الصورة.");
    } finally {
        setLoading(false);
    }
  };

  const handleProcess = async (catName = "عام", imageUrl = null) => {
    setLoading(true);
    const summary = fields.map(f => `${f}: ${data[`${catName}_${f}`] || 'غير متوفر'}`).join('، ');
    
    // استخدام البرومبت المكتوب أو الافتراضي
    const finalPrompt = userPrompt || `أنا أنثى مسلمة، بصفتك استشاري طب متخصص ومعتمد من مجموعات الأطباء العالمية، إليكِ بيانات عيادة ${catName}: ${summary}. ${imageUrl ? `رابط الصورة المرفقة: ${imageUrl}` : ''} يرجى تقديم تقرير طبي استشاري احترافي مفصل وتوجيهات بناءً على أحدث البروتوكولات الطبية.`;

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: finalPrompt }
      };

      const aiRes = await CapacitorHttp.post(options);
      const responseText = aiRes.data.reply || aiRes.data.message;
      
      setAiResponse(responseText);
      setIsChatOpen(true);
      setUserPrompt(''); // تفريغ الحقل بعد الإرسال

      // حفظ التقرير في الأرشيف
      const newReport = { 
        id: Date.now(), 
        title: catName === "تحليل صورة" ? "تحليل صورة طبية" : catName, 
        text: responseText, 
        date: new Date().toLocaleDateString() 
      };
      
      setSavedReports(prev => [newReport, ...prev]);

      // إشعار خارجي
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { user_id: 1, category: catName, value: summary, note: responseText }
      });

    } catch (err) {
      console.error("فشل الاتصال:", err);
      setAiResponse("حدث خطأ في الشبكة، تم حفظ البيانات محلياً. تأكدي من الاتصال بالإنترنت لمزامنة التقرير.");
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
    chatContent: { background: 'white', width: '100%', maxWidth: '500px', height: '90%', borderTopLeftRadius: '35px', borderTopRightRadius: '35px', padding: '25px', position: 'relative', overflowY: 'auto', boxShadow: '0 -10px 25px rgba(0,0,0,0.1)' },
    promptContainer: { display: 'flex', gap: '10px', marginTop: '15px', marginBottom: '15px' },
    promptInput: { flex: 1, padding: '12px', borderRadius: '15px', border: '1px solid #ddd', outline: 'none', fontSize: '0.9rem' }
  };

  return (
    <div style={{ padding: '10px', paddingBottom: '100px' }}>
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{ display: 'none' }} />
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} />

      <button style={styles.doctorRaqqaBtn} onClick={() => setIsChatOpen(true)}>
        <span>👩‍⚕️</span> استشاري رقة الطبي
      </button>

      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--female-pink, #ff4d7d)', marginBottom: '15px' }}>
          <Icon size={24} /> <h2 style={{ fontSize: '1.1rem', margin: 0 }}>متابعة العيادات التخصصية</h2>
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
                  {loading ? 'جاري تحليل البيانات...' : '✨ تحليل وحفظ التقرير الاستشاري'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #f9f9f9', paddingBottom: '15px' }}>
              <div>
                <span style={{ fontWeight: 'bold', color: '#ff4d7d', fontSize: '1.1rem', display: 'block' }}>استشاري رقة الذكي 👩‍⚕️</span>
                <small style={{ color: '#888' }}>تحليل معتمد من مجموعات الأطباء</small>
              </div>
              <button onClick={() => setIsChatOpen(false)} style={{ border: 'none', background: '#f0f0f0', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.8', marginBottom: '20px', minHeight: '150px', background: '#fcfcfc', padding: '15px', borderRadius: '15px', whiteSpace: 'pre-wrap' }}>
                {aiResponse || "مرحباً بكِ في عيادة رقة، أنا استشاري الطب الخاص بكِ. قومي بإدخال بياناتكِ أو ارفعي صور التحاليل للحصول على تقرير طبي احترافي."}
            </div>

            {/* شريط كتابة البرومبت */}
            <div style={styles.promptContainer}>
              <input 
                style={styles.promptInput} 
                placeholder="اسألي الطبيب عن أي شيء..." 
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
              />
              <button 
                onClick={() => handleProcess("استشارة سريعة")} 
                style={{ background: '#ff4d7d', color: 'white', border: 'none', borderRadius: '15px', padding: '0 15px' }}
              >
                إرسال
              </button>
            </div>

            {/* أزرار الوسائط */}
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '15px', background: '#fff5f7', borderRadius: '20px', marginBottom: '20px' }}>
              <button onClick={() => handleMediaAction('camera')} style={{ background: 'white', border: '1px solid #eee', padding: '12px', borderRadius: '12px', fontSize: '1.2rem' }}>📸</button>
              <button onClick={() => alert('تم تفعيل الميكروفون للاستشارة الصوتية')} style={{ background: 'white', border: '1px solid #eee', padding: '12px', borderRadius: '12px', fontSize: '1.2rem' }}>🎙️</button>
              <button onClick={() => handleMediaAction('gallery')} style={{ background: 'white', border: '1px solid #eee', padding: '12px', borderRadius: '12px', fontSize: '1.2rem' }}>🖼️</button>
            </div>

            {/* أرشيف الردود داخل الشات */}
            {savedReports.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#9b59b6', marginBottom: '10px' }}>📂 أرشيف الاستشارات</h3>
                {savedReports.map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', padding: '10px', borderRadius: '12px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.75rem', flex: 1, cursor: 'pointer' }} onClick={() => setAiResponse(r.text)}>
                      <strong>{r.title}</strong> - {r.date}
                    </div>
                    <button onClick={() => deleteReport(r.id)} style={{ border: 'none', background: 'none', color: '#ff4d7d', fontSize: '1.1rem', cursor: 'pointer' }}>🗑️</button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setIsChatOpen(false)} style={{ ...styles.aiBtn, background: '#9b59b6', padding: '15px', fontSize: '1rem' }}>إغلاق التقرير ✅</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorClinical;
