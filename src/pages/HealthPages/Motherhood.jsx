import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
// استيراد خدمات الميديا من المسار المحدد
import { takePhoto, fetchImage, uploadToVercel } from '../services/MediaService'; 

const App = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [savedReplies, setSavedReplies] = useState([]);

  const chatEndRef = useRef(null);

  const lists = [
    { title: "تعديل السلوك", icon: "fa-child", items: ["التعزيز الإيجابي", "تجاهل السلوكيات المزعجة", "العواقب المنطقية", "وضع حدود واضحة", "لوحة النجوم والمكافآت", "النمذجة والقدوة", "قضاء وقت خاص", "الاستماع الفعال", "بدائل كلمة لا", "توفير بيئة آمنة"] },
    { title: "غرس القناعات", icon: "fa-heart", items: ["قيمة الصدق", "الإيمان بالقدرات", "احترام الاختلاف", "العمل الجماعي", "قيمة الامتنان", "المثابرة", "حب التعلم", "المسؤولية البيئية", "الأمانة", "الرحمة بالضعفاء"] },
    { title: "الذكاء العاطفي", icon: "fa-brain", items: ["تسمية المشاعر", "مهارة التعاطف", "تنفس الهدوء", "الاعتراف بالمشاعر", "حل النزاعات سلمياً", "بناء الثقة بالنفس", "التعامل مع الخوف", "فهم لغة الجسد", "تحمل الإحباط", "تنمية التفاؤل"] },
    { title: "تطوير المعرفة", icon: "fa-book-open", items: ["القرارءة اليومية", "ألعاب الألغاز", "تجارب علمية منزلية", "تعلم لغة ثانية", "الرحلات التعليمية", "الحساب الذهني", "النقاشات المفتوحة", "الثقافات العالمية", "تكنولوجيا هادفة", "تشجيع الهوايات"] },
    { title: "الصحة والنشاط", icon: "fa-apple-whole", items: ["نظام غذائي متوازن", "ساعات نوم كافية", "شرب الماء", "ممارسة الرياضة", "النظافة الشخصية", "الفحوصات الدورية", "تقليل السكريات", "وقت في الطبيعة", "المهارات الحركية", "سلامة الجسد"] },
    { title: "مهارات اجتماعية", icon: "fa-users", items: ["إلقاء التحية", "مشاركة الألعاب", "آداب المائدة", "تكوين صداقات", "الاعتذار الصادق", "الاستماع للغير", "طلب الإذن", "التعاون المنزلي", "مهارات القيادة", "التعبير عن الرأي"] },
    { title: "الاستقلال", icon: "fa-star", items: ["ارتداء الملابس", "ترتيب السرير", "تحضير وجبة", "اتخاذ قرارات", "إدارة المصروف", "الالتزام بالجدول", "حل المشكلات", "عناية بالنباتات", "تحمل النتيجة", "إسعافات أولية"] },
    { title: "رعاية الأم", icon: "fa-spa", items: ["تخصيص وقت للراحة", "ممارسة هواية", "طلب المساعدة", "التواصل مع أمهات", "تخطي شعور الذنب", "نوم كافٍ", "قراءة تربوية", "التأمل واليوجا", "تحديد الأولويات", "الاحتفال بالإنجاز"] },
    { title: "الأمان والحماية", icon: "fa-shield-halved", items: ["لمسات الأمان", "حفظ أرقام الطوارئ", "سلامة المنزل", "الأمان الرقمي", "التصرف عند الضياع", "قواعد مع الغرباء", "قواعد المرور", "التواصل المفتوح", "معرفة العنوان", "مواجهة التنمر"] },
    { title: "الإبداع والخيال", icon: "fa-palette", items: ["القصص الخيالية", "اللعب الحر", "الرسم والتلوين", "الأشغال اليدوية", "تمثيل الأدوار", "تأليف قصص", "البناء بالمكعبات", "جمع كنوز الطبيعة", "الاستماع للفنون", "الفوضى الإبداعية"] }
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
          note: `تم تحليل بيانات قسم ${lists[selectedIdx].title} تربوياً`
        }
      });
    } catch (e) { console.error("DB Save Error:", e); }
  };

  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true);
    setIsChatOpen(true);
    const currentList = lists[selectedIdx];
    const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]);
    
    if (!customPrompt) saveDataToDB(selectedOnes);

    // تحديث الشخصية إلى خبير تربوي محترف 
    const systemExpertise = "أنت الآن خبير استشاري تربوي متخصص في علم نفس الطفل وتعديل السلوك. استخدم أرقى المنهجيات التربوية (مثل التربية الإيجابية) لتقديم نصائح عملية تدعم الأم وتوجه الطفل.";
    const promptMessage = customPrompt 
      ? `${systemExpertise} سؤالي هو: ${customPrompt}`
      : `${systemExpertise} لقد أنجز طفلي المهام التالية: (${selectedOnes.join(" - ")}) في مجال ${currentList.title}. قدم لي تحليلاً تربوياً وخطوات عملية قادمة.`;

    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      });
      const responseText = response.data.reply || "أعتذر، حدث خلل في معالجة الاستشارة التربوية.";
      setMessages(prev => [...prev, { id: Date.now(), text: responseText, sender: 'ai', timestamp: new Date().toLocaleTimeString() }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), text: "عذراً، تعذر الاتصال بالمستشار التربوي.", sender: 'ai' }]);
    } finally { setIsLoading(false); }
  };

  // وظيفة معالجة الصور الفعلية باستخدام MediaService 
  const handleMediaAction = async (type) => {
    try {
        let base64;
        if (type === 'camera') {
            base64 = await takePhoto(); 
        } else {
            base64 = await fetchImage();
        }

        if (base64) {
            setIsLoading(true);
            const fileName = `child_care_${Date.now()}.png`;
            const imageUrl = await uploadToVercel(base64, fileName, 'image/png'); [cite: 53]
            
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
        alert("فشل في معالجة الصورة: " + error.message);
        setIsLoading(false);
    }
  };

  const deleteMessage = (id) => setMessages(prev => prev.filter(m => m.id !== id)); [cite: 28]
  const saveReply = (msg) => {
    setSavedReplies(prev => [...prev, msg]);
    alert("تم حفظ النصيحة التربوية في المفضلة!"); [cite: 29]
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.specialistBtn} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-graduation-cap"></i> المستشار التربوي الخاص
        </button>
      </div>

      <header style={styles.header}>
        <h1>موسوعة رقة للتربية</h1>
        <p>رفيقكِ في رحلة بناء شخصية طفلكِ</p>
      </header>

      <div style={styles.navScroll}>
        {lists.map((list, i) => (
          <button key={i} style={{...styles.navBtn, ...(selectedIdx === i ? styles.activeNav : {})}} onClick={() => setSelectedIdx(i)}>
            <i className={`fas ${list.icon}`}></i>
            <span>{list.title}</span>
          </button>
        ))}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>{lists[selectedIdx].title}</h2>
        <div style={styles.grid}>
          {lists[selectedIdx].items.map((item, i) => (
            <label key={i} style={styles.itemRow}>
              <input type="checkbox" checked={!!checkedItems[`${selectedIdx}-${item}`]} onChange={() => setCheckedItems({...checkedItems, [`${selectedIdx}-${item}`]: !checkedItems[`${selectedIdx}-${item}`]})} />
              <span style={checkedItems[`${selectedIdx}-${item}`] ? styles.done : {}}>{item}</span>
            </label>
          ))}
        </div>
        <button style={styles.analyzeBtn} onClick={() => getAIAnalysis()}>
          <i className="fas fa-magic"></i> تحليل الإنجازات تربوياً
        </button>
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
              <span><i className="fas fa-user-tie"></i> استشاري تعديل السلوك</span>
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
            </div>

            <div style={styles.chatContent}>
              {messages.length === 0 && <p style={styles.emptyMsg}>أهلاً بكِ في المساحة الآمنة.. كيف يمكنني توجيهكِ في تربية طفلكِ اليوم؟</p>}
              {messages.map(msg => (
                <div key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}>
                  <div style={styles.msgBubble}>
                    {msg.isImage ? <img src={msg.url} alt="Uploaded" style={{maxWidth: '100%', borderRadius: '10px'}} /> : <p style={styles.msgText}>{msg.text}</p>}
                    <div style={styles.msgFooter}>
                      <small>{msg.timestamp}</small>
                      <div style={{display: 'flex', gap: '8px'}}>
                        {msg.sender === 'ai' && (
                          <button onClick={() => saveReply(msg)} style={styles.saveBtn} title="حفظ"><i className="fas fa-bookmark"></i></button>
                        )}
                        <button onClick={() => deleteMessage(msg.id)} style={styles.delBtn} title="حذف"><i className="fas fa-trash-alt"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && <div style={styles.loading}>جاري مراجعة المنهجيات التربوية... ✨</div>}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.chatInputArea}>
              <div style={styles.mediaBar}>
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('camera')}><i className="fas fa-camera"></i></button>
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('gallery')}><i className="fas fa-image"></i></button>
              </div>
              <div style={styles.inputRow}>
                <input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="اسألي عن سلوك، مهارة، أو تحدي تربوي..." style={styles.input} />
                <button onClick={() => { if(inputText.trim()) { setMessages(prev => [...prev, {id: Date.now(), text: inputText, sender:'user', timestamp: new Date().toLocaleTimeString()}]); getAIAnalysis(inputText); setInputText(""); } }} style={styles.sendBtn}>
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

