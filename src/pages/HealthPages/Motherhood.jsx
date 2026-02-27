 import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
// استخدام مسار الميديا المطلوب 
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService'; 

const App = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState({}); [cite: 3]
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState(""); [cite: 4]
  const [savedReplies, setSavedReplies] = useState([]); 

  const chatEndRef = useRef(null);

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
      await CapacitorHttp.post({ [cite: 9]
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1,
          category: lists[selectedIdx].title,
          value: selectedOnes[0] || "إنجاز تربوي",
          note: `تم تحليل بيانات قسم ${lists[selectedIdx].title}` [cite: 9, 10]
        }
      });
    } catch (e) { console.error("DB Save Error:", e); } [cite: 11]
  };

  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true); [cite: 12]
    setIsChatOpen(true);
    const currentList = lists[selectedIdx];
    const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]); [cite: 13]
    
    if (!customPrompt) saveDataToDB(selectedOnes);

    // تحديث تخصص الذكاء الاصطناعي ليكون استشاري تربوي محترف 
    const systemExpertise = "بصفتك استشاري تربوي وخبير في علم نفس الطفل، قدم نصائح تربوية دقيقة تعتمد على المنهجيات العلمية الحديثة.";
    const promptMessage = customPrompt  [cite: 14]
      ? `${systemExpertise} سؤالي هو: ${customPrompt}` [cite: 15]
      : `${systemExpertise} لقد تابعت المهام التالية مع طفلي: (${selectedOnes.join(" - ")}) في قسم ${currentList.title}. حلل الحالة تربوياً ووجهني للصواب.`; [cite: 15, 16]

    try {
      const response = await CapacitorHttp.post({ [cite: 16, 17]
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      });
      const responseText = response.data.reply || response.data.message || "لم أستطع الحصول على رد حالياً."; [cite: 17]
      setMessages(prev => [...prev, { id: Date.now(), text: responseText, sender: 'ai', timestamp: new Date().toLocaleTimeString() }]); [cite: 18]
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), text: "حدث خطأ في الاتصال بالمستشار التربوي.", sender: 'ai' }]); [cite: 19]
    } finally { setIsLoading(false); } [cite: 20]
  };

  const handleMediaAction = async (type) => {
    try {
        let base64;
        if (type === 'camera') { base64 = await takePhoto(); } 
        else { base64 = await fetchImage(); }

        if (base64) {
          setIsLoading(true);
          const fileName = `child_care_${Date.now()}.png`;
          // الرفع إلى فيرسل بلومب عبر MediaService [cite: 24]
          const imageUrl = await uploadToVercel(base64, fileName, 'image/png'); [cite: 24, 25]
          
          setMessages(prev => [...prev, {
              id: Date.now(),
              text: `تم رفع صورة للمستشار: ${imageUrl}`,
              sender: 'user',
              timestamp: new Date().toLocaleTimeString(),
              isImage: true,
              url: imageUrl
          }]);
          setIsLoading(false);
        }
    } catch (error) {
        console.error("Media Error:", error);
        alert("حدث خطأ أثناء معالجة الصورة."); [cite: 27]
        setIsLoading(false);
    }
  };

  const deleteMessage = (id) => setMessages(prev => prev.filter(m => m.id !== id)); [cite: 28]
  const saveReply = (msg) => {
    setSavedReplies(prev => [...prev, msg]);
    alert("تم حفظ الرد في قائمتك المفضلة!"); [cite: 29]
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]); [cite: 30]

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.specialistBtn} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-user-graduate"></i> استشاري التربية والطفل
        </button>
      </div>

      <header style={styles.header}>
        <h1>موسوعة رقة للتربية</h1> [cite: 31]
        <p>دليل الأم الواعية لبناء شخصية الطفل</p>
      </header>

      <div style={styles.navScroll}>
        {lists.map((list, i) => (
          <button key={i} style={{...styles.navBtn, ...(selectedIdx === i ? styles.activeNav : {})}} onClick={() => setSelectedIdx(i)}>
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
              <input type="checkbox" checked={!!checkedItems[`${selectedIdx}-${item}`]} onChange={() => setCheckedItems({...checkedItems, [`${selectedIdx}-${item}`]: !checkedItems[`${selectedIdx}-${item}`]})} /> [cite: 34]
              <span style={checkedItems[`${selectedIdx}-${item}`] ? styles.done : {}}>{item}</span> [cite: 35]
            </label>
          ))}
        </div>
        <button style={styles.analyzeBtn} onClick={() => getAIAnalysis()}>
          <i className="fas fa-microchip"></i> تحليل الإنجازات تربوياً
        </button>
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}> [cite: 35]
          <div style={styles.chatBox}> [cite: 36]
            <div style={styles.chatHeader}>
              <span><i className="fas fa-comments"></i> المستشار التربوي الذكي</span>
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
            </div>

            <div style={styles.chatContent}>
              {messages.length === 0 && <p style={styles.emptyMsg}>أهلاً بكِ.. أنا خبير تربوي، كيف يمكنني مساعدتكِ في توجيه طفلكِ اليوم؟</p>} [cite: 36, 37]
              {messages.map(msg => (
                <div key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}> [cite: 37]
                  <div style={styles.msgBubble}>
                    {msg.isImage ? <img src={msg.url} alt="Uploaded" style={{maxWidth: '100%', borderRadius: '10px'}} /> : <p style={styles.msgText}>{msg.text}</p>}
                    <div style={styles.msgFooter}> [cite: 38]
                      <small>{msg.timestamp}</small>
                      <div style={{display: 'flex', gap: '5px'}}>
                        {msg.sender === 'ai' && (
                          <button onClick={() => saveReply(msg)} style={styles.saveBtn}><i className="fas fa-bookmark"></i> حفظ</button> [cite: 39]
                        )}
                        <button onClick={() => deleteMessage(msg.id)} style={styles.delBtn}><i className="fas fa-trash-alt"></i> حذف</button> [cite: 40]
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && <div style={styles.loading}>جاري مراجعة المنهجيات التربوية... ✨</div>} [cite: 41]
              <div ref={chatEndRef} /> [cite: 42]
            </div>

            <div style={styles.chatInputArea}>
              <div style={styles.mediaBar}>
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('camera')}><i className="fas fa-camera"></i></button> [cite: 42]
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('gallery')}><i className="fas fa-image"></i></button> [cite: 42]
                <button style={styles.mediaIcon}><i className="fas fa-microphone"></i></button> [cite: 43]
              </div>
              <div style={styles.inputRow}>
                <input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="اسألي عن سلوك الطفل أو طرق التربية..." style={styles.input} /> [cite: 43, 44]
                <button onClick={() => { if(inputText.trim()) { setMessages(prev => [...prev, {id: Date.now(), text: inputText, sender:'user', timestamp: new Date().toLocaleTimeString()}]); getAIAnalysis(inputText); setInputText(""); } }} style={styles.sendBtn}> [cite: 45, 46]
                  <i className="fas fa-paper-plane"></i>
                </button>
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
  topBar: { display: 'flex', justifyContent: 'center', marginBottom: '15px' },
  specialistBtn: { padding: '12px 25px', borderRadius: '25px', border: 'none', background: '#6a5acd', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(106,90,205,0.3)' },
  header: { textAlign: 'center', marginBottom: '20px', color: '#6a5acd' },
  navScroll: { display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' },
  navBtn: { flex: '0 0 auto', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }, [cite: 48, 49]
  activeNav: { background: '#ff85a2', color: 'white', borderColor: '#ff85a2' },
  card: { background: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'right', marginBottom: '15px' },
  itemRow: { padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f9f9f9' },
  done: { textDecoration: 'line-through', color: '#ccc' },
  analyzeBtn: { width: '100%', padding: '12px', borderRadius: '25px', border: 'none', background: '#ff85a2', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }, [cite: 49, 50]
  chatBox: { width: '100%', maxWidth: '500px', height: '90vh', background: 'white', borderRadius: '25px 25px 0 0', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '15px', background: '#6a5acd', color: 'white', display: 'flex', justifyContent: 'space-between', borderRadius: '25px 25px 0 0' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.5rem' },
  chatContent: { flex: 1, overflowY: 'auto', padding: '15px', background: '#f8f9fa' },
  aiMsgRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' },
  userMsgRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
  msgBubble: { maxWidth: '80%', padding: '10px', borderRadius: '15px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }, [cite: 50, 51]
  msgText: { margin: 0, fontSize: '0.9rem', lineHeight: '1.5' },
  msgFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.7rem', color: '#999' },
  delBtn: { border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '0 5px' },
  saveBtn: { border: 'none', background: 'none', color: '#6a5acd', cursor: 'pointer', padding: '0 5px' },
  chatInputArea: { padding: '15px', borderTop: '1px solid #eee' },
  mediaBar: { display: 'flex', justifyContent: 'center', gap: '25px', marginBottom: '10px' },
  mediaIcon: { background: 'none', border: 'none', color: '#6a5acd', fontSize: '1.2rem', cursor: 'pointer' }, [cite: 51, 52]
  inputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' },
  sendBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#6a5acd', color: 'white' },
  loading: { textAlign: 'center', padding: '10px', color: '#6a5acd' },
  emptyMsg: { textAlign: 'center', marginTop: '40px', color: '#ccc' }
};

export default App; [cite: 53]
