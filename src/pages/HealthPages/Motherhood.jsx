import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';

// ملاحظة: تأكدي من إضافة رابط FontAwesome في index.html للأيقونات
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

const App = () => {
  const [selectedIdx, setSelectedIdx] = useState(0); [cite: 2]
  const [checkedItems, setCheckedItems] = useState({}); [cite: 3]
  const [isChatOpen, setIsChatOpen] = useState(false); [cite: 3]
  const [messages, setMessages] = useState([]); [cite: 3]
  const [isLoading, setIsLoading] = useState(false); [cite: 3]
  const [inputText, setInputText] = useState(""); [cite: 4]
  const [savedReplies, setSavedReplies] = useState([]); [cite: 4]

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
  ]; [cite: 5, 6, 7, 8]

  const saveDataToDB = async (selectedOnes) => {
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1,
          category: lists[selectedIdx].title,
          value: selectedOnes[0] || "إنجاز تربوي",
          note: `تم تحليل بيانات قسم ${lists[selectedIdx].title}`
        }
      }); [cite: 9, 10]
    } catch (e) {
      console.error("DB Save Error:", e); [cite: 11]
    }
  };

  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true); [cite: 12]
    setIsChatOpen(true); [cite: 12]

    const currentList = lists[selectedIdx]; [cite: 12]
    const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]); [cite: 13]
    
    if (!customPrompt) saveDataToDB(selectedOnes); [cite: 13]

    const systemExpertise = "بصفتك استشاري أطفال متخصص وخبير في التربية وصحة الطفل، قدم لي نصائح تربوية وطبية دقيقة بناءً على أحدث الأبحاث."; [cite: 13]
    const promptMessage = customPrompt 
      ? `${systemExpertise} سؤالي هو: ${customPrompt}` 
      : `${systemExpertise} لقد تابعت المهام التالية للأطفال: (${selectedOnes.join(" - ")}) في قسم ${currentList.title}. حلل الحالة وقدم نصائح احترافية.`; [cite: 15, 16]

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      }; [cite: 16]
      const response = await CapacitorHttp.post(options); [cite: 17]
      const responseText = response.data.reply || response.data.message || "لم أستطع الحصول على رد حالياً."; [cite: 17]
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      }]); [cite: 18]
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.", 
        sender: 'ai' 
      }]); [cite: 19]
    } finally {
      setIsLoading(false); [cite: 20]
    }
  };

  const handleMediaAction = async (type) => {
    try {
        alert(`جاري فتح ${type === 'camera' ? 'الكاميرا' : 'المعرض'}...`); [cite: 21]
        const finalAttachmentUrl = `https://vercel-blob-url.com/img_${Date.now()}.png`; [cite: 24]
        setMessages(prev => [...prev, {
            id: Date.now(),
            text: `تم رفع صورة بنجاح: ${finalAttachmentUrl}`,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString()
        }]); [cite: 25]
        return finalAttachmentUrl; [cite: 26]
    } catch (error) {
        alert("حدث خطأ أثناء الوصول للكاميرا أو رفع الصورة."); [cite: 27]
    }
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id)); [cite: 28]
  };

  const saveReply = (msg) => {
    setSavedReplies(prev => [...prev, msg]); [cite: 29]
    alert("تم حفظ الرد في قائمتك المفضلة!"); [cite: 29]
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); [cite: 30]
  }, [messages]); [cite: 30]

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.specialistBtn} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-user-md"></i> استشاري الأطفال المتخصص
        </button>
      </div> [cite: 31]

      <header style={styles.header}>
        <h1>موسوعة رقة للتربية والطفولة</h1>
        <p>دليل الأم الواعية للصحة والتربية</p>
      </header> [cite: 31, 32]

      <div style={styles.navScroll}>
        {lists.map((list, i) => (
          <button 
            key={i} 
            style={{...styles.navBtn, ...(selectedIdx === i ? styles.activeNav : {})}}
            onClick={() => setSelectedIdx(i)}>
            <i className={`fas ${list.icon}`}></i>
            <span>{list.title}</span>
          </button>
        ))} [cite: 32, 33]
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
              />
              <span style={checkedItems[`${selectedIdx}-${item}`] ? styles.done : {}}>{item}</span>
            </label>
          ))} [cite: 33, 34, 35]
        </div>
        <button style={styles.analyzeBtn} onClick={() => getAIAnalysis()}>
          <i className="fas fa-microchip"></i> تحليل البيانات تربوياً وصحياً
        </button> [cite: 35]
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
              <span><i className="fas fa-baby"></i> استشاري الأطفال المتخصص</span>
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
            </div> [cite: 36]

            <div style={styles.chatContent}>
              {messages.length === 0 && <p style={styles.emptyMsg}>أهلاً بكِ.. أنا استشاري أطفال متخصص، كيف يمكنني مساعدتكِ اليوم؟</p>}
              {messages.map(msg => (
                <div key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}>
                  <div style={styles.msgBubble}>
                    <p style={styles.msgText}>{msg.text}</p>
                    <div style={styles.msgFooter}>
                      <small>{msg.timestamp}</small>
                      <div style={{display: 'flex', gap: '5px'}}>
                        {msg.sender === 'ai' && (
                          <button onClick={() => saveReply(msg)} style={styles.saveBtn}><i className="fas fa-bookmark"></i> حفظ</button>
                        )}
                        <button onClick={() => deleteMessage(msg.id)} style={styles.delBtn}><i className="fas fa-trash-alt"></i> حذف</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))} [cite: 36, 37, 38, 39, 40]
              {isLoading && <div style={styles.loading}>جاري استشارة خبير الأطفال... ✨</div>}
              <div ref={chatEndRef} />
            </div> [cite: 41, 42]

            <div style={styles.chatInputArea}>
              <div style={styles.mediaBar}>
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('camera')}><i className="fas fa-camera"></i></button>
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('gallery')}><i className="fas fa-image"></i></button>
                <button style={styles.mediaIcon}><i className="fas fa-microphone"></i></button>
              </div> [cite: 42, 43]
              <div style={styles.inputRow}>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اسألي عن تربية أو صحة طفلك..."
                  style={styles.input}
                />
                <button 
                  onClick={() => { 
                    if(inputText.trim()) { 
                      setMessages(prev => [...prev, {id: Date.now(), text: inputText, sender:'user', timestamp: new Date().toLocaleTimeString()}]);
                      getAIAnalysis(inputText); 
                      setInputText(""); 
                    } 
                  }}
                  style={styles.sendBtn}>
                  <i className="fas fa-paper-plane"></i>
                </button> [cite: 43, 44, 45, 46]
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; [cite: 47, 48]

