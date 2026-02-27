import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
// تم تعديل المسار ليتوافق مع هيكلية المجلدات في مشروعك لضمان نجاح الـ Build
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService'; [cite: 53]

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
    { title: "تعديل السلوك", icon: "fa-child", items: ["التعزيز الإيجابي", "تجاهل السلوكيات المزعجة", "العواقب المنطقية", "وضع حدود واضحة", "لوحة النجوم والمكافآت", "النمذجة والقدوة", "قضاء وقت خاص", "الاستماع الفعال", "بدائل كلمة لا", "توفير بيئة آمنة"] }, [cite: 5]
    { title: "غرس القناعات", icon: "fa-heart", items: ["قيمة الصدق", "الإيمان بالقدرات", "احترام الاختلاف", "العمل الجماعي", "قيمة الامتنان", "المثابرة", "حب التعلم", "المسؤولية البيئية", "الأمانة", "الرحمة بالضعفاء"] }, [cite: 5]
    { title: "الذكاء العاطفي", icon: "fa-brain", items: ["تسمية المشاعر", "مهارة التعاطف", "تنفس الهدوء", "الاعتراف بالمشاعر", "حل النزاعات سلمياً", "بناء الثقة بالنفس", "التعامل مع الخوف", "فهم لغة الجسد", "تحمل الإحباط", "تنمية التفاؤل"] }, [cite: 5, 6]
    { title: "تطوير المعرفة", icon: "fa-book-open", items: ["القراءة اليومية", "ألعاب الألغاز", "تجارب علمية منزلية", "تعلم لغة ثانية", "الرحلات التعليمية", "الحساب الذهني", "النقاشات المفتوحة", "الثقافات العالمية", "تكنولوجيا هادفة", "تشجيع الهوايات"] }, [cite: 6]
    { title: "الصحة والنشاط", icon: "fa-apple-whole", items: ["نظام غذائي متوازن", "ساعات نوم كافية", "شرب الماء", "ممارسة الرياضة", "النظافة الشخصية", "الفحوصات الدورية", "تقليل السكريات", "وقت في الطبيعة", "المهارات الحركية", "سلامة الجسد"] }, [cite: 6]
    { title: "مهارات اجتماعية", icon: "fa-users", items: ["إلقاء التحية", "مشاركة الألعاب", "آداب المائدة", "تكوين صداقات", "الاعتذار الصادق", "الاستماع للغير", "طلب الإذن", "التعاون المنزلي", "مهارات القيادة", "التعبير عن الرأي"] }, [cite: 6, 7]
    { title: "الاستقلال", icon: "fa-star", items: ["ارتداء الملابس", "ترتيب السرير", "تحضير وجبة", "اتخاذ قرارات", "إدارة المصروف", "الالتزام بالجدول", "حل المشكلات", "عناية بالنباتات", "تحمل النتيجة", "إسعافات أولية"] }, [cite: 7]
    { title: "رعاية الأم", icon: "fa-spa", items: ["تخصيص وقت للراحة", "ممارسة هواية", "طلب المساعدة", "التواصل مع أمهات", "تخطي شعور الذنب", "نوم كافٍ", "قراءة تربوية", "التأمل واليوجا", "تحديد الأولويات", "الاحتفال بالإنجاز"] }, [cite: 7]
    { title: "الأمان والحماية", icon: "fa-shield-halved", items: ["لمسات الأمان", "حفظ أرقام الطوارئ", "سلامة المنزل", "الأمان الرقمي", "التصرف عند الضياع", "قواعد مع الغرباء", "قواعد المرور", "التواصل المفتوح", "معرفة العنوان", "مواجهة التنمر"] }, [cite: 7, 8]
    { title: "الإبداع والخيال", icon: "fa-palette", items: ["القصص الخيالية", "اللعب الحر", "الرسم والتلوين", "الأشغال اليدوية", "تمثيل الأدوار", "تأليف قصص", "البناء بالمكعبات", "جمع كنوز الطبيعة", "الاستماع للفنون", "الفوضى الإبداعية"] } [cite: 8]
  ];

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

    // التخصص الجديد: استشاري تربوي للأطفال [cite: 13]
    const systemExpertise = "بصفتك استشاري تربوي خبير متخصص في سلوك الأطفال، قدم نصائح مبنية على الدراسات التربوية الحديثة وتوجيهات أطباء نفس الأطفال.";
    
    const promptMessage = customPrompt 
      ? `${systemExpertise} سؤالي هو: ${customPrompt}` [cite: 14, 15]
      : `${systemExpertise} لقد حقق طفلي المهام التالية: (${selectedOnes.join(" - ")}) في قسم ${currentList.title}. حلل الحالة تربوياً وقدم نصيحة للأم.`; [cite: 15, 16]

    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      }); [cite: 16, 17]
      
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
        let base64;
        if (type === 'camera') {
            base64 = await takePhoto(); // استخدام دالة الكاميرا من MediaService 
        } else {
            base64 = await fetchImage(); // استخدام دالة المعرض من MediaService 
        }
        
        const timestamp = Date.now(); [cite: 23]
        const fileName = `edu_${timestamp}.png`; [cite: 23]
        
        // الرفع الفعلي إلى Vercel Blob 
        const finalUrl = await uploadToVercel(base64, fileName, 'image/png'); [cite: 53]
        
        setMessages(prev => [...prev, {
            id: Date.now(),
            text: `تم رفع ملف تربوي: ${finalUrl}`,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString()
        }]); [cite: 25]
    } catch (error) {
        alert("خطأ في معالجة الميديا: " + error.message); [cite: 27]
    }
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id)); [cite: 28]
  };

  const saveReply = (msg) => {
    setSavedReplies(prev => [...prev, msg]); [cite: 29]
    alert("تم حفظ النصيحة التربوية!"); [cite: 29]
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); [cite: 30]
  }, [messages]);

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.specialistBtn} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-user-tie"></i> استشاري التربية والطفل
        </button>
      </div>

      <header style={styles.header}>
        <h1>موسوعة رقة للتربية</h1> [cite: 31]
        <p>دليل الأم الواعية لبناء شخصية الطفل</p> [cite: 31]
      </header>

      <div style={styles.navScroll}>
        {lists.map((list, i) => (
          <button 
            key={i} 
            style={{...styles.navBtn, ...(selectedIdx === i ? styles.activeNav : {})}}
            onClick={() => setSelectedIdx(i)}>
            <i className={`fas ${list.icon}`}></i>
            <span>{list.title}</span> [cite: 32, 33]
          </button>
        ))}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>{lists[selectedIdx].title}</h2> [cite: 33]
        <div style={styles.grid}>
          {lists[selectedIdx].items.map((item, i) => (
            <label key={i} style={styles.itemRow}>
              <input 
                type="checkbox" 
                checked={!!checkedItems[`${selectedIdx}-${item}`]}
                onChange={() => setCheckedItems({...checkedItems, [`${selectedIdx}-${item}`]: !checkedItems[`${selectedIdx}-${item}`]})}
              /> [cite: 34]
              <span style={checkedItems[`${selectedIdx}-${item}`] ? styles.done : {}}>{item}</span> [cite: 35]
            </label>
          ))}
        </div>
        <button style={styles.analyzeBtn} onClick={() => getAIAnalysis()}>
          <i className="fas fa-brain"></i> تحليل السلوك تربوياً
        </button> [cite: 35]
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
              <span><i className="fas fa-child"></i> المستشار التربوي الذكي</span> [cite: 36]
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
            </div>

            <div style={styles.chatContent}>
              {messages.length === 0 && <p style={styles.emptyMsg}>مرحباً بكِ.. أنا استشاري تربوي، كيف يمكنني مساعدتكِ في توجيه طفلكِ اليوم؟</p>} [cite: 36, 37]
              {messages.map(msg => (
                <div key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}>
                  <div style={styles.msgBubble}>
                    <p style={styles.msgText}>{msg.text}</p> [cite: 37]
                    <div style={styles.msgFooter}>
                      <small>{msg.timestamp}</small> [cite: 38]
                      <div style={{display: 'flex', gap: '5px'}}>
                        {msg.sender === 'ai' && (
                          <button onClick={() => saveReply(msg)} style={styles.saveBtn} title="حفظ">
                            <i className="fas fa-bookmark"></i>
                          </button> [cite: 39]
                        )}
                        <button onClick={() => deleteMessage(msg.id)} style={styles.delBtn} title="حذف">
                          <i className="fas fa-trash-alt"></i>
                        </button> [cite: 40]
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && <div style={styles.loading}>جاري مراجعة المراجع التربوية... ✨</div>} [cite: 41]
              <div ref={chatEndRef} /> [cite: 42]
            </div>

            <div style={styles.chatInputArea}>
              <div style={styles.mediaBar}>
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('camera')}><i className="fas fa-camera"></i></button> [cite: 42]
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('gallery')}><i className="fas fa-image"></i></button> [cite: 42]
                <button style={styles.mediaIcon}><i className="fas fa-microphone"></i></button> [cite: 43]
              </div>
              <div style={styles.inputRow}>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اسألي عن السلوك، التربية، أو القناعات..." [cite: 43, 44]
                  style={styles.input}
                />
                <button 
                  onClick={() => { 
                    if(inputText.trim()) { 
                      setMessages(prev => [...prev, {id: Date.now(), text: inputText, sender:'user', timestamp: new Date().toLocaleTimeString()}]); [cite: 45]
                      getAIAnalysis(inputText); [cite: 46]
                      setInputText(""); 
                    } 
                  }}
                  style={styles.sendBtn}>
                  <i className="fas fa-paper-plane"></i>
                </button> [cite: 46]
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { direction: 'rtl', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf7f9', minHeight: '100vh' }, [cite: 48]
  topBar: { display: 'flex', justifyContent: 'center', marginBottom: '15px' }, [cite: 48]
  specialistBtn: { padding: '12px 25px', borderRadius: '25px', border: 'none', background: '#6a5acd', color: 'white', fontWeight: 'bold', cursor: 'pointer' }, [cite: 48]
  header: { textAlign: 'center', marginBottom: '20px', color: '#6a5acd' }, [cite: 48]
  navScroll: { display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' }, [cite: 48]
  navBtn: { flex: '0 0 auto', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }, [cite: 48, 49]
  activeNav: { background: '#ff85a2', color: 'white', borderColor: '#ff85a2' }, [cite: 49]
  card: { background: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }, [cite: 49]
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'right', marginBottom: '15px' }, [cite: 49]
  itemRow: { padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f9f9f9' }, [cite: 49]
  done: { textDecoration: 'line-through', color: '#ccc' }, [cite: 49]
  analyzeBtn: { width: '100%', padding: '12px', borderRadius: '25px', border: 'none', background: '#ff85a2', color: 'white', fontWeight: 'bold', cursor: 'pointer' }, [cite: 49]
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }, [cite: 49, 50]
  chatBox: { width: '100%', maxWidth: '500px', height: '90vh', background: 'white', borderRadius: '25px 25px 0 0', display: 'flex', flexDirection: 'column' }, [cite: 50]
  chatHeader: { padding: '15px', background: '#6a5acd', color: 'white', display: 'flex', justifyContent: 'space-between', borderRadius: '25px 25px 0 0' }, [cite: 50]
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.5rem' }, [cite: 50]
  chatContent: { flex: 1, overflowY: 'auto', padding: '15px', background: '#f8f9fa' }, [cite: 50]
  aiMsgRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }, [cite: 50]
  userMsgRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }, [cite: 50]
  msgBubble: { maxWidth: '80%', padding: '10px', borderRadius: '15px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }, [cite: 50, 51]
  msgText: { margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }, [cite: 51]
  msgFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.7rem', color: '#999' }, [cite: 51]
  delBtn: { border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '0 5px' }, [cite: 51]
  saveBtn: { border: 'none', background: 'none', color: '#6a5acd', cursor: 'pointer', padding: '0 5px' }, [cite: 51]
  chatInputArea: { padding: '15px', borderTop: '1px solid #eee' }, [cite: 51]
  mediaBar: { display: 'flex', justifyContent: 'center', gap: '25px', marginBottom: '10px' }, [cite: 51]
  mediaIcon: { background: 'none', border: 'none', color: '#6a5acd', fontSize: '1.2rem', cursor: 'pointer' }, [cite: 51, 52]
  inputRow: { display: 'flex', gap: '10px' }, [cite: 52]
  input: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' }, [cite: 52]
  sendBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#6a5acd', color: 'white' }, [cite: 52]
  loading: { textAlign: 'center', padding: '10px', color: '#6a5acd' }, [cite: 52]
  emptyMsg: { textAlign: 'center', marginTop: '40px', color: '#ccc' } [cite: 52]
};

export default App; [cite: 53]
