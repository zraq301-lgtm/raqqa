import React, { useState, useRef, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService'; 

const LactationHub = () => {
  const Icon = iconMap.feelings;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lady_lactation')) || {};
    } catch { return {}; }
  });
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [userQuery, setUserQuery] = useState(''); 
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lactation_history')) || [];
    } catch { return []; }
  });

  const saveAndNotify = async (categoryTitle, currentAnalysis) => {
    const savedToken = localStorage.getItem('fcm_token');
    const scheduledDate = new Date();
    scheduledDate.setMonth(scheduledDate.getMonth() + 9); 

    try {
      const saveToNeonOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          fcmToken: savedToken || undefined,
          user_id: 1,
          category: 'medical_report',
          title: `تقرير طبي متخصص: ${categoryTitle} 🩺`,
          body: "تم إصدار تحليل شامل لحالة الرضاعة بناءً على المعايير الدولية.", 
          scheduled_for: scheduledDate.toISOString(),
          note: JSON.stringify({
            full_analysis: currentAnalysis,
            full_data: data
          })
        }
      };
      await CapacitorHttp.post(saveToNeonOptions);

      if (savedToken) {
        const fcmOptions = {
          url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
          headers: { 'Content-Type': 'application/json' },
          data: {
            token: savedToken,
            title: 'تقرير الرضاعة جاهز 🤱',
            body: 'إليكِ تحليل ذكاء اصطناعي مفصل لحالتكِ وحالة طفلكِ.',
            data: { type: 'medical_report' }
          }
        };
        await CapacitorHttp.post(fcmOptions);
      }
    } catch (err) { console.error("خطأ في المزامنة:", err); }
  };

  const handleMediaAction = async (type) => {
    try {
        setLoading(true);
        const base64Data = type === 'camera' ? await takePhoto() : await fetchImage();
        if (!base64Data) { setLoading(false); return; }
        const timestamp = Date.now();
        const fileName = `lactation_img_${timestamp}.png`;
        const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, 'image/png');
        await handleSaveAndAnalyze("حللي هذه الصورة طبياً في سياق الرضاعة", finalAttachmentUrl);
    } catch (error) { alert("حدث خطأ في معالجة الوسائط."); } finally { setLoading(false); }
  };

  const sections = [
    { title: "الرضاعة الطبيعية", emoji: "🤱", fields: ["الوقت", "الجهة", "المدة", "راحة الأم", "معدل الرضاعة", "تاريخ اليوم", "بداية الرضعة", "نهاية الرضعة", "ملاحظات", "مستوى الشبع"] },
    { title: "الرضاعة الصناعية", emoji: "🍼", fields: ["الكمية مل", "نوع الحليب", "درجة الحرارة", "وقت التحضير", "مدة الرضعة", "نظافة الرضاعة", "تاريخ الانتهاء", "الماء المستخدم", "ملاحظات", "رد فعل الرضيع"] },
    { title: "صحة الثدي", emoji: "🧊", fields: ["تحجر", "تشققات", "تنظيف", "استخدام كريمات", "كمادات", "ألم", "احمرار", "حرارة", "ملاحظات", "فحص دوري"] },
    { title: "تغذية المرضع", emoji: "🌿", fields: ["سوائل", "مدرات حليب", "حلبة", "يانسون", "وجبة الغذاء", "فيتامينات", "شمر", "تجنب منبهات", "ماء", "ملاحظات"] },
    { title: "حالة الرضيع", emoji: "🧷", fields: ["الحفاضات", "لون البول", "جودة النوم", "الوزن", "الطول", "الغازات", "المغص", "الوعي", "الهدوء", "ملاحظات"] },
    { title: "الشفط والتخزين", emoji: "펌", fields: ["كمية الشفط", "تاريخ التخزين", "ساعة الشفط", "جهة الثدي", "صلاحية العبوة", "درجة البرودة", "تاريخ الاستخدام", "نوع العبوة", "طريقة الإذابة", "ملاحظات"] },
    { title: "الحالة النفسية", emoji: "🫂", fields: ["دعم الزوج", "ساعات الراحة", "القلق", "الاكتئاب", "التواصل", "الخروج للمشي", "هوايات", "الاسترخاء", "ملاحظات", "درجة الرضا"] }
  ];

  const handleSaveAndAnalyze = async (customQuery = null, imageUrl = null) => {
    setLoading(true);
    setShowChat(true);
    if (!customQuery) setAiResponse("جاري إعداد تقرير طبي مفصل عن حالة الرضاعة...");
    
    try {
      // تطوير الـ Prompt ليكون "خبير رضاعة دولي"
      const strictPrompt = `
      بصفتكِ استشارية رضاعة دولية معتمدة (IBCLC) وخبيرة في بروتوكولات منظمة الصحة العالمية (WHO) واليونيسيف:
      1. قومي بتحليل هذه البيانات بدقة شديدة: ${customQuery || JSON.stringify(data)}.
      2. التقرير يجب أن يكون طويلاً ومفصلاً باللغة العربية بأسلوب طبي ودود.
      3. الهيكل المطلوب للرد:
         - **تحليل المدخلات:** شرح لكل معلومة قدمتها الأم وماذا تعني طبياً.
         - **الصواب والخطأ:** تقييم ممارسات الأم الحالية (حددي ما هو صحيح وما يحتاج تعديل).
         - **خطة زيادة إدرار الحليب:** نصائح عملية غذائية وتقنية لزيادة كمية الحليب.
         - **توصيات طبية:** بناءً على أحدث الأبحاث (مثل بروتوكولات الأكاديمية الأمريكية لطب الأطفال).
         - **تنبيهات هامة:** متى يجب استشارة الطبيب فوراً؟
      4. إذا تم إرفاق صورة (${imageUrl || 'لا يوجد'})، حلليها في سياق صحة الثدي أو الرضاعة.
      5. لا تخرجي عن موضوع الرضاعة والأمومة أبداً.
      `;

      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: strictPrompt }
      });

      const result = response.data.reply || response.data.message || "عذراً، لم أتمكن من استلام التحليل الطبي حالياً.";
      setAiResponse(result);
      if (!customQuery) await saveAndNotify("تحليل الرضاعة الشامل", result);

      const newEntry = { id: Date.now(), text: result, date: new Date().toLocaleString() };
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('lactation_history', JSON.stringify(updatedHistory));
      setUserQuery('');
    } catch (error) { setAiResponse("حدث خطأ في الاتصال بالخبير الطبي."); } finally { setLoading(false); }
  };

  const deleteResponse = (id) => {
    const filtered = history.filter(item => item.id !== id);
    setHistory(filtered);
    localStorage.setItem('lactation_history', JSON.stringify(filtered));
  };

  const renderInput = (f) => (
    <div key={f} style={{ marginBottom: '10px' }}>
      <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px', color: '#eee' }}>{f}</label>
      <input 
        type={f.includes("تاريخ") ? "date" : f.includes("الوقت") || f.includes("ساعة") ? "time" : "text"}
        style={styles.input} 
        value={data[f] || ''} 
        onChange={e => {
          const newData = {...data, [f]: e.target.value};
          setData(newData);
          localStorage.setItem('lady_lactation', JSON.stringify(newData));
        }}
      />
    </div>
  );

  return (
    <div style={styles.mainContainer}>
      <div style={styles.header}>
        <div style={styles.statsRow}>
          <button onClick={() => setShowChat(true)} style={{...styles.circle, border:'none', cursor:'pointer', background:'#fff', color:'#739673'}}>💬</button>
          <div style={styles.circle}>🤱</div>
          <div style={styles.circle}><Icon size={18} /></div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={styles.title}>مستشار الرضاعة الذكي</h2>
          <div style={styles.subtitle}>التحليل الطبي المعتمد دولياً</div>
        </div>
      </div>

      <div style={styles.progressContainer}>
        <div style={styles.progressBar}><div style={styles.progressFill}></div></div>
      </div>

      <div style={styles.sectionsList}>
        {sections.map((sec, i) => (
          <div key={i} style={{...styles.sectionCard, background: openIdx === i ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)'}}>
            <div style={styles.sectionHeader} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span style={{ fontWeight: 'bold' }}>{sec.emoji} {sec.title}</span>
              <span style={styles.plusIcon}>{openIdx === i ? '✕' : '＋'}</span>
            </div>
            {openIdx === i && (
              <div style={styles.fieldsGrid}>{sec.fields.map(f => renderInput(f))}</div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.footerControls}>
        <button onClick={() => handleSaveAndAnalyze()} style={styles.analyzeBtn}>
          {loading ? 'جاري إعداد التقرير الطبي...' : 'إصدار تقرير الرضاعة الشامل'}
        </button>
        <div style={styles.actionButtons}>
          <button onClick={() => handleMediaAction('gallery')} style={styles.roundBtn}>📁</button>
          <button onClick={() => handleMediaAction('camera')} style={styles.roundBtn}>📷</button>
        </div>

        <div style={styles.historyBox}>
          {history.map(item => (
            <div key={item.id} style={styles.historyItem}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <small style={{ opacity: 0.6 }}>{item.date}</small>
                <div style={{display:'flex', gap:'5px'}}>
                   <button onClick={() => deleteResponse(item.id)} style={styles.smallActionBtn}>🗑️</button>
                   <button onClick={() => {setAiResponse(item.text); setShowChat(true);}} style={styles.smallActionBtn}>👁️</button>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', marginTop:'5px' }}>{item.text.substring(0, 80)}...</div>
            </div>
          ))}
        </div>
      </div>

      {showChat && (
        <div style={styles.overlay}>
          <div style={styles.chatSheet}>
            <div style={styles.chatHeader}>
              <span style={{ fontWeight: '800' }}>🤱 التقرير الطبي للرضاعة</span>
              <button onClick={() => setShowChat(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.chatBody}>
              {loading ? (
                <div style={{textAlign:'center', marginTop:'50px'}}>
                   <div style={styles.loader}></div>
                   <p style={{fontSize:'0.8rem', color:'#739673'}}>جاري فحص البيانات طبياً...</p>
                </div>
              ) : (
                <div style={{ whiteSpace: 'pre-line', lineHeight:'1.6' }}>
                  {aiResponse || "أدخلي بياناتكِ واضغطي على 'تحليل' للحصول على التقرير."}
                </div>
              )}
            </div>
            <div style={styles.chatFooter}>
              <div style={styles.chatInputWrapper}>
                <input 
                  style={styles.chatInput} 
                  placeholder="اسألي الخبيرة عن أي تفاصيل إضافية..." 
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                />
                <button 
                  onClick={() => handleSaveAndAnalyze(userQuery)} 
                  style={styles.sendBtn}
                >🚀</button>
              </div>
              <button onClick={() => setShowChat(false)} style={styles.doneBtn}>فهمت التوصيات</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ... ستايلاتك الجميلة (نفس الستايلات السابقة)
const styles = {
    // أبقيت الستايلات كما هي للحفاظ على هوية تطبيقك "Glassmorphism"
    mainContainer: {
      background: 'linear-gradient(160deg, #96b896 0%, #739673 100%)',
      borderRadius: '35px', padding: '20px', color: '#fff', direction: 'rtl',
      fontFamily: 'sans-serif', minHeight: '90vh', position: 'relative', overflow: 'hidden',
      boxShadow: '0 15px 35px rgba(0,0,0,0.2)', border: '6px solid rgba(255,255,255,0.1)'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    statsRow: { display: 'flex', gap: '8px' },
    circle: { width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    title: { margin: 0, fontSize: '1.1rem', fontWeight: '800' },
    subtitle: { fontSize: '0.6rem', opacity: 0.8 },
    progressContainer: { marginBottom: '20px' },
    progressBar: { width: '100%', height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px' },
    progressFill: { width: '75%', height: '100%', background: '#fff', borderRadius: '10px' },
    sectionsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    sectionCard: { borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' },
    sectionHeader: { padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
    plusIcon: { background: '#fff', color: '#739673', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' },
    fieldsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.05)' },
    input: { width: '100%', padding: '8px', borderRadius: '10px', border: 'none', fontSize: '0.8rem' },
    footerControls: { marginTop: '20px' },
    analyzeBtn: { width: '100%', padding: '12px', borderRadius: '15px', border: 'none', background: '#fff', color: '#739673', fontWeight: 'bold', cursor: 'pointer' },
    actionButtons: { display: 'flex', gap: '10px', justifyContent: 'center', margin: '15px 0' },
    roundBtn: { width: '45px', height: '45px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff' },
    historyBox: { maxHeight: '150px', overflowY: 'auto', marginTop: '10px' },
    historyItem: { background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px', marginBottom: '8px' },
    smallActionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    chatSheet: { background: '#fff', width: '92%', height: '80%', borderRadius: '30px', color: '#333', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.4)', animation: 'slideUp 0.3s ease' },
    chatHeader: { padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', color: '#739673' },
    closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', color: '#999' },
    chatBody: { flex: 1, padding: '20px', overflowY: 'auto', fontSize: '0.9rem', textAlign: 'right' },
    chatFooter: { padding: '15px', borderTop: '1px solid #eee' },
    chatInputWrapper: { display: 'flex', gap: '8px', marginBottom: '10px' },
    chatInput: { flex: 1, padding: '12px', borderRadius: '18px', border: '1px solid #ddd', fontSize: '0.85rem', outline: 'none' },
    sendBtn: { background: '#739673', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff' },
    doneBtn: { background: '#739673', color: '#fff', border: 'none', padding: '10px', borderRadius: '18px', fontSize: '0.9rem', width: '100%', fontWeight: 'bold' },
    loader: { border: '3px solid #f3f3f3', borderTop: '3px solid #739673', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '10px auto' }
};

export default LactationHub;
