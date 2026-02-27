import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
// تم تصحيح المسار ليتناسب مع هيكلية المجلدات التي ظهرت في الخطأ
import { takePhoto, uploadToVercel, pickImage } from '../../services/MediaService'; 

const App = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); [cite_start]// لحالة معالجة الصور [cite: 8]
  const [inputText, setInputText] = useState("");
  const [savedReplies, setSavedReplies] = useState([]); 
  const [showSavedList, setShowSavedList] = useState(false);

  const chatEndRef = useRef(null);

  const lists = [
    [cite_start]{ title: "تعديل السلوك", icon: "fa-child", items: ["التعزيز الإيجابي", "تجاهل السلوكيات المزعجة", "العواقب المنطقية", "وضع حدود واضحة", "لوحة النجوم والمكافآت", "النمذجة والقدوة", "قضاء وقت خاص", "الاستماع الفعال", "بدائل كلمة لا", "توفير بيئة آمنة"] [cite: 5] },
    [cite_start]{ title: "غرس القناعات", icon: "fa-heart", items: ["قيمة الصدق", "الإيمان بالقدرات", "احترام الاختلاف", "العمل الجماعي", "قيمة الامتنان", "المثابرة", "حب التعلم", "المسؤولية البيئية", "الأمانة", "الرحمة بالضعفاء"] [cite: 5] },
    [cite_start]{ title: "الذكاء العاطفي", icon: "fa-brain", items: ["تسمية المشاعر", "مهارة التعاطف", "تنفس الهدوء", "الاعتراف بالمشاعر", "حل النزاعات سلمياً", "بناء الثقة بالنفس", "التعامل مع الخوف", "فهم لغة الجسد", "تحمل الإحباط", "تنمية التفاؤل"] [cite: 5, 6] },
    [cite_start]{ title: "تطوير المعرفة", icon: "fa-book-open", items: ["القراءة اليومية", "ألعاب الألغاز", "تجارب علمية منزلية", "تعلم لغة ثانية", "الرحلات التعليمية", "الحساب الذهني", "النقاشات المفتوحة", "الثقافات العالمية", "تكنولوجيا هادفة", "تشجيع الهوايات"] [cite: 6] },
    [cite_start]{ title: "الصحة والنشاط", icon: "fa-apple-whole", items: ["نظام غذائي متوازن", "ساعات نوم كافية", "شرب الماء", "ممارسة الرياضة", "النظافة الشخصية", "الفحوصات الدورية", "تقليل السكريات", "وقت في الطبيعة", "المهارات الحركية", "سلامة الجسد"] [cite: 6] },
    [cite_start]{ title: "مهارات اجتماعية", icon: "fa-users", items: ["إلقاء التحية", "مشاركة الألعاب", "آداب المائدة", "تكوين صداقات", "الاعتذار الصادق", "الاستماع للغير", "طلب الإذن", "التعاون المنزلي", "مهارات القيادة", "التعبير عن الرأي"] [cite: 6, 7] },
    [cite_start]{ title: "الاستقلال", icon: "fa-star", items: ["ارتداء الملابس", "ترتيب السرير", "تحضير وجبة", "اتخاذ قرارات", "إدارة المصروف", "الالتزام بالجدول", "حل المشكلات", "عناية بالنباتات", "تحمل النتيجة", "إسعافات أولية"] [cite: 7] },
    [cite_start]{ title: "رعاية الأم", icon: "fa-spa", items: ["تخصيص وقت للراحة", "ممارسة هواية", "طلب المساعدة", "التواصل مع أمهات", "تخطي شعور الذنب", "نوم كافٍ", "قراءة تربوية", "التأمل واليوجا", "تحديد الأولويات", "الاحتفال بالإنجاز"] [cite: 7] },
    [cite_start]{ title: "الأمان والحماية", icon: "fa-shield-halved", items: ["لمسات الأمان", "حفظ أرقام الطوارئ", "سلامة المنزل", "الأمان الرقمي", "التصرف عند الضياع", "قواعد مع الغرباء", "قواعد المرور", "التواصل المفتوح", "معرفة العنوان", "مواجهة التنمر"] [cite: 7, 8] },
    [cite_start]{ title: "الإبداع والخيال", icon: "fa-palette", items: ["القصص الخيالية", "اللعب الحر", "الرسم والتلوين", "الأشغال اليدوية", "تمثيل الأدوار", "تأليف قصص", "البناء بالمكعبات", "جمع كنوز الطبيعة", "الاستماع للفنون", "الفوضى الإبداعية"] [cite: 8] }
  ];

  // دالة الكاميرا ورفع الصور المدمجة بناءً على طلبك
  const takeAndUploadPhoto = async () => {
    try {
      const base64Data = await takePhoto(); [cite_start]// [cite: 23, 24]
      setIsProcessing(true); [cite_start]// [cite: 7, 8]
      const userMsgId = Date.now();
      
      setMessages(prev => [...prev, { 
        id: userMsgId, 
        text: "أرسلتُ صورة لكِ", 
        sender: 'user', 
        timestamp: new Date().toLocaleTimeString(),
        [cite_start]attachment: { type: 'image', data: base64Data } // [cite: 9, 24]
      }]);

      const fileName = `img_${userMsgId}.png`;
      const mimeType = 'image/png';
      const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, mimeType); [cite_start]// [cite: 11, 12]

      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `بصفتك أخصائي استشاري أطفال، إليك رسالتي: أرسلتُ صورة لكِ للمعاينة الطبية والتربوية. [cite_start]مرفق رابط الوسائط: ${finalAttachmentUrl}` // [cite: 14, 15, 16]
        }
      };

      const response = await CapacitorHttp.post(options);

      if (response.status === 200) {
        const aiReply = response.data.reply || response.data.message || [cite_start]"عذراً، لم أستطع فهم ذلك."; [cite: 17, 18]
        setMessages(prev => [...prev, { id: Date.now(), text: aiReply, sender: 'ai', timestamp: new Date().toLocaleTimeString() }]);
      } else {
        throw new Error(`خطأ من الخادم (Status: ${response.status})`);
      }

    } catch (err) {
      [cite_start]console.error("فشل العملية:", err); [cite: 19, 20, 21, 26]
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: `⚠️ عذراً، حدث خطأ: ${err.message || "حدث خطأ غير متوقع"}`, 
        sender: 'ai' 
      }]);
    } finally {
      setIsProcessing(false); [cite_start]// [cite: 22]
    }
  };

  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true);
    setIsChatOpen(true);
    const currentList = lists[selectedIdx];
    const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]);
    
    const systemExpertise = "بصفتك أخصائي استشاري أطفال خبير، ابحث في منصات الأطباء والتربية العالمية وقدم نصيحة دقيقة.";
    const promptMessage = customPrompt 
      ? `${systemExpertise} سؤالي هو: ${customPrompt}`
      : `${systemExpertise} المهام المنجزة: (${selectedOnes.join(" - ")}) في قسم ${currentList.title}. حلل الحالة تربوياً.`;

    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      });
      const responseText = response.data.reply || response.data.message || "لم أستطع الحصول على رد حالياً.";
      setMessages(prev => [...prev, { id: Date.now(), text: responseText, sender: 'ai', timestamp: new Date().toLocaleTimeString() }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), text: "حدث خطأ في الاتصال.", sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = (id) => setMessages(prev => prev.filter(m => m.id !== id));
  const saveReply = (msg) => {
    if (!savedReplies.find(r => r.id === msg.id)) {
      setSavedReplies(prev => [...prev, msg]);
      alert("تم حفظ الرد في المفضلة!");
    }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.specialistBtn} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-stethoscope"></i> استشاري الأطفال والتربية
        </button>
      </div>

      <header style={styles.header}>
        <h1>موسوعة رقة للتربية</h1>
        <p>دليل الأم الواعية للصحة والتربية</p>
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
        <button style={styles.analyzeBtn} onClick={() => getAIAnalysis()}>تحليل البيانات تربوياً</button>
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
              <span>استشاري الأطفال</span>
              <div style={{display: 'flex', gap: '10px'}}>
                <button onClick={() => setShowSavedList(!showSavedList)} style={styles.closeBtn}><i className="fas fa-bookmark"></i></button>
                <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
              </div>
            </div>

            <div style={styles.chatContent}>
              {showSavedList ? (
                <div>
                  <h4 style={{textAlign:'center'}}>الردود المحفوظة</h4>
                  {savedReplies.map(r => (
                    <div key={r.id} style={styles.savedItem}>
                      <p>{r.text}</p>
                      <button onClick={() => setSavedReplies(prev => prev.filter(m => m.id !== r.id))} style={styles.delBtn}>حذف من المفضلة</button>
                    </div>
                  ))}
                  <button onClick={() => setShowSavedList(false)} style={styles.analyzeBtn}>العودة للدردشة</button>
                </div>
              ) : (
                <>
                  {messages.map(msg => (
                    <div key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}>
                      <div style={styles.msgBubble}>
                        {msg.attachment?.data && <img src={msg.attachment.data} style={{width:'100%', borderRadius:'10px'}} alt="uploaded" />}
                        <p style={styles.msgText}>{msg.text}</p>
                        <div style={styles.msgFooter}>
                          <small>{msg.timestamp}</small>
                          <div>
                            {msg.sender === 'ai' && <button onClick={() => saveReply(msg)} style={styles.saveBtn}><i className="fas fa-bookmark"></i></button>}
                            <button onClick={() => deleteMessage(msg.id)} style={styles.delBtn}><i className="fas fa-trash-alt"></i></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {(isLoading || isProcessing) && <div style={styles.loading}>جاري المعالجة... ✨</div>}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.chatInputArea}>
              <div style={styles.mediaBar}>
                <button style={styles.mediaIcon} onClick={takeAndUploadPhoto}><i className="fas fa-camera"></i></button>
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('gallery')}><i className="fas fa-image"></i></button>
              </div>
              <div style={styles.inputRow}>
                <input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="اسألي الاستشاري..." style={styles.input} />
                <button onClick={() => { if(inputText.trim()) { setMessages(prev => [...prev, {id: Date.now(), text: inputText, sender:'user', timestamp: new Date().toLocaleTimeString()}]); getAIAnalysis(inputText); setInputText(""); } }} style={styles.sendBtn}><i className="fas fa-paper-plane"></i></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// التنسيقات (تتضمن الأزرار الجديدة)
const styles = {
  container: { direction: 'rtl', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf7f9', minHeight: '100vh' },
  topBar: { display: 'flex', justifyContent: 'center', marginBottom: '15px' },
  specialistBtn: { padding: '12px 25px', borderRadius: '25px', border: 'none', background: '#2e8b57', color: 'white', fontWeight: 'bold' },
  header: { textAlign: 'center', marginBottom: '20px', color: '#6a5acd' },
  navScroll: { display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' },
  navBtn: { flex: '0 0 auto', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' },
  activeNav: { background: '#ff85a2', color: 'white' },
  card: { background: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'right', marginBottom: '15px' },
  itemRow: { padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' },
  done: { textDecoration: 'line-through', color: '#ccc' },
  analyzeBtn: { width: '100%', padding: '12px', borderRadius: '25px', border: 'none', background: '#ff85a2', color: 'white', fontWeight: 'bold', marginTop: '10px' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' },
  chatBox: { width: '100%', maxWidth: '500px', height: '90vh', background: 'white', borderRadius: '25px 25px 0 0', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '15px', background: '#2e8b57', color: 'white', display: 'flex', justifyContent: 'space-between', borderRadius: '25px 25px 0 0' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' },
  chatContent: { flex: 1, overflowY: 'auto', padding: '15px', background: '#f8f9fa' },
  aiMsgRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' },
  userMsgRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
  msgBubble: { maxWidth: '80%', padding: '10px', borderRadius: '15px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  msgText: { margin: 0, fontSize: '0.9rem' },
  msgFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.7rem' },
  delBtn: { border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer' },
  saveBtn: { border: 'none', background: 'none', color: '#2e8b57', cursor: 'pointer' },
  chatInputArea: { padding: '15px', borderTop: '1px solid #eee' },
  mediaBar: { display: 'flex', justifyContent: 'center', gap: '25px', marginBottom: '10px' },
  mediaIcon: { background: 'none', border: 'none', color: '#2e8b57', fontSize: '1.2rem' },
  inputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' },
  sendBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#2e8b57', color: 'white' },
  loading: { textAlign: 'center', padding: '10px', color: '#2e8b57' },
  savedItem: { background: '#fff', padding: '10px', borderRadius: '10px', marginBottom: '10px', borderRight: '4px solid #2e8b57', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }
};

export default App;
