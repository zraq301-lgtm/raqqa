import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
[cite_start]// 1. استيراد الدوال من مسار الميديا المذكور [cite: 3]
import { takePhoto, uploadToVercel } from '../services/MediaService'; 

[cite_start]// ملاحظة: تأكدي من إضافة رابط FontAwesome في index.html للأيقونات [cite: 2]
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

const App = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  [cite_start]const [checkedItems, setCheckedItems] = useState({}); [cite: 3]
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); [cite_start]// حالة التحميل الجديدة [cite: 7]
  [cite_start]const [inputText, setInputText] = useState(""); [cite: 4]

  const chatEndRef = useRef(null);

  const lists = [
    { title: "تعديل السلوك", icon: "fa-child", items: ["التعزيز الإيجابي", "تجاهل السلوكيات المزعجة", "العواقب المنطقية", "وضع حدود واضحة", "لوحة النجوم والمكافآت", "النمذجة والقدوة", "قضاء وقت خاص", "الاستماع الفعال", "بدائل كلمة لا", "توفير بيئة آمنة"] },
    { title: "غرس القناعات", icon: "fa-heart", items: ["قيمة الصدق", "الإيمان بالقدرات", "احترام الاختلاف", "العمل الجماعي", "قيمة الامتنان", "المثابرة", "حب التعلم", "المسؤولية البيئية", "الأمانة", "الرحمة بالضعفاء"] },
    [cite_start]{ title: "الذكاء العاطفي", icon: "fa-brain", items: ["تسمية المشاعر", "مهارة التعاطف", "تنفس الهدوء", "الاعتراف بالمشاعر", "حل النزاعات سلمياً", "بناء الثقة بالنفس", "التعامل مع الخوف", "فهم لغة الجسد", "تحمل الإحباط", "تنمية التفاؤل"] }, [cite: 5]
    { title: "تطوير المعرفة", icon: "fa-book-open", items: ["القراءة اليومية", "ألعاب الألغاز", "تجارب علمية منزلية", "تعلم لغة ثانية", "الرحلات التعليمية", "الحساب الذهني", "النقاشات المفتوحة", "الثقافات العالمية", "تكنولوجيا هادفة", "تشجيع الهوايات"] },
    { title: "الصحة والنشاط", icon: "fa-apple-whole", items: ["نظام غذائي متوازن", "ساعات نوم كافية", "شرب الماء", "ممارسة الرياضة", "النظافة الشخصية", "الفحوصات الدورية", "تقليل السكريات", "وقت في الطبيعة", "المهارات الحركية", "سلامة الجسد"] },
    [cite_start]{ title: "مهارات اجتماعية", icon: "fa-users", items: ["إلقاء التحية", "مشاركة الألعاب", "آداب المائدة", "تكوين صداقات", "الاعتذار الصادق", "الاستماع للغير", "طلب الإذن", "التعاون المنزلي", "مهارات القيادة", "التعبير عن الرأي"] }, [cite: 6]
    { title: "الاستقلال", icon: "fa-star", items: ["ارتداء الملابس", "ترتيب السرير", "تحضير وجبة", "اتخاذ قرارات", "إدارة المصروف", "الالتزام بالجدول", "حل المشكلات", "عناية بالنباتات", "تحمل النتيجة", "إسعافات أولية"] },
    { title: "رعاية الأم", icon: "fa-spa", items: ["تخصيص وقت للراحة", "ممارسة هواية", "طلب المساعدة", "التواصل مع أمهات", "تخطي شعور الذنب", "نوم كافٍ", "قراءة تربوية", "التأمل واليوجا", "تحديد الأولويات", "الاحتفال بالإنجاز"] },
    [cite_start]{ title: "الأمان والحماية", icon: "fa-shield-halved", items: ["لمسات الأمان", "حفظ أرقام الطوارئ", "سلامة المنزل", "الأمان الرقمي", "التصرف عند الضياع", "قواعد مع الغرباء", "قواعد المرور", "التواصل المفتوح", "معرفة العنوان", "مواجهة التنمر"] }, [cite: 7]
    { title: "الإبداع والخيال", icon: "fa-palette", items: ["القصص الخيالية", "اللعب الحر", "الرسم والتلوين", "الأشغال اليدوية", "تمثيل الأدوار", "تأليف قصص", "البناء بالمكعبات", "جمع كنوز الطبيعة", "الاستماع للفنون", "الفوضى الإبداعية"] }
  ];

  // دالة مدمجة لفتح الكاميرا ورفع الصورة مباشرة
  const handleCameraAndUpload = async () => {
    try {
      [cite_start]// المرحلة الأولى: فتح الكاميرا والتقاط الصورة [cite: 23, 24]
      const base64Data = await takePhoto(); 
      if (!base64Data) return;

      setIsProcessing(true); [cite_start]// تفعيل حالة التحميل [cite: 7]
      [cite_start]const userMsgId = Date.now(); [cite: 8]

      [cite_start]// إضافة رسالة مؤقتة للمستخدم في الواجهة [cite: 9]
      setMessages(prev => [...prev, { 
        id: userMsgId, 
        text: "جاري رفع الصورة المعالجة...", 
        sender: 'user', 
        attachment: { type: 'image', data: base64Data } 
      }]);

      [cite_start]// المرحلة الثانية: إعداد بيانات الملف للرفع [cite: 11, 12]
      [cite_start]const fileName = `img_${userMsgId}.png`; [cite: 12]
      [cite_start]const mimeType = 'image/png'; [cite: 12]

      [cite_start]// المرحلة الثالثة: الرفع الفعلي إلى Vercel Blob عبر مسار الميديا [cite: 3, 12]
      [cite_start]const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, mimeType); [cite: 12]

      [cite_start]// المرحلة الرابعة: إرسال الرابط الناتج إلى API الذكاء الاصطناعي [cite: 14, 15]
      const options = {
        [cite_start]url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai', [cite: 14]
        [cite_start]headers: { 'Content-Type': 'application/json' }, [cite: 14]
        data: {
          [cite_start]prompt: `أنا أنثى مسلمة، مرفق رابط الصورة: ${finalAttachmentUrl}` [cite: 14, 15]
        }
      };

      [cite_start]const response = await CapacitorHttp.post(options); [cite: 16]
      
      if (response.status === 200) {
        const aiReply = response.data.reply || response.data.message || [cite_start]"تم استلام الصورة ومعالجتها."; [cite: 17]
        [cite_start]setMessages(prev => [...prev, { id: Date.now(), text: aiReply, sender: 'ai', timestamp: new Date().toLocaleTimeString() }]); [cite: 18]
      }

    } catch (error) {
      console.error("خطأ في الكاميرا أو الرفع:", error);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: `⚠️ فشل: ${error.message || "تأكدي من صلاحيات الكاميرا والإنترنت"}`, 
        sender: 'ai' 
      [cite_start]}]); [cite: 21]
    } finally {
      [cite_start]setIsProcessing(false); [cite: 22]
    }
  };

  const saveDataToDB = async (selectedOnes) => {
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1,
          category: lists[selectedIdx].title,
          value: selectedOnes[0] || "إنجاز تربوي",
          note: `تم تحليل بيانات قسم ${lists[selectedIdx].title}`
        }
      [cite_start]}); [cite: 8, 9]
    } catch (e) {
      [cite_start]console.error("DB Save Error:", e); [cite: 10]
    }
  };

  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true);
    setIsChatOpen(true);

    const currentList = lists[selectedIdx];
    [cite_start]const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]); [cite: 12]
    
    [cite_start]if (!customPrompt) saveDataToDB(selectedOnes); [cite: 12]

    const promptMessage = customPrompt || 
      `أنا أم أطلب استشارة تربوية. لقد قمت بمتابعة: (${selectedOnes.join(" - ")}) في قسم ${currentList.title}. [cite_start]بصفتك متخصص تربوي خبير، حللي هذه المدخلات وقدمي نصائح عملية.`; [cite: 13]

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      [cite_start]}; [cite: 14]

      [cite_start]const response = await CapacitorHttp.post(options); [cite: 15]
      const responseText = response.data.reply || response.data.message || "لم أستطع الحصول على رد حالياً.";
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      [cite_start]}]); [cite: 16]
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.", 
        sender: 'ai' 
      [cite_start]}]); [cite: 17]
    } finally {
      [cite_start]setIsLoading(false); [cite: 18]
    }
  };

  const deleteMessage = (id) => {
    [cite_start]setMessages(prev => prev.filter(m => m.id !== id)); [cite: 19]
  };

  [cite_start]const handleMedia = (type) => alert(`تم فتح ${type} بنجاح. (تحليل الوسائط سيفعل قريباً)`); [cite: 20]

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  [cite_start]}, [messages]); [cite: 21]

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.specialistBtn} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-user-md"></i> متخصص تربوي
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
        [cite_start]))} [cite: 23, 24]
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
          [cite_start]))} [cite: 25, 26]
        </div>
        <button style={styles.analyzeBtn} onClick={() => getAIAnalysis()}>
          <i className="fas fa-brain"></i> التحليل والحفظ التربوي
        </button>
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
              <span><i className="fas fa-comment-medical"></i> المتخصص التربوي</span>
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
            </div>

            <div style={styles.chatContent}>
              [cite_start]{messages.length === 0 && <p style={styles.emptyMsg}>أهلاً بكِ.. كيف يمكنني مساعدتكِ تربوياً اليوم؟</p>} [cite: 28]
              {messages.map(msg => (
                <div key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}>
                  <div style={styles.msgBubble}>
                    {msg.attachment?.type === 'image' && (
                      <img src={msg.attachment.data} alt="uploaded" style={{ width: '100%', borderRadius: '10px', marginBottom: '5px' }} />
                    )}
                    <p style={styles.msgText}>{msg.text}</p>
                    <div style={styles.msgFooter}>
                      <small>{msg.timestamp}</small>
                      <button onClick={() => deleteMessage(msg.id)} style={styles.delBtn}>
                        <i className="fas fa-trash-alt"></i> حذف
                      </button>
                    </div>
                  </div>
                </div>
              [cite_start]))} [cite: 29, 30]
              {(isLoading || isProcessing) && <div style={styles.loading}>جاري التحليل... ✨</div>}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.chatInputArea}>
              <div style={styles.mediaBar}>
                {/* تفعيل زر الكاميرا بالدالة المطلوبة */}
                <button style={styles.mediaIcon} onClick={handleCameraAndUpload}><i className="fas fa-camera"></i></button>
                <button style={styles.mediaIcon} onClick={() => handleMedia('الصور')}><i className="fas fa-image"></i></button>
                [cite_start]<button style={styles.mediaIcon} onClick={() => handleMedia('الميكروفون')}><i className="fas fa-microphone"></i></button> [cite: 31, 32]
              </div>
              <div style={styles.inputRow}>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اكتبي سؤالكِ هنا..."
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
                [cite_start]</button> [cite: 34, 35]
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
  specialistBtn: { padding: '10px 20px', borderRadius: '20px', border: 'none', background: '#6a5acd', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
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
  chatHeader: { padding: '15px', background: '#6a5acd', color: 'white', display: 'flex', justifyContent: 'space-between', borderRadius: '25px 25px 0 0' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.5rem' },
  chatContent: { flex: 1, overflowY: 'auto', padding: '15px', background: '#f8f9fa' },
  aiMsgRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' },
  userMsgRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
  msgBubble: { maxWidth: '80%', padding: '10px', borderRadius: '15px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  msgText: { margin: 0, fontSize: '0.9rem', lineHeight: '1.5' },
  msgFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.7rem', color: '#999' },
  delBtn: { border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer' },
  chatInputArea: { padding: '15px', borderTop: '1px solid #eee' },
  mediaBar: { display: 'flex', justifyContent: 'center', gap: '25px', marginBottom: '10px' },
  mediaIcon: { background: 'none', border: 'none', color: '#6a5acd', fontSize: '1.2rem' },
  inputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' },
  sendBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#6a5acd', color: 'white' },
  loading: { textAlign: 'center', padding: '10px', color: '#6a5acd' },
  emptyMsg: { textAlign: 'center', marginTop: '40px', color: '#ccc' }
};

export default App;
