import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';

// ملاحظة: تأكدي من إضافة رابط FontAwesome في index.html للأيقونات [cite: 2]
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

const App = () => {
  const [selectedIdx, setSelectedIdx] = useState(0); [cite: 2]
  const [checkedItems, setCheckedItems] = useState({}); [cite: 3]
  const [isChatOpen, setIsChatOpen] = useState(false); [cite: 3]
  const [messages, setMessages] = useState([]); [cite: 3]
  const [isLoading, setIsLoading] = useState(false); [cite: 3]
  const [inputText, setInputText] = useState(""); [cite: 4]

  const chatEndRef = useRef(null); [cite: 4]

  const lists = [
    { title: "تعديل السلوك", icon: "fa-child", items: ["التعزيز الإيجابي", "تجاهل السلوكيات المزعجة", "العواقب المنطقية", "وضع حدود واضحة", "لوحة النجوم والمكافآت", "النمذجة والقدوة", "قضاء وقت خاص", "الاستماع الفعال", "بدائل كلمة لا", "توفير بيئة آمنة"] },
    { title: "غرس القناعات", icon: "fa-heart", items: ["قيمة الصدق", "الإيمان بالقدرات", "احترام الاختلاف", "العمل الجماعي", "قيمة الامتنان", "المثابرة", "حب التعلم", "المسؤولية البيئية", "الأمانة", "الرحمة بالضعفاء"] },
    { title: "الذكاء العاطفي", icon: "fa-brain", items: ["تسمية المشاعر", "مهارة التعاطف", "تنفس الهدوء", "الاعتراف بالمشاعر", "حل النزاعات سلمياً", "بناء الثقة بالنفس", "التعامل مع الخوف", "فهم لغة الجسد", "تحمل الإحباط", "تنمية التفاؤل"] },
    { title: "تطوير المعرفة", icon: "fa-book-open", items: ["القراءة اليومية", "ألعاب الألغاز", "تجارب علمية منزلية", "تعلم لغة ثانية", "الرحلات التعليمية", "الحساب الذهني", "النقاشات المفتوحة", "الثقافات العالمية", "تكنولوجيا هادفة", "تشجيع الهوايات"] },
    { title: "الصحة والنشاط", icon: "fa-apple-whole", items: ["نظام غذائي متوازن", "ساعات نوم كافية", "شرب الماء", "ممارسة الرياضة", "النظافة الشخصية", "الفحوصات الدورية", "تقليل السكريات", "وقت في الطبيعة", "المهارات الحركية", "سلامة الجسد"] },
    { title: "مهارات اجتماعية", icon: "fa-users", items: ["إلقاء التحية", "مشاركة الألعاب", "آداب المائدة", "تكوين صداقات", "الاعتذار الصادق", "الاستماع للغير", "طلب الإذن", "التعاون المنزلي", "مهارات القيادة", "التعبير عن الرأي"] },
    { title: "الاستقلال", icon: "fa-star", items: ["ارتداء الملابس", "ترتيب السرير", "تحضير وجبة", "اتخاذ قرارات", "إدارة المصروف", "الالتزام بالجدول", "حل المشكلات", "عناية بالنباتات", "تحمل النتيجة", "إسعافات أولية"] },
    { title: "رعاية الأم", icon: "fa-spa", items: ["تخصيص وقت للراحة", "ممارسة هواية", "طلب المساعدة", "التواصل مع أمهات", "تخطي شعور الذنب", "نوم كافٍ", "قراءة تربوية", "التأمل واليوجا", "تحديد الأولويات", "الاحتفال بالإنجاز"] },
    { title: "الأمان والحماية", icon: "fa-shield-halved", items: ["لمسات الأمان", "حفظ أرقام الطوارئ", "سلامة المنزل", "الأمان الرقمي", "التصرف عند الضياع", "قواعد مع الغرباء", "قواعد المرور", "التواصل المفتوح", "معرفة العنوان", "مواجهة التنمر"] },
    { title: "الإبداع والخيال", icon: "fa-palette", items: ["القصص الخيالية", "اللعب الحر", "الرسم والتلوين", "الأشغال اليدوية", "تمثيل الأدوار", "تأليف قصص", "البناء بالمكعبات", "جمع كنوز الطبيعة", "الاستماع للفنون", "الفوضى الإبداعية"] }
  ]; [cite: 4, 5, 6, 7]

  // وظيفة الحفظ في نيون [cite: 8, 9]
  const saveDataToDB = async (selectedOnes) => {
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1,
          category: lists[selectedIdx].title,
          value: selectedOnes[0] || "إنجاز تربوي",
          note: `تم اختيار ${selectedOnes.length} بند في قسم ${lists[selectedIdx].title}`
        }
      });
    } catch (e) {
      console.error("خطأ في حفظ السجلات:", e); [cite: 11]
    }
  };

  // وظيفة تحليل الذكاء الاصطناعي وفتح الشات [cite: 12, 13]
  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true);
    setIsChatOpen(true); // فتح صفحة الشات تلقائياً عند التحليل [cite: 13]

    const currentList = lists[selectedIdx];
    const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]);
    
    // إرسال البيانات للحفظ في نيون بصمت [cite: 22]
    if (!customPrompt) saveDataToDB(selectedOnes);

    const promptMessage = customPrompt || 
      `بصفتك متخصص تربوي خبير للأطفال، قمت اليوم بمتابعة: (${selectedOnes.join(" - ")}) في قسم ${currentList.title}. قدمي لي نصيحة تربوية متخصصة ومطولة.`; [cite: 14]

    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      });

      if (response.data && response.data.reply) {
        const newMsg = {
          id: Date.now(),
          text: response.data.reply,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, newMsg]); [cite: 17]
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), text: "واجهت رقة صعوبة في الاتصال بالمتخصص حالياً.", sender: 'ai' }]); [cite: 19]
    } finally {
      setIsLoading(false); [cite: 20]
    }
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id)); [cite: 23]
  };

  const handleMedia = (type) => alert(`سيتم تفعيل ${type} للتحليل الذكي قريباً.`); [cite: 24]

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); [cite: 25]
  }, [messages]);

  return (
    <div style={styles.container}>
      {/* زر متخصص التربية في الأعلى  */}
      <div style={styles.topBar}>
        <button style={styles.specialistBtn} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-user-md"></i> شات متخصص التربية
        </button>
      </div>

      <header style={styles.header}>
        <h1>موسوعة رقة للتربية</h1>
        <p>دليل الأم الواعية لبناء أجيال المستقبل</p>
      </header>

      <div style={styles.navScroll}>
        {lists.map((list, i) => (
          <button 
            key={i} 
            style={{...styles.navBtn, ...(selectedIdx === i ? styles.activeNav : {})}}
            onClick={() => setSelectedIdx(i)}>
            <i className={`fas ${list.icon}`}></i>
            <span>{list.title}</span>
          </button>
        ))} [cite: 27, 28]
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>{lists[selectedIdx].title}</h2>
        <div style={styles.grid}>
          {lists[selectedIdx].items.map((item, i) => (
            <label key={i} style={styles.itemRow}>
              <input 
                type="checkbox" 
                checked={!!checkedItems[`${selectedIdx}-${item}`]}
                onChange={() => setCheckedItems({...checkedItems, [`${selectedIdx}-${item}`]: !checkedItems[`${selectedIdx}-${item}`]})}
              /> [cite: 29]
              <span style={checkedItems[`${selectedIdx}-${item}`] ? styles.done : {}}>{item}</span>
            </label>
          ))}
        </div>
        <button style={styles.analyzeBtn} onClick={() => getAIAnalysis()}>
          <i className="fas fa-brain"></i> التحليل والحفظ التربوي
        </button> [cite: 30]
      </div>

      {/* صفحة الشات [cite: 30] */}
      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
              <span><i className="fas fa-comment-medical"></i> المتخصص التربوي</span>
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
            </div> [cite: 31]

            <div style={styles.chatContent}>
              {messages.length === 0 && <p style={styles.emptyMsg}>ابدئي استشارتكِ التربوية الآن...</p>}
              {messages.map(msg => (
                <div key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}>
                  <div style={styles.msgBubble}>
                    <p style={styles.msgText}>{msg.text}</p>
                    <div style={styles.msgFooter}>
                      <small>{msg.timestamp}</small>
                      <button onClick={() => deleteMessage(msg.id)} style={styles.delBtn}>
                        <i className="fas fa-trash-alt"></i> حذف
                      </button>
                    </div> 
                  </div>
                </div>
              ))} [cite: 32]
              {isLoading && <div style={styles.loading}>جاري التحليل التربوي... ✨</div>}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.chatInputArea}>
              {/* أزرار الميديا [cite: 35] */}
              <div style={styles.mediaBar}>
                <button style={styles.mediaIcon} onClick={() => handleMedia('الكاميرا')}><i className="fas fa-camera"></i></button>
                <button style={styles.mediaIcon} onClick={() => handleMedia('الصور')}><i className="fas fa-image"></i></button>
                <button style={styles.mediaIcon} onClick={() => handleMedia('الميكروفون')}><i className="fas fa-microphone"></i></button>
              </div> [cite: 36]
              
              <div style={styles.inputRow}>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اسألي المتخصص هنا..."
                  style={styles.input}
                /> [cite: 37]
                <button 
                  onClick={() => { 
                    if(inputText) { 
                      setMessages([...messages, {id: Date.now(), text: inputText, sender:'user', timestamp: new Date().toLocaleTimeString()}]);
                      getAIAnalysis(inputText); 
                      setInputText(""); 
                    } 
                  }}
                  style={styles.sendBtn}>
                  <i className="fas fa-paper-plane"></i>
                </button> [cite: 38]
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { direction: 'rtl', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf7f9', minHeight: '100vh' },
  topBar: { display: 'flex', justifyContent: 'center', marginBottom: '20px' },
  specialistBtn: { padding: '12px 25px', borderRadius: '25px', border: 'none', background: '#6a5acd', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(106, 90, 205, 0.3)' },
  header: { textAlign: 'center', marginBottom: '30px', color: '#6a5acd' },
  navScroll: { display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '15px' },
  navBtn: { flex: '0 0 auto', padding: '10px 15px', borderRadius: '15px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }, [cite: 40, 41]
  activeNav: { background: '#ff85a2', color: 'white', borderColor: '#ff85a2' },
  card: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'right', marginBottom: '20px' },
  itemRow: { padding: '10px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' },
  done: { textDecoration: 'line-through', color: '#ccc' },
  analyzeBtn: { padding: '15px 30px', borderRadius: '30px', border: 'none', background: '#ff85a2', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }, [cite: 42]
  chatBox: { width: '95%', maxWidth: '500px', height: '85vh', background: 'white', borderRadius: '25px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { padding: '15px 20px', background: '#6a5acd', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' },
  chatContent: { flex: 1, overflowY: 'auto', padding: '15px', background: '#f9f9f9' },
  aiMsgRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' },
  userMsgRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' },
  msgBubble: { maxWidth: '85%', padding: '12px', borderRadius: '15px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }, [cite: 43]
  msgText: { margin: 0, lineHeight: '1.6', fontSize: '0.95rem', color: '#444' },
  msgFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '5px' },
  delBtn: { border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem' },
  loading: { textAlign: 'center', color: '#6a5acd', margin: '10px' },
  emptyMsg: { textAlign: 'center', color: '#999', marginTop: '50px' },
  chatInputArea: { padding: '15px', borderTop: '1px solid #eee', background: 'white' },
  mediaBar: { display: 'flex', gap: '20px', marginBottom: '12px', justifyContent: 'center' }, [cite: 44]
  mediaIcon: { background: 'none', border: 'none', color: '#6a5acd', fontSize: '1.2rem', cursor: 'pointer' },
  inputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' },
  sendBtn: { width: '45px', height: '45px', borderRadius: '50%', border: 'none', background: '#6a5acd', color: 'white', cursor: 'pointer' }
};

export default App; [cite: 45]
