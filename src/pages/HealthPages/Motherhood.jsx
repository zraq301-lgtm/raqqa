import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
[cite_start]// ملاحظة: تأكدي من إضافة رابط FontAwesome في index.html للأيقونات [cite: 2]
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

// استيراد خدمة الميديا المخصصة لنظام APK
import { takePhoto, pickImage } from '../services/MediaService';

const App = () => {
  [cite_start]const [selectedIdx, setSelectedIdx] = useState(0); [cite: 2]
  [cite_start]const [checkedItems, setCheckedItems] = useState({}); [cite: 3]
  [cite_start]const [isChatOpen, setIsChatOpen] = useState(false); [cite: 3]
  [cite_start]const [messages, setMessages] = useState([]); [cite: 3]
  [cite_start]const [isLoading, setIsLoading] = useState(false); [cite: 3]
  [cite_start]const [inputText, setInputText] = useState(""); [cite: 4]
  [cite_start]const [savedReplies, setSavedReplies] = useState([]); [cite: 4]

  [cite_start]const chatEndRef = useRef(null); [cite: 4]

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
  [cite_start]]; [cite: 5, 6, 7, 8]

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
      [cite_start]}); [cite: 9, 10]
    } catch (e) {
      [cite_start]console.error("DB Save Error:", e); [cite: 11]
    }
  };

  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true);
    setIsChatOpen(true);

    const currentList = lists[selectedIdx];
    [cite_start]const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]); [cite: 13]
    
    [cite_start]if (!customPrompt) saveDataToDB(selectedOnes); [cite: 13]

    [cite_start]const systemExpertise = "بصفتك أخصائي تغذية علاجية ومدرب رشاقة وتخسيس خبير، قدم لي نصيحة طبية رياضية دقيقة."; [cite: 13]
    const promptMessage = customPrompt 
      ? [cite_start]`${systemExpertise} سؤالي هو: ${customPrompt}` [cite: 14, 15]
      : `${systemExpertise} لقد تابعت المهام التالية: (${selectedOnes.join(" - ")}) in قسم ${currentList.title}. [cite_start]حلل حالتي وقدم نصائح للرشاقة والتغذية.`; [cite: 15, 16]

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      };
      [cite_start]const response = await CapacitorHttp.post(options); [cite: 16, 17]
      const responseText = response.data.reply || response.data.message || [cite_start]"لم أستطع الحصول على رد حالياً."; [cite: 17]
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      [cite_start]}]); [cite: 18]
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.", 
        sender: 'ai' 
      [cite_start]}]); [cite: 19]
    } finally {
      [cite_start]setIsLoading(false); [cite: 20]
    }
  };

  // وظيفة فتح الكاميرا ورفع الصور المعدلة لنظام APK
  const handleMediaAction = async (type) => {
    try {
        let imageUrl = "";
        if (type === 'camera') {
            imageUrl = await takePhoto(); // استخدام دالة الكاميرا من MediaService
        } else {
            imageUrl = await pickImage(); // استخدام دالة المعرض من MediaService
        }

        if (imageUrl) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: `تم رفع صورة بنجاح: ${imageUrl}`,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString(),
                image: imageUrl // إضافة الصورة للرسالة
            }]);
            // هنا يمكن إرسال الرابط للذكاء الاصطناعي لتحليله إذا لزم الأمر
        }
    } catch (error) {
        console.error("فشل في معالجة أو رفع الصورة:", error);
        [cite_start]alert("حدث خطأ أثناء الوصول للكاميرا أو رفع الصورة."); [cite: 27]
    }
  };

  const deleteMessage = (id) => {
    [cite_start]setMessages(prev => prev.filter(m => m.id !== id)); [cite: 28]
  };

  const saveReply = (msg) => {
    setSavedReplies(prev => [...prev, msg]);
    [cite_start]alert("تم حفظ الرد في قائمتك المفضلة!"); [cite: 29]
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  [cite_start]}, [messages]); [cite: 30]

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.specialistBtn} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-stethoscope"></i> استشاري الرشاقة والتغذية
        </button>
      </div>

      <header style={styles.header}>
        <h1>موسوعة رقة للتربية والرشاقة</h1>
        <p>دليل الأم الواعية للصحة والتربية</p>
      [cite_start]</header> [cite: 31, 32]

      <div style={styles.navScroll}>
        {lists.map((list, i) => (
          <button 
            key={i} 
            style={{...styles.navBtn, ...(selectedIdx === i ? styles.activeNav : {})}}
            onClick={() => setSelectedIdx(i)}>
            <i className={`fas ${list.icon}`}></i>
            <span>{list.title}</span>
          </button>
        ))}
      [cite_start]</div> [cite: 32, 33]

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
          ))}
        [cite_start]</div> [cite: 33, 34, 35]
        <button style={styles.analyzeBtn} onClick={() => getAIAnalysis()}>
          <i className="fas fa-microchip"></i> تحليل البيانات صحياً وتربوياً
        </button>
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
              <span><i className="fas fa-weight"></i> أخصائي الرشاقة والتغذية</span>
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
            </div>

            <div style={styles.chatContent}>
              [cite_start]{messages.length === 0 && <p style={styles.emptyMsg}>أهلاً بكِ.. أنا متخصص في الرشاقة والتغذية الطبية، كيف يمكنني مساعدتكِ اليوم؟</p>} [cite: 36, 37]
              {messages.map(msg => (
                <div key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}>
                  <div style={styles.msgBubble}>
                    {msg.image && <img src={msg.image} alt="uploaded" style={{width: '100%', borderRadius: '10px', marginBottom: '5px'}} />}
                    <p style={styles.msgText}>{msg.text}</p>
                    <div style={styles.msgFooter}>
                      <small>{msg.timestamp}</small>
                      <div style={{display: 'flex', gap: '5px'}}>
                        {msg.sender === 'ai' && (
                          <button onClick={() => saveReply(msg)} style={styles.saveBtn}>
                            <i className="fas fa-bookmark"></i> حفظ
                          </button>
                        )}
                        <button onClick={() => deleteMessage(msg.id)} style={styles.delBtn}>
                          <i className="fas fa-trash-alt"></i> حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              [cite_start]))} [cite: 37, 38, 39, 40, 41]
              {isLoading && <div style={styles.loading}>جاري تحليل البيانات الصحية... ✨</div>}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.chatInputArea}>
              <div style={styles.mediaBar}>
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('camera')}><i className="fas fa-camera"></i></button>
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('gallery')}><i className="fas fa-image"></i></button>
                <button style={styles.mediaIcon}><i className="fas fa-microphone"></i></button>
              [cite_start]</div> [cite: 42, 43]
              <div style={styles.inputRow}>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اسألي عن التغذية أو التمارين..."
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
};

export default App;