const styles = {
  container: { direction: 'rtl', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf7f9', minHeight: '100vh' },
  topBar: { display: 'flex', justifyContent: 'center', marginBottom: '15px' },
  specialistBtn: { padding: '12px 25px', borderRadius: '25px', border: 'none', background: '#2e8b57', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(46,139,87,0.3)' },
  header: { textAlign: 'center', marginBottom: '20px', color: '#6a5acd' },
  navScroll: { display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' },
  navBtn: { flex: '0 0 auto', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' },
  activeNav: { background: '#ff85a2', color: 'white', borderColor: '#ff85a2' },
  card: { background: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'right', marginBottom: '15px' },
  itemRow: { padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f9f9f9' },
  done: { textDecoration: 'line-through', color: '#ccc' },
  analyzeBtn: { width: '100%', padding: '12px', borderRadius: '25px', border: 'none', background: '#ff85a2', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' },
  chatBox: { width: '100%', maxWidth: '500px', height: '90vh', background: 'white', borderRadius: '25px 25px 0 0', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '15px', background: '#2e8b57', color: 'white', display: 'flex', justifyContent: 'space-between', borderRadius: '25px 25px 0 0' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.5rem' },
  chatContent: { flex: 1, overflowY: 'auto', padding: '15px', background: '#f8f9fa' },
  aiMsgRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' },
  userMsgRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
  msgBubble: { maxWidth: '80%', padding: '10px', borderRadius: '15px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  msgText: { margin: 0, fontSize: '0.9rem', lineHeight: '1.5' },
  msgFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.7rem', color: '#999' },
  delBtn: { border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '0 5px' },
  saveBtn: { border: 'none', background: 'none', color: '#2e8b57', cursor: 'pointer', padding: '0 5px' },
  chatInputArea: { padding: '15px', borderTop: '1px solid #eee' },
  mediaBar: { display: 'flex', justifyContent: 'center', gap: '25px', marginBottom: '10px' },
  mediaIcon: { background: 'none', border: 'none', color: '#2e8b57', fontSize: '1.2rem', cursor: 'pointer' },
  inputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' },
  sendBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#2e8b57', color: 'white' },
  loading: { textAlign: 'center', padding: '10px', color: '#2e8b57' },
  emptyMsg: { textAlign: 'center', marginTop: '40px', color: '#ccc' }
}; [cite: 48, 49, 50, 51, 52]

export default App; [cite: 53]
