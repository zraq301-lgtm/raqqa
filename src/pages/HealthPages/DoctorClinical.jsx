import React, { useState, useEffect, useRef } from 'react';
[cite_start]import { iconMap } from '../../constants/iconMap'; [cite: 1]
[cite_start]import { CapacitorHttp } from '@capacitor/core'; [cite: 2]
// إصلاح الخطأ: استيراد MediaService كافتراضي بدلاً من استيراد مسمى
import MediaService from '../../services/MediaService'; 

const DoctorClinical = () => {
  [cite_start]const Icon = iconMap.insight; [cite: 2]
  [cite_start]const [openIdx, setOpenIdx] = useState(null); [cite: 3]
  [cite_start]const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_doctor')) || {}); [cite: 3]
  [cite_start]const [aiResponse, setAiResponse] = useState(''); [cite: 3]
  [cite_start]const [isChatOpen, setIsChatOpen] = useState(false); [cite: 4]
  [cite_start]const [loading, setLoading] = useState(false); [cite: 4]
  [cite_start]const [savedReports, setSavedReports] = useState(() => JSON.parse(localStorage.getItem('saved_reports')) || []); [cite: 4]
  
  // شريط كتابة البرومبت داخل الشات
  const [userPrompt, setUserPrompt] = useState('');

  [cite_start]const fileInputRef = useRef(null); [cite: 5]
  [cite_start]const cameraInputRef = useRef(null); [cite: 5]

  useEffect(() => {
    [cite_start]localStorage.setItem('lady_doctor', JSON.stringify(data)); [cite: 5]
  }, [data]);

  useEffect(() => {
    [cite_start]localStorage.setItem('saved_reports', JSON.stringify(savedReports)); [cite: 6]
  }, [savedReports]);

  [cite_start]const categories = [ [cite: 7]
    { name: "العظام", icon: "🦴" }, { name: "العيون", icon: "👁️" }, 
    { name: "الأسنان", icon: "🦷" }, { name: "القلب", icon: "🫀" }, 
    { name: "التحاليل", icon: "📝" }, { name: "الجلدية", icon: "✨" },
    { name: "الباطنة", icon: "🩺" }, { name: "الأعصاب", icon: "🧠" },
    { name: "الجراحة", icon: "🩹" }, { name: "الصيدلية", icon: "💊" }
  ];

  [cite_start]const fields = ["التاريخ", "اسم الطبيب", "التشخيص", "الدواء", "الموعد القادم", "الملاحظات", "النتيجة"]; [cite: 8]

  // وظيفة التعامل مع الوسائط (الكاميرا والمعرض) والرفع إلى Vercel Blob
  [cite_start]const handleMediaAction = async (type) => { [cite: 9]
    try {
        [cite_start]setLoading(true); [cite: 9]
        let image;
        if (type === 'camera') {
            image = await MediaService.takePhoto();
        } else {
            image = await MediaService.pickImage();
        }

        if (image) {
            // رفع الصورة إلى الرابط المحدد
            const uploadRes = await CapacitorHttp.post({
                url: 'https://raqqa-v6cd.vercel.app/api/upload',
                headers: { 'Content-Type': 'application/json' },
                data: { image: image.base64String || image.webPath }
            });

            const imageUrl = uploadRes.data.url;
            setAiResponse(`تم رفع الصورة بنجاح. جاري تحليلها...`);
            
            // إرسال الرابط للذكاء الاصطناعي للتعامل معها
            handleProcess("تحليل صورة", imageUrl);
        }
    [cite_start]} catch (error) { [cite: 12]
        [cite_start]console.error("فشل في معالجة الوسائط:", error); [cite: 12]
        [cite_start]alert("حدث خطأ أثناء الوصول للكاميرا أو رفع الصورة."); [cite: 13]
    } finally {
        [cite_start]setLoading(false); [cite: 13]
    }
  };

  [cite_start]const handleProcess = async (catName = "عام", imageUrl = null) => { [cite: 14]
    [cite_start]setLoading(true); [cite: 14]
    [cite_start]const summary = fields.map(f => `${f}: ${data[`${catName}_${f}`] || 'غير متوفر'}`).join('، '); [cite: 15]
    
    // استخدام النص المدخل من المستخدم أو النص التلقائي
    const promptText = userPrompt || `أنا أنثى مسلمة، بصفتك استشاري طب متخصص ومعتمد من مجموعات الأطباء العالمية، إليكِ بيانات عيادة ${catName}: ${summary}. ${imageUrl ? [cite_start]`رابط الصورة المرفقة: ${imageUrl}` : ''} يرجى تقديم تقرير طبي استشاري احترافي مفصل وتوجيهات بناءً على أحدث البروتوكولات الطبية.`; [cite: 16, 17]

    [cite_start]try { [cite: 16]
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      };

      [cite_start]const aiRes = await CapacitorHttp.post(options); [cite: 18]
      [cite_start]const responseText = aiRes.data.reply || aiRes.data.message; [cite: 18]
      
      [cite_start]setAiResponse(responseText); [cite: 18]
      [cite_start]setIsChatOpen(true); [cite: 18]
      setUserPrompt(''); 

      // حفظ الرد في الأرشيف المحلي
      [cite_start]setSavedReports(prev => [{ [cite: 20]
        id: Date.now(), 
        title: catName, 
        text: responseText, 
        date: new Date().toLocaleDateString() 
      }, ...prev]);

      // مزامنة البيانات مع جدول الإشعارات
      [cite_start]await CapacitorHttp.post({ [cite: 19]
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: { 
          user_id: 1, 
          category: catName, 
          value: summary, 
          note: responseText 
        [cite_start]} [cite: 20]
      });

    [cite_start]} catch (err) { [cite: 21]
      [cite_start]console.error("فشل الاتصال:", err); [cite: 21]
      [cite_start]setAiResponse("حدث خطأ في الشبكة، تم حفظ البيانات محلياً. تأكدي من الاتصال بالإنترنت لمزامنة التقرير مع استشاري رقة."); [cite: 22]
      [cite_start]setIsChatOpen(true); [cite: 22]
    } finally {
      [cite_start]setLoading(false); [cite: 23]
    }
  };

  [cite_start]const deleteReport = (id) => { [cite: 24]
    [cite_start]setSavedReports(prev => prev.filter(r => r.id !== id)); [cite: 24]
  };

  [cite_start]const styles = { [cite: 25]
    card: { background: '#fff', borderRadius: '25px', padding: '15px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(255, 77, 125, 0.1)' },
    accItem: { background: 'var(--female-pink-light, #fff5f7)', borderRadius: '15px', marginBottom: '8px', overflow: 'hidden' },
    input: { width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ff4d7d33', fontSize: '0.85rem', outline: 'none', background: '#fff' },
    aiBtn: { background: 'linear-gradient(45deg, #ff4d7d, #9b59b6)', color: 'white', border: 'none', padding: '12px', borderRadius: '15px', marginTop: '10px', cursor: 'pointer', width: '100%', fontWeight: 'bold' },
    [cite_start]doctorRaqqaBtn: { background: 'linear-gradient(90deg, #9b59b6, #ff4d7d)', color: 'white', border: 'none', padding: '15px', borderRadius: '20px', marginBottom: '15px', width: '100%', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(155, 89, 182, 0.3)' }, [cite: 26]
    [cite_start]chatOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 3000 }, [cite: 26]
    [cite_start]chatContent: { background: 'white', width: '100%', maxWidth: '500px', height: '90%', borderTopLeftRadius: '35px', borderTopRightRadius: '35px', padding: '25px', position: 'relative', overflowY: 'auto', boxShadow: '0 -10px 25px rgba(0,0,0,0.1)' } [cite: 26]
  };

  [cite_start]return ( [cite: 27]
    <div style={{ padding: '10px', paddingBottom: '100px' }}>
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{ display: 'none' }} />
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} />

      <button style={styles.doctorRaqqaBtn} onClick={() => setIsChatOpen(true)}>
        <span>👩‍⚕️</span> استشاري رقة الطبي
      </button>

      <div style={styles.card}>
        [cite_start]<div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--female-pink, #ff4d7d)', marginBottom: '15px' }}> [cite: 28]
          <Icon size={24} /> <h2 style={{ fontSize: '1.1rem', margin: 0 }}>متابعة العيادات التخصصية</h2>
        </div>

        {categories.map((cat, i) => (
          <div key={i} style={styles.accItem}>
            [cite_start]<div style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem' }} onClick={() => setOpenIdx(openIdx === i ? null : i)}> [cite: 29]
              <span>{cat.icon} {cat.name}</span>
              <span>{openIdx === i ? [cite_start]'−' : '+'}</span> [cite: 30]
            </div>

            {openIdx === i && (
              <div style={{ padding: '0 15px 15px 15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {fields.map(f => (
                    [cite_start]<div key={f}> [cite: 31]
                      <label style={{ fontSize: '0.65rem', color: '#777', display: 'block', marginBottom: '2px' }}>{f}</label>
                      <input 
                        style={styles.input} 
                        value={data[`${cat.name}_${f}`] || [cite_start]''} [cite: 32]
                        onChange={e => setData({...data, [`${cat.name}_${f}`]: e.target.value})}
                      />
                    </div>
                  [cite_start]))} [cite: 33]
                </div>
                <button style={styles.aiBtn} onClick={() => handleProcess(cat.name)} disabled={loading}>
                  {loading ? 'جاري تحليل البيانات...' : '✨ تحليل وحفظ التقرير الاستشاري'}
                </button>
              [cite_start]</div> [cite: 34]
            )}
          </div>
        ))}

        {/* قائمة الأرشيف */}
        {savedReports.length > 0 && (
          <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            [cite_start]<h3 style={{ fontSize: '0.85rem', color: '#9b59b6' }}>📂 أرشيف تقارير الاستشاري</h3> [cite: 35]
            {savedReports.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px', borderRadius: '12px', marginBottom: '8px', border: '1px solid #ff4d7d1a' }}>
                <div style={{ fontSize: '0.75rem', flex: 1, cursor: 'pointer' }} onClick={() => { setAiResponse(r.text); setIsChatOpen(true); }}>
                  <strong>{r.title}</strong> - {r.date}
                </div>
                [cite_start]<button onClick={() => deleteReport(r.id)} style={{ border: 'none', background: 'none', color: '#ff4d7d', fontSize: '1.2rem', cursor: 'pointer' }}>🗑️</button> [cite: 36]
              </div>
            ))}
          </div>
        )}
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatContent}>
            [cite_start]<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #f9f9f9', paddingBottom: '15px' }}> [cite: 37]
              <div>
                [cite_start]<span style={{ fontWeight: 'bold', color: '#ff4d7d', fontSize: '1.1rem', display: 'block' }}>استشاري رقة الذكي 👩‍⚕️</span> [cite: 37]
                [cite_start]<small style={{ color: '#888' }}>تحليل معتمد من مجموعات الأطباء</small> [cite: 37]
              [cite_start]</div> [cite: 38]
              [cite_start]<button onClick={() => setIsChatOpen(false)} style={{ border: 'none', background: '#f0f0f0', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}>✕</button> [cite: 38]
            </div>
            
            <div style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.8', marginBottom: '20px', minHeight: '150px', background: '#fcfcfc', padding: '15px', borderRadius: '15px', whiteSpace: 'pre-wrap' }}>
                {aiResponse || [cite_start]"مرحباً بكِ في عيادة رقة، أنا استشاري الطب الخاص بكِ. قومي بإدخال بياناتكِ أو ارفعي صور التحاليل للحصول على تقرير طبي احترافي."} [cite: 39]
            </div>

            {/* شريط كتابة البرومبت */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                style={{ ...styles.input, flex: 1 }} 
                placeholder="اسألي الاستشاري عن أي شيء..." 
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
              />
              <button onClick={() => handleProcess("استفسار")} style={{ ...styles.aiBtn, marginTop: 0, width: '80px' }}>إرسال</button>
            </div>

            {/* أزرار الوسائط */}
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '15px', background: '#fff5f7', borderRadius: '20px', marginBottom: '20px' }}>
              [cite_start]<button onClick={() => handleMediaAction('camera')} style={{ background: 'white', border: '1px solid #eee', padding: '12px', borderRadius: '15px', fontSize: '1.3rem' }}>📸</button> [cite: 40]
              [cite_start]<button onClick={() => alert('تم تفعيل الميكروفون للاستشارة الصوتية')} style={{ background: 'white', border: '1px solid #eee', padding: '12px', borderRadius: '15px', fontSize: '1.3rem' }}>🎙️</button> [cite: 40]
              [cite_start]<button onClick={() => handleMediaAction('gallery')} style={{ background: 'white', border: '1px solid #eee', padding: '12px', borderRadius: '15px', fontSize: '1.3rem' }}>🖼️</button> [cite: 40]
            </div>

            [cite_start]<button onClick={() => setIsChatOpen(false)} style={{ ...styles.aiBtn, background: '#9b59b6', padding: '15px', fontSize: '1rem' }}>إغلاق التقرير ✅</button> [cite: 41]
          </div>
        </div>
      )}
    </div>
  );
[cite_start]}; [cite: 42]

[cite_start]export default DoctorClinical; [cite: 42]
