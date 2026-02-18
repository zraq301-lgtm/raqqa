import React, { useState, useRef, useEffect } from 'react';
import { iconMap } from '../../constants/iconMap';
import { CapacitorHttp } from '@capacitor/core';

const LactationHub = () => {
  const Icon = iconMap.feelings;
  const [openIdx, setOpenIdx] = useState(null);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('lady_lactation')) || {});
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('lactation_history')) || []);
  
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

  const getInputType = (fieldName) => {
    if (fieldName.includes("تاريخ") || fieldName === "تاريخ اليوم") return "date";
    if (fieldName.includes("الوقت") || fieldName.includes("ساعة") || fieldName.includes("بداية") || fieldName.includes("نهاية")) return "time";
    return "text";
  };

  const handleSaveAndAnalyze = async () => {
    setLoading(true);
    setShowChat(true);
    setAiResponse("جاري تحليل بياناتك بعناية، انتظري قليلاً يا رفيقتي...");

    try {
      // 1. إرسال الإشعارات والحفظ في DB نيون
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          category: 'Lactation & Pregnancy Analysis',
          value: 'New Entry Submited',
          note: JSON.stringify(data),
          user_id: 1 // يمكن تغييره حسب المستخدم الفعلي
        }
      });

      // 2. تحليل البيانات عبر رقة AI (طبيبة متخصصة)
      const promptText = `أنا أنثى مسلمة، إليكِ بياناتي الصحية الحالية المتعلقة بالرضاعة، الحمل، والولادة: ${JSON.stringify(data)}. 
      بصفتك طبيبة نساء وتوليد متخصصة، حللي هذه البيانات بشكل موسع ودقيق. 
      قدمي نصائح طبية، تربوية، ونفسية رقيقة. اهتمي بتفاصيل صحة الثدي، تغذية الرضيع، والحالة النفسية.`;

      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      };

      const response = await CapacitorHttp.post(aiOptions);
      const responseText = response.data.reply || "عذراً، لم أستطع إتمام التحليل الآن.";

      setAiResponse(responseText);

      // 3. حفظ في التاريخ المحلي
      const newEntry = { id: Date.now(), text: responseText, date: new Date().toLocaleString() };
      const newHistory = [newEntry, ...history];
      setHistory(newHistory);
      localStorage.setItem('lactation_history', JSON.stringify(newHistory));

    } catch (err) {
      console.error("Connection Error:", err);
      setAiResponse("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت.");
    } finally {
      setLoading(false);
    }
  };

  const deleteResponse = (id) => {
    const filtered = history.filter(item => item.id !== id);
    setHistory(filtered);
    localStorage.setItem('lactation_history', JSON.stringify(filtered));
  };

  return (
    <div style={containerStyle}>
      {/* الجزء العلوي */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
         <div style={{ display: 'flex', gap: '10px' }}>
            <div style={statCircleStyle}>28</div>
            <div style={{...statCircleStyle, background: '#4e6d4e'}}>20</div>
            <div style={statCircleStyle}><Icon size={18} /></div>
         </div>
         <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>سجل الإرضاع الذكي</h2>
            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Lactation & Maternity Tracker</div>
         </div>
      </div>

      {/* مؤشر الحالة */}
      <div style={{ marginBottom: '30px' }}>
        <div style={progressBgStyle}>
          <div style={progressFillStyle}></div>
        </div>
      </div>

      {/* القوائم المنسدلة */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {sections.map((sec, i) => (
          <div key={i} style={{ 
            background: openIdx === i ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)', 
            borderRadius: '25px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' 
          }}>
            <div style={sectionHeaderStyle} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{sec.emoji} {sec.title}</span>
              <span style={toggleIconStyle}>{openIdx === i ? '✕' : '＋'}</span>
            </div>
            
            {openIdx === i && (
              <div style={gridStyle}>
                {sec.fields.map(f => (
                  <div key={f}>
                    <label style={labelStyle}>{f}</label>
                    <input 
                      type={getInputType(f)}
                      style={inputStyle} 
                      value={data[f] || ''} 
                      onChange={e => {
                        const newData = {...data, [f]: e.target.value};
                        setData(newData);
                        localStorage.setItem('lady_lactation', JSON.stringify(newData));
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* منطقة الأزرار */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button onClick={handleSaveAndAnalyze} style={analyzeBtnStyle}>
          {loading ? '...جاري التحليل' : 'تحليل الحالة (طبيبة رقة)'}
        </button>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', margin: '25px 0' }}>
          <button onClick={() => fileInputRef.current.click()} style={roundBtnStyle} title="رفع صورة أشعة">📄</button>
          <button onClick={() => cameraInputRef.current.click()} style={roundBtnStyle} title="فتح الكاميرا">📷</button>
          <button onClick={() => alert("جاري تفعيل الميكروفون...")} style={roundBtnStyle} title="تسجيل صوتي">🎤</button>
          
          <input type="file" ref={fileInputRef} hidden accept="image/*,application/pdf" />
          <input type="file" ref={cameraInputRef} hidden accept="image/*" capture="environment" />
        </div>

        {/* قائمة حفظ الردود السابقة */}
        <h3 style={{ fontSize: '1rem', marginBottom: '15px' }}>الأرشيف الطبي 📚</h3>
        <div style={historyContainerStyle}>
          {history.length === 0 && <small>لا توجد سجلات سابقة</small>}
          {history.map(item => (
            <div key={item.id} style={historyItemStyle}>
              <small style={{ opacity: 0.7, fontSize: '0.7rem' }}>{item.date}</small>
              <div style={{ fontSize: '0.85rem', marginTop: '5px' }}>{item.text.substring(0, 100)}...</div>
              <button onClick={() => deleteResponse(item.id)} style={deleteBtnStyle}>🗑️</button>
            </div>
          ))}
        </div>
      </div>

      {/* شاشة الشات المنبثقة Overlay */}
      {showChat && (
        <div style={chatOverlayStyle}>
          <div style={chatContentStyle}>
            <div style={chatHeaderStyle}>
              <span>👨‍⚕️ استشارة الطبيبة المتخصصة</span>
              <button onClick={() => setShowChat(false)} style={closeChatBtn}>✕</button>
            </div>
            <div style={chatBodyStyle}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>⏳ جاري الفحص والتحليل...</div>
              ) : (
                <div style={{ whiteSpace: 'pre-line' }}>{aiResponse}</div>
              )}
            </div>
            <div style={chatFooterStyle}>
               <button onClick={() => setShowChat(false)} style={confirmBtnStyle}>شكراً رقة، فهمت</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles ---
const containerStyle = {
  background: 'linear-gradient(160deg, #96b896 0%, #739673 100%)', 
  backdropFilter: 'blur(20px)', borderRadius: '40px', padding: '30px', 
  border: '8px solid rgba(255,255,255,0.1)', color: '#fff', direction: 'rtl',
  boxShadow: '0 20px 50px rgba(0,0,0,0.2)', position: 'relative', minHeight: '600px'
};

const chatOverlayStyle = {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex',
  alignItems: 'flex-end', borderRadius: '40px', overflow: 'hidden'
};

const chatContentStyle = {
  background: '#fff', width: '100%', height: '80%', borderTopLeftRadius: '30px',
  borderTopRightRadius: '30px', display: 'flex', flexDirection: 'column', color: '#333'
};

const chatHeaderStyle = {
  padding: '20px', borderBottom: '1px solid #eee', display: 'flex', 
  justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: '#739673'
};

const chatBodyStyle = { padding: '20px', overflowY: 'auto', flex: 1, lineHeight: '1.6', fontSize: '0.95rem' };

const chatFooterStyle = { padding: '15px', textAlign: 'center' };

const confirmBtnStyle = { 
  background: '#739673', color: '#fff', border: 'none', padding: '10px 30px', 
  borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' 
};

const closeChatBtn = { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' };

const statCircleStyle = {
  width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold'
};

const progressBgStyle = { width: '100%', height: '14px', background: 'rgba(0,0,0,0.1)', borderRadius: '20px', padding: '2px' };
const progressFillStyle = { width: '75%', height: '100%', background: 'linear-gradient(90deg, #c5e1a5, #fff)', borderRadius: '20px', boxShadow: '0 0 15px rgba(255,255,255,0.4)' };

const sectionHeaderStyle = { padding: '18px 25px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const toggleIconStyle = { background: '#fff', color: '#739673', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' };

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '20px', background: 'rgba(0,0,0,0.05)' };
const labelStyle = { fontSize: '0.75rem', display: 'block', marginBottom: '6px', paddingRight: '10px' };
const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '20px', border: 'none', background: '#fff', color: '#333', fontSize: '0.9rem', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' };

const analyzeBtnStyle = { width: '100%', padding: '15px', borderRadius: '25px', border: 'none', background: '#fff', color: '#739673', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' };
const roundBtnStyle = { width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)', fontSize: '1.2rem', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', transition: '0.3s' };

const historyContainerStyle = { maxHeight: '150px', overflowY: 'auto', paddingLeft: '5px' };
const historyItemStyle = { background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '20px', marginBottom: '10px', position: 'relative', textAlign: 'right' };
const deleteBtnStyle = { position: 'absolute', top: '10px', left: '10px', border: 'none', background: 'none', color: '#ff8a80', cursor: 'pointer', fontSize: '1rem' };

export default LactationHub;