// الستايلات المحدثة لتعطي طابعاً تربوياً مريحاً
const styles = {
  container: { direction: 'rtl', padding: '15px', fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf7f9', minHeight: '100vh' },
  topBar: { display: 'flex', justifyContent: 'center', marginBottom: '15px' },
  specialistBtn: { padding: '12px 25px', borderRadius: '25px', border: 'none', background: '#6a5acd', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(106,90,205,0.3)' },
  header: { textAlign: 'center', marginBottom: '20px', color: '#6a5acd' },
  navScroll: { display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' },
  navBtn: { flex: '0 0 auto', padding: '12px', borderRadius: '15px', border: '1px solid #eee', background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '85px' },
  activeNav: { background: '#ff85a2', color: 'white', borderColor: '#ff85a2' },
  card: { background: 'white', padding: '20px', borderRadius: '25px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'right', marginBottom: '15px' },
  itemRow: { padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #fcfcfc', fontSize: '0.9rem' },
  done: { textDecoration: 'line-through', color: '#bbb' },
  analyzeBtn: { width: '100%', padding: '15px', borderRadius: '25px', border: 'none', background: '#ff85a2', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' },
  chatBox: { width: '100%', maxWidth: '500px', height: '92vh', background: 'white', borderRadius: '30px 30px 0 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { padding: '18px', background: '#6a5acd', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.8rem', cursor: 'pointer' },
  chatContent: { flex: 1, overflowY: 'auto', padding: '15px', background: '#f9f9f9' },
  aiMsgRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' },
  userMsgRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' },
  msgBubble: { maxWidth: '85%', padding: '12px', borderRadius: '18px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.08)', position: 'relative' },
  msgText: { margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: '#444' },
  msgFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '5px' },
  delBtn: { border: 'none', background: 'none', color: '#ff5e5e', cursor: 'pointer', fontSize: '0.9rem' },
  saveBtn: { border: 'none', background: 'none', color: '#6a5acd', cursor: 'pointer', fontSize: '0.9rem' },
  chatInputArea: { padding: '15px', background: 'white', borderTop: '1px solid #eee' },
  mediaBar: { display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '12px' },
  mediaIcon: { background: '#f0f0f0', border: 'none', color: '#6a5acd', width: '45px', height: '45px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer' },
  inputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '12px 18px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none' },
  sendBtn: { width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: '#6a5acd', color: 'white', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '15px', color: '#6a5acd', fontWeight: '500' },
  emptyMsg: { textAlign: 'center', marginTop: '50px', color: '#999', padding: '0 20px' }
};

export default App;
