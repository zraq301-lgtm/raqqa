import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
[cite_start]// تم تصحيح المسار للوصول من src/pages/HealthPages إلى src/services [cite: 2]
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

const Motherhood = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [savedReplies, setSavedReplies] = useState([]); 
  const [showSavedList, setShowSavedList] = useState(false); // حالة لإظهار القائمة المحفوظة

  const chatEndRef = useRef(null);

  const lists = [
    { title: "تعديل السلوك", icon: "fa-child", items: ["التعزيز الإيجابي", "تجاهل السلوكيات المزعجة", "العواقب المنطقية", "وضع حدود واضحة", "لوحة النجوم والمكافآت", "النمذجة والقدوة", "قضاء وقت خاص", "الاستماع الفعال", "بدائل كلمة لا", "توفير بيئة آمنة"] },
    { title: "غرس القناعات", icon: "fa-heart", items: ["قيمة الصدق", "الإيمان بالقدرات", "احترام الاختلاف", "العمل الجماعي", "قيمة الامتنان", "المثابرة", "حب التعلم", "المسؤولية البيئية", "الأمانة", "الرحمة بالضعفاء"] },
    { title: "الذكاء العاطفي", icon: "fa-brain", items: ["تسمية المشاعر", "مهارة التعاطف", "تنفس الهدوء", "الاعتراف بالمشاعر", "حل النزاعات سلمياً", "بناء الثقة بنفسه", "التعامل مع الخوف", "فهم لغة الجسد", "تحمل الإحباط", "تنمية التفاؤل"] },
    { title: "تطوير المعرفة", icon: "fa-book-open", items: ["القراءة اليومية", "ألعاب الألغاز", "تجارب علمية منزلية", "تعلم لغة ثانية", "الرحلات التعليمية", "الحساب الذهني", "النقاشات المفتوحة", "الثقافات العالمية", "تكنولوجيا هادفة", "تشجيع الهوايات"] },
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
          value: selectedOnes[0] || "نشاط تربوي",
          note: `تحليل قسم ${lists[selectedIdx].title}`
        }
      });
    } catch (e) { console.error("Database Save Error:", e); }
  };

  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true);
    setIsChatOpen(true);
    const currentList = lists[selectedIdx];
    const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]);
    
    if (!customPrompt) saveDataToDB(selectedOnes);
    const systemExpertise = "أنت طبيب استشاري تربوي متخصص في علم نفس الأطفال. ردك يجب أن يكون مهنياً، توعوياً، ويستند إلى أفضل الممارسات التربوية الحديثة لتوجيه الأم نحو الصواب.";
    const promptMessage = customPrompt 
      ? `${systemExpertise} سؤال الأم: ${customPrompt}`
      : `${systemExpertise} الأم أنجزت مع طفلها: (${selectedOnes.join(", ")}) في مجال ${currentList.title}. قدم تحليلاً طبياً تربوياً.`;

    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      });
      const responseText = response.data.reply || response.data.message || "عذراً، المستشار مشغول حالياً.";
      setMessages(prev => [...prev, { id: Date.now(), text: responseText, sender: 'ai', timestamp: new Date().toLocaleTimeString() }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), text: "خطأ في الاتصال بالذكاء الاصطناعي.", sender: 'ai' }]);
    } finally { setIsLoading(false); }
  };

  const handleMediaAction = async (type) => {
    try {
      let base64;
      if (type === 'camera') { base64 = await takePhoto(); } 
      else { base64 = await fetchImage(); }

      if (base64) {
        setIsLoading(true);
        const fileName = `child_care_${Date.now()}.png`;
        const imageUrl = await uploadToVercel(base64, fileName, 'image/png');
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: `تم رفع صورة استشارية: ${imageUrl}`,
          sender: 'user',
          timestamp: new Date().toLocaleTimeString(),
          isImage: true,
          url: imageUrl
        }]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Media Error:", error);
      setIsLoading(false);
    }
  };

  const deleteMessage = (id) => setMessages(prev => prev.filter(m => m.id !== id));
  
  const saveReply = (msg) => {
    if (!savedReplies.find(r => r.id === msg.id)) {
      setSavedReplies(prev => [...prev, msg]);
      alert("تمت إضافة الرد إلى قائمة الحفظ بنجاح!");
    }
  };

  const removeSavedReply = (id) => {
    setSavedReplies(prev => prev.filter(r => r.id !== id));
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.specialistBtn} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-user-md"></i> استشاري الأطفال والتربية
        </button>
      </div>

      <header style={styles.header}>
        <h1>أكاديمية رقة للأمومة</h1>
        <p>بناء شخصية الطفل بمعايير علمية</p>
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
          <i className="fas fa-brain"></i> الحصول على تحليل تربوي
        </button>
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <i className="fas fa-stethoscope"></i>
                <span>العيادة التربوية الذكية</span>
              </div>
              <div style={{display: 'flex', gap: '15px'}}>
                <button onClick={() => setShowSavedList(!showSavedList)} style={styles.iconBtn} title="الردود المحفوظة">
                  <i className={`fas ${showSavedList ? 'fa-comment-dots' : 'fa-bookmark'}`}></i>
                </button>
                <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
              </div>
            </div>

            <div style={styles.chatContent}>
              {showSavedList ? (
                <div style={styles.savedListArea}>
                  <h3 style={styles.savedTitle}>الردود المحفوظة 📌</h3>
                  {savedReplies.length === 0 ? <p style={styles.emptyMsg}>لا توجد ردود محفوظة حالياً.</p> : 
                    savedReplies.map(msg => (
                      <div key={msg.id} style={styles.savedItem}>
                        <p style={styles.msgText}>{msg.text}</p>
                        <button onClick={() => removeSavedReply(msg.id)} style={styles.delBtn}><i className="fas fa-trash-can"></i> حذف من الحفظ</button>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <>
                  {messages.length === 0 && <p style={styles.emptyMsg}>مرحباً بكِ في العيادة التربوية. أنا هنا لمساعدتكِ في توجيه طفلكِ نحو الأفضل.</p>}
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
                            <button onClick={() => deleteMessage(msg.id)} style={styles.delBtn} title="حذف الرد"><i className="fas fa-trash"></i></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && <div style={styles.loading}>جاري مراجعة المنهجيات العلمية... ⏳</div>}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            <div style={styles.chatInputArea}>
              <div style={styles.mediaBar}>
                <button style={styles.mediaIconBtn} onClick={() => handleMediaAction('camera')}>
                    <i className="fas fa-camera"></i>
                    <span>الكاميرا</span>
                </button>
                <button style={styles.mediaIconBtn} onClick={() => handleMediaAction('gallery')}>
                    <i className="fas fa-image"></i>
                    <span>المعرض</span>
                </button>
              </div>
              <div style={styles.inputRow}>
                <input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="اكتبي استشارتك هنا..." style={styles.input} />
                <button onClick={() => { if(inputText.trim()) { setMessages(prev => [...prev, {id: Date.now(), text: inputText, sender:'user', timestamp: new Date().toLocaleTimeString()}]); getAIAnalysis(inputText); setInputText(""); } }} style={styles.sendBtn}>
                  <i className="fas fa-paper-plane"></i>
                  <span style={{fontSize: '0.7rem', display: 'block'}}>إرسال</span>
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
  container: { direction: 'rtl', padding: '15px', backgroundColor: '#fdf7f9', minHeight: '100vh', fontFamily: 'sans-serif' },
  topBar: { display: 'flex', justifyContent: 'center', marginBottom: '15px' },
  specialistBtn: { padding: '10px 20px', borderRadius: '20px', border: 'none', background: '#6a5acd', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  header: { textAlign: 'center', marginBottom: '20px', color: '#6a5acd' },
  navScroll: { display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' },
  navBtn: { flex: '0 0 auto', padding: '12px', borderRadius: '15px', border: '1px solid #ddd', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '85px' },
  activeNav: { background: '#ff85a2', color: 'white', borderColor: '#ff85a2' },
  card: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderBottom: '1px solid #f9f9f9', fontSize: '0.9rem' },
  done: { textDecoration: 'line-through', color: '#ccc' },
  analyzeBtn: { width: '100%', padding: '12px', borderRadius: '25px', border: 'none', background: '#ff85a2', color: 'white', fontWeight: 'bold' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' },
  chatBox: { width: '100%', maxWidth: '500px', height: '90vh', background: 'white', borderRadius: '25px 25px 0 0', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '15px', background: '#6a5acd', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '25px 25px 0 0' },
  iconBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.8rem', cursor: 'pointer' },
  chatContent: { flex: 1, overflowY: 'auto', padding: '15px', background: '#f8f9fa' },
  aiMsgRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' },
  userMsgRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
  msgBubble: { maxWidth: '85%', padding: '12px', borderRadius: '15px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  msgText: { margin: 0, fontSize: '0.9rem', lineHeight: '1.5' },
  msgFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '5px' },
  delBtn: { border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem' },
  saveBtn: { border: 'none', background: 'none', color: '#6a5acd', cursor: 'pointer' },
  chatInputArea: { padding: '15px', borderTop: '1px solid #eee' },
  mediaBar: { display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '10px' },
  mediaIconBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', color: '#6a5acd', cursor: 'pointer', gap: '4px', fontSize: '0.8rem' },
  inputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' },
  sendBtn: { width: '55px', height: '55px', borderRadius: '50%', border: 'none', background: '#6a5acd', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  loading: { textAlign: 'center', color: '#6a5acd', padding: '10px' },
  emptyMsg: { textAlign: 'center', color: '#999', marginTop: '50px' },
  savedListArea: { padding: '10px' },
  savedTitle: { color: '#6a5acd', borderBottom: '2px solid #6a5acd', paddingBottom: '10px', marginBottom: '15px' },
  savedItem: { background: 'white', padding: '15px', borderRadius: '15px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
};

export default Motherhood;
