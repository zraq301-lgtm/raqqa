import React, { useState, useRef, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';

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
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lactation_history')) || [];
    } catch { return []; }
  });

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const sections = [
    { title: "الرضاعة الطبيعية", emoji: "🤱", fields: ["الوقت", "الجهة", "المدة", "راحة الأم", "معدل الرضاعة", "تاريخ اليوم", "بداية الرضعة", "نهاية الرضعة", "ملاحظات", "مستوى الشبع"] },
    { title: "الرضاعة الصناعية", emoji: "🍼", fields: ["الكمية مل", "نوع الحليب", "درجة الحرارة", "وقت التحضير", "مدة الرضعة", "نظافة الرضاعة", "تاريخ الانتهاء", "الماء المستخدم", "ملاحظات", "رد فعل الرضيع"] },
    { title: "صحة الثدي", emoji: "🧊", fields: ["تحجر", "تشققات", "تنظيف", "استخدام كريمات", "كمادات", "ألم", "احمرار", "حرارة", "ملاحظات", "فحص دوري"] },
    { title: "تغذية المرضع", emoji: "🌿", fields: ["سوائل", "مدرات حليب", "حلبة", "يانسون", "وجبة الغذاء", "فيتامينات", "شمر", "تجنب منبهات", "ماء", "ملاحظات"] },
    { title: "حالة الرضيع", emoji: "🧷", fields: ["الحفاضات", "لون البول", "جودة النوم", "الوزن", "الطول", "الغازات", "المغص", "الوعي", "الهدوء", "ملاحظات"] },
    { title: "الشفط والتخزين", emoji: "펌", fields: ["كمية الشفط", "تاريخ التخزين", "ساعة الشفط", "جهة الثدي", "صلاحية العبوة", "درجة البرودة", "تاريخ الاستخدام", "نوع العبوة", "طريقة الإذابة", "ملاحظات"] },
    { title: "الحالة النفسية", emoji: "🫂", fields: ["دعم الزوج", "ساعات الراحة", "القلق", "الاكتئاب", "التواصل", "الخروج للمشي", "هوايات", "الاسترخاء", "ملاحظات", "درجة الرضا"] }
  ];

  const handleSaveAndAnalyze = async () => {
    setLoading(true);
    setShowChat(true);
    setAiResponse("جاري تحليل بياناتك بعناية من قبل طبيبة رقة المختصة...");

    try {
      // 1. الحفظ في نيون (Notifications)
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          category: 'تحليل شامل (حمل وولادة ورضاعة)',
          value: 'بيانات جديدة',
          user_id: 1,
          note: JSON.stringify(data)
        }
      });

      // 2. تحليل AI رقة
      const promptText = `أنا طبيبة نساء وتوليد مختصة. إليكِ بيانات مريضتي: ${JSON.stringify(data)}. 
      قومي بتحليل الحالة طبياً ونفسياً بشكل موسع، وقدمي نصائح للأم وللجنين/الرضيع بأسلوب رقيق ودافيء كما اعتدنا منكِ.`;

      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      });

      const result = response.data.reply || response.data.message || "حدث خطأ في استلام الرد.";
      setAiResponse(result);

      // 3. تحديث السجل
      const newEntry = { id: Date.now(), text: result, date: new Date().toLocaleString() };
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('lactation_history', JSON.stringify(updatedHistory));

    } catch (error) {
      setAiResponse("عذراً رفيقتي، حدث خطأ في الاتصال. تأكدي من الإنترنت وحاولي مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  const deleteResponse = (id) => {
    const filtered = history.filter(item => item.id !== id);
    setHistory(filtered);
    localStorage.setItem('lactation_history', JSON.stringify(filtered));
  };

  // --- عناصر الواجهة الفرعية ---
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
      {/* الرأس */}
      <div style={styles.header}>
        <div style={styles.statsRow}>
          <div style={styles.circle}>28</div>
          <div style={{...styles.circle, background: '#4e6d4e'}}>20</div>
          <div style={styles.circle}><Icon size={18} /></div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={styles.title}>سجل الإرضاع الذكي</h2>
          <div style={styles.subtitle}>Maternity & Health AI Tracker</div>
        </div>
      </div>

      {/* شريط التقدم */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}><div style={styles.progressFill}></div></div>
      </div>

      {/* الأقسام */}
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

      {/* التحكم والذكاء الاصطناعي */}
      <div style={styles.footerControls}>
        <button onClick={handleSaveAndAnalyze} style={styles.analyzeBtn}>
          {loading ? 'جاري التحليل...' : 'طبيبة رقة: تحليل البيانات'}
        </button>

        <div style={styles.actionButtons}>
          <button onClick={() => fileInputRef.current.click()} style={styles.roundBtn}>📄</button>
          <button onClick={() => cameraInputRef.current.click()} style={styles.roundBtn}>📷</button>
          <button style={styles.roundBtn}>🎤</button>
          <input type="file" ref={fileInputRef} hidden accept="image/*,application/pdf" />
          <input type="file" ref={cameraInputRef} hidden accept="image/*" capture="environment" />
        </div>

        {/* السجل التاريخي */}
        <div style={styles.historyBox}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>استشاراتك السابقة</h4>
          {history.map(item => (
            <div key={item.id} style={styles.historyItem}>
              <small style={{ opacity: 0.6 }}>{item.date}</small>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>{item.text.substring(0, 60)}...</div>
              <button onClick={() => deleteResponse(item.id)} style={styles.delBtn}>🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {/* شاشة الشات المنسدلة (Overlay) */}
      {showChat && (
        <div style={styles.overlay}>
          <div style={styles.chatSheet}>
            <div style={styles.chatHeader}>
              <span style={{ fontWeight: '800' }}>👨‍⚕️ تقرير الطبيبة الذكية</span>
              <button onClick={() => setShowChat(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.chatBody}>
              {loading ? (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <div style={styles.loader}></div>
                  <p>أقوم بمراجعة بياناتك بدقة...</p>
                </div>
              ) : (
                <div style={{ whiteSpace: 'pre-line' }}>{aiResponse}</div>
              )}
            </div>
            <div style={styles.chatFooter}>
              <button onClick={() => setShowChat(false)} style={styles.doneBtn}>فهمت، شكراً لكِ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- الأنماط لضمان عدم ظهور شاشة بيضاء ---
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
  title: { margin: 0, fontSize: '1.2rem', fontWeight: '800' },
  subtitle: { fontSize: '0.65rem', opacity: 0.8 },
  progressContainer: { marginBottom: '25px' },
  progressBar: { width: '100%', height: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px' },
  progressFill: { width: '70%', height: '100%', background: '#fff', borderRadius: '10px', boxShadow: '0 0 10px #fff' },
  sectionsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sectionCard: { borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', transition: '0.3s' },
  sectionHeader: { padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  plusIcon: { background: '#fff', color: '#739673', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' },
  fieldsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '15px', background: 'rgba(0,0,0,0.05)' },
  input: { width: '100%', padding: '10px', borderRadius: '12px', border: 'none', background: '#fff', color: '#333', fontSize: '0.85rem' },
  footerControls: { marginTop: '25px', textAlign: 'center' },
  analyzeBtn: { width: '100%', padding: '14px', borderRadius: '20px', border: 'none', background: '#fff', color: '#739673', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' },
  actionButtons: { display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' },
  roundBtn: { width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '1.3rem', cursor: 'pointer' },
  historyBox: { maxHeight: '120px', overflowY: 'auto', textAlign: 'right', padding: '10px' },
  historyItem: { background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '15px', marginBottom: '8px', position: 'relative' },
  delBtn: { position: 'absolute', left: '10px', top: '10px', background: 'none', border: 'none', color: '#ff8a80', cursor: 'pointer' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  chatSheet: { background: '#fff', width: '100%', height: '75%', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', color: '#333', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', color: '#739673' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', color: '#999', cursor: 'pointer' },
  chatBody: { flex: 1, padding: '20px', overflowY: 'auto', fontSize: '0.9rem', lineHeight: '1.6', textAlign: 'right' },
  chatFooter: { padding: '15px', borderTop: '1px solid #eee', textAlign: 'center' },
  doneBtn: { background: '#739673', color: '#fff', border: 'none', padding: '10px 40px', borderRadius: '20px', fontWeight: 'bold' },
  loader: { border: '4px solid #f3f3f3', borderTop: '4px solid #739673', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }
};

export default LactationHub;
