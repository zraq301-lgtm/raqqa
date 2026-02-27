[cite_start]import React, { useState, useRef, useEffect } from 'react'; [cite: 1]
[cite_start]import { iconMap } from '../../constants/iconMap'; [cite: 1]
[cite_start]import { CapacitorHttp } from '@capacitor/core'; [cite: 2]

const LactationHub = () => {
  [cite_start]const Icon = iconMap.feelings; [cite: 2]
  [cite_start]const [openIdx, setOpenIdx] = useState(null); [cite: 3]
  const [data, setData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lady_lactation')) || {};
    } catch { return {}; }
  [cite_start]}); [cite: 3]
  [cite_start]const [loading, setLoading] = useState(false); [cite: 4]
  [cite_start]const [showChat, setShowChat] = useState(false); [cite: 4]
  [cite_start]const [aiResponse, setAiResponse] = useState(''); [cite: 4]
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lactation_history')) || [];
    } catch { return []; }
  [cite_start]}); [cite: 5]
  [cite_start]const fileInputRef = useRef(null); [cite: 6]
  [cite_start]const cameraInputRef = useRef(null); [cite: 6]

  // --- دالة معالجة الوسائط المضافة ---
  const handleMediaAction = async (type) => {
    try {
        [cite_start]setLoading(true); [cite: 6]
        [cite_start]const base64Data = type === 'camera' ? await takePhoto() : await fetchImage(); [cite: 7]
        if (!base64Data) { setLoading(false); return; [cite_start]} [cite: 8]

        const timestamp = Date.now();
        const fileName = `img_${timestamp}.png`;
        [cite_start]const mimeType = 'image/png'; [cite: 8]
        [cite_start]const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, mimeType); [cite: 9]
        [cite_start]console.log("تم الرفع بنجاح، الرابط:", finalAttachmentUrl); [cite: 9]
        
        [cite_start]await handleSaveAndAnalyze(finalAttachmentUrl); [cite: 10]
        return finalAttachmentUrl;
    } catch (error) {
        [cite_start]console.error("فشل في معالجة أو رفع الصورة:", error); [cite: 11]
        [cite_start]alert("حدث خطأ أثناء الوصول للكاميرا أو رفع الصورة."); [cite: 12]
    } finally {
        [cite_start]setLoading(false); [cite: 13]
    }
  };

  const sections = [
    { title: "الرضاعة الطبيعية", emoji: "🤱", fields: ["الوقت", "الجهة", "المدة", "راحة الأم", "معدل الرضاعة", "تاريخ اليوم", "بداية الرضعة", "نهاية الرضعة", "ملاحظات", "مستوى الشبع"] },
    { title: "الرضاعة الصناعية", emoji: "🍼", fields: ["الكمية مل", "نوع الحليب", "درجة الحرارة", "وقت التحضير", "مدة الرضعة", "نظافة الرضاعة", "تاريخ الانتهاء", "الماء المستخدم", "ملاحظات", "رد فعل الرضيع"] },
    { title: "صحة الثدي", emoji: "🧊", fields: ["تحجر", "تشققات", "تنظيف", "استخدام كريمات", "كمادات", "ألم", "احمرار", "حرارة", "ملاحظات", "فحص دوري"] },
    [cite_start]{ title: "تغذية المرضع", emoji: "🌿", fields: ["سوائل", "مدرات حليب", "حلبة", "يانسون", "وجبة الغذاء", "فيتامينات", "شمر", "تجنب منبهات", "ماء", "ملاحظات"] }, [cite: 13, 14]
    { title: "حالة الرضيع", emoji: "🧷", fields: ["الحفاضات", "لون البول", "جودة النوم", "الوزن", "الطول", "الغازات", "المغص", "الوعي", "الهدوء", "ملاحظات"] },
    { title: "الشفط والتخزين", emoji: "펌", fields: ["كمية الشفط", "تاريخ التخزين", "ساعة الشفط", "جهة الثدي", "صلاحية العبوة", "درجة البرودة", "تاريخ الاستخدام", "نوع العبوة", "طريقة الإذابة", "ملاحظات"] },
    { title: "الحالة النفسية", emoji: "🫂", fields: ["دعم الزوج", "ساعات الراحة", "القلق", "الاكتئاب", "التواصل", "الخروج للمشي", "هوايات", "الاسترخاء", "ملاحظات", "درجة الرضا"] }
  ];

  const handleSaveAndAnalyze = async (imageUrl = null) => {
    [cite_start]setLoading(true); [cite: 15]
    [cite_start]setShowChat(true); [cite: 15]
    [cite_start]setAiResponse("جاري تحليل بيانات الرضاعة والصحة بعناية..."); [cite: 15]
    try {
      // 1. الحفظ في نيون
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          category: 'تحليل الرضاعة وصحة المرضع',
          value: 'بيانات رضاعة جديدة',
          user_id: 1,
          [cite_start]note: JSON.stringify({ ...data, attachment: imageUrl }) [cite: 16, 17]
        }
      });

      // 2. تحليل AI رقة (بتخصص الرضاعة والطفل)
      [cite_start]const promptText = `أنتِ طبيبة استشارية متخصصة في الرضاعة الطبيعية وصحة الأم والطفل. [cite: 18]
بناءً على هذه البيانات المدخلة في سجل الرضاعة: ${JSON.stringify(data)} ${imageUrl ? [cite_start]`وهذه الصورة المرفقة (مثلاً لصورة الثدي أو حالة الطفل): ${imageUrl}` : ''}. [cite: 19]
[cite_start]قدمي تحليلاً طبياً دقيقاً، مع نصائح عملية لزيادة إدرار الحليب، التعامل مع مشاكل الثدي، والعناية بالرضيع، بأسلوب رقيق، داعم، ودافيء يطمئن الأم.`; [cite: 20]

      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        [cite_start]data: { prompt: promptText } [cite: 21]
      });

      const result = response.data.reply || response.data.message || [cite_start]"حدث خطأ في استلام الرد."; [cite: 22]
      [cite_start]setAiResponse(result); [cite: 22]

      // 3. تحديث السجل
      [cite_start]const newEntry = { id: Date.now(), text: result, date: new Date().toLocaleString() }; [cite: 23]
      [cite_start]const updatedHistory = [newEntry, ...history]; [cite: 24]
      [cite_start]setHistory(updatedHistory); [cite: 24]
      [cite_start]localStorage.setItem('lactation_history', JSON.stringify(updatedHistory)); [cite: 24]

    } catch (error) {
      [cite_start]setAiResponse("عذراً رفيقتي، حدث خطأ في الاتصال. تأكدي من الإنترنت وحاولي مجدداً."); [cite: 24]
    } finally {
      [cite_start]setLoading(false); [cite: 25]
    }
  };

  const deleteResponse = (id) => {
    [cite_start]const filtered = history.filter(item => item.id !== id); [cite: 26]
    [cite_start]setHistory(filtered); [cite: 26]
    [cite_start]localStorage.setItem('lactation_history', JSON.stringify(filtered)); [cite: 26]
  };

  const renderInput = (f) => (
    <div key={f} style={{ marginBottom: '10px' }}>
      <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px', color: '#eee' }}>{f}</label>
      <input 
        type={f.includes("تاريخ") ? "date" : f.includes("الوقت") || f.includes("ساعة") ? "time" : "text"}
        style={styles.input} 
        value={data[f] || ''} 
        onChange={e => {
          [cite_start]const newData = {...data, [f]: e.target.value}; [cite: 27, 28]
          [cite_start]setData(newData); [cite: 28]
          [cite_start]localStorage.setItem('lady_lactation', JSON.stringify(newData)); [cite: 28]
        }}
      />
    </div>
  );

  return (
    <div style={styles.mainContainer}>
      <div style={styles.header}>
        <div style={styles.statsRow}>
          <button onClick={() => setShowChat(true)} style={{...styles.circle, border:'none', cursor:'pointer', background:'#fff', color:'#739673'}}>💬</button>
          <div style={styles.circle}>28</div>
          <div style={styles.circle}><Icon size={18} /></div>
        </div>
        <div style={{ textAlign: 'center' }}>
          [cite_start]<h2 style={styles.title}>سجل الرضاعة الذكي</h2> [cite: 29, 30]
          [cite_start]<div style={styles.subtitle}>Lactation & Baby Care AI</div> [cite: 30]
        </div>
      </div>

      <div style={styles.progressContainer}>
        <div style={styles.progressBar}><div style={styles.progressFill}></div></div>
      </div>

      <div style={styles.sectionsList}>
        {sections.map((sec, i) => (
          <div key={i} style={{...styles.sectionCard, background: openIdx === i ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)'}}>
            [cite_start]<div style={styles.sectionHeader} onClick={() => setOpenIdx(openIdx === i ? null : i)}> [cite: 30, 31, 32]
              <span style={{ fontWeight: 'bold' }}>{sec.emoji} {sec.title}</span>
              <span style={styles.plusIcon}>{openIdx === i ? [cite_start]'✕' : '＋'}</span> [cite: 32, 33]
            </div>
            {openIdx === i && (
              <div style={styles.fieldsGrid}>{sec.fields.map(f => renderInput(f))}</div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.footerControls}>
        [cite_start]<button onClick={() => handleSaveAndAnalyze()} style={styles.analyzeBtn}> [cite: 33, 34]
          {loading ? [cite_start]'جاري التحليل...' : 'تحليل الرضاعة والصحة'} [cite: 35]
        </button>

        <div style={styles.actionButtons}>
          [cite_start]<button onClick={() => handleMediaAction('gallery')} style={styles.roundBtn}>📄</button> [cite: 35]
          [cite_start]<button onClick={() => handleMediaAction('camera')} style={styles.roundBtn}>📷</button> [cite: 35]
          [cite_start]<button style={styles.roundBtn}>🎤</button> [cite: 35]
        </div>

        <div style={styles.historyBox}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>استشاراتك السابقة</h4>
          [cite_start]{history.map(item => ( [cite: 35, 36]
            <div key={item.id} style={styles.historyItem}>
              <small style={{ opacity: 0.6 }}>{item.date}</small>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>{item.text.substring(0, 60)}...</div>
              <div style={{display:'flex', gap:'5px', marginTop:'5px'}}>
                [cite_start]<button onClick={() => deleteResponse(item.id)} style={styles.smallActionBtn}>🗑️</button> [cite: 36, 37]
                [cite_start]<button onClick={() => {setAiResponse(item.text); setShowChat(true);}} style={styles.smallActionBtn}>👁️</button> [cite: 37, 38]
              </div>
            </div>
          ))}
        </div>
      </div>

      {showChat && (
        <div style={styles.overlay}>
          <div style={styles.chatSheet}>
            <div style={styles.chatHeader}>
              [cite_start]<span style={{ fontWeight: '800' }}>🤱 استشارية الرضاعة والطفل</span> [cite: 38, 39]
              [cite_start]<button onClick={() => setShowChat(false)} style={styles.closeBtn}>✕</button> [cite: 39]
            </div>
            <div style={styles.chatBody}>
              {loading ? (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  [cite_start]<div style={styles.loader}></div> [cite: 39, 40]
                  [cite_start]<p>جاري تحليل بياناتك الصحية والرضاعة...</p> [cite: 40]
                </div>
              ) : (
                [cite_start]<div style={{ whiteSpace: 'pre-line' }}>{aiResponse || "أهلاً بكِ رفيقتي، كيف يمكنني مساعدتك في رحلة الرضاعة والعناية بطفلك اليوم؟"}</div> [cite: 40, 41]
              )}
            </div>
            <div style={styles.chatFooter}>
              <div style={{display:'flex', gap:'10px', justifyContent:'center', marginBottom:'10px'}}>
                 [cite_start]<button onClick={() => handleMediaAction('camera')} style={{...styles.doneBtn, background:'#f0f0f0', color:'#333', padding:'8px 20px'}}>📸 تصوير</button> [cite: 41]
                 [cite_start]<button onClick={() => handleMediaAction('gallery')} style={{...styles.doneBtn, background:'#f0f0f0', color:'#333', padding:'8px 20px'}}>📁 رفع صورة</button> [cite: 41, 42]
              </div>
              [cite_start]<button onClick={() => setShowChat(false)} style={styles.doneBtn}>شكراً لكِ</button> [cite: 42]
            </div>
          </div>
        </div>
      )}
    </div>
  );
[cite_start]}; [cite: 43]

const styles = {
  mainContainer: {
    background: 'linear-gradient(160deg, #96b896 0%, #739673 100%)',
    borderRadius: '35px', padding: '25px', color: '#fff', direction: 'rtl',
    fontFamily: 'sans-serif', minHeight: '80vh', position: 'relative', overflow: 'hidden',
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)', border: '6px solid rgba(255,255,255,0.1)'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  statsRow: { display: 'flex', gap: '8px' },
  circle: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' },
  [cite_start]title: { margin: 0, fontSize: '1.2rem', fontWeight: '800' }, [cite: 43, 44]
  subtitle: { fontSize: '0.65rem', opacity: 0.8 },
  progressContainer: { marginBottom: '25px' },
  progressBar: { width: '100%', height: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px' },
  progressFill: { width: '70%', height: '100%', background: '#fff', borderRadius: '10px', boxShadow: '0 0 10px #fff' },
  sectionsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sectionCard: { borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', transition: '0.3s' },
  sectionHeader: { padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  [cite_start]plusIcon: { background: '#fff', color: '#739673', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }, [cite: 44, 45]
  fieldsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '15px', background: 'rgba(0,0,0,0.05)' },
  input: { width: '100%', padding: '10px', borderRadius: '12px', border: 'none', background: '#fff', color: '#333', fontSize: '0.85rem' },
  footerControls: { marginTop: '25px', textAlign: 'center' },
  analyzeBtn: { width: '100%', padding: '14px', borderRadius: '20px', border: 'none', background: '#fff', color: '#739673', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' },
  actionButtons: { display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' },
  [cite_start]roundBtn: { width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '1.3rem', cursor: 'pointer' }, [cite: 45, 46]
  historyBox: { maxHeight: '150px', overflowY: 'auto', textAlign: 'right', padding: '10px' },
  historyItem: { background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '15px', marginBottom: '8px', position: 'relative' },
  smallActionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  chatSheet: { background: '#fff', width: '100%', height: '85%', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', color: '#333', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', color: '#739673' },
  [cite_start]closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', color: '#999', cursor: 'pointer' }, [cite: 47]
  chatBody: { flex: 1, padding: '20px', overflowY: 'auto', fontSize: '0.9rem', lineHeight: '1.6', textAlign: 'right' },
  chatFooter: { padding: '15px', borderTop: '1px solid #eee', textAlign: 'center' },
  doneBtn: { background: '#739673', color: '#fff', border: 'none', padding: '10px 40px', borderRadius: '20px', fontWeight: 'bold', cursor:'pointer' },
  loader: { border: '4px solid #f3f3f3', borderTop: '4px solid #739673', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }
};

[cite_start]export default LactationHub; [cite: 48]
