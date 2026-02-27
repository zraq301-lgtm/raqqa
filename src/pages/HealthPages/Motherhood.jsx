import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
// استيراد الخدمات من المسار المحدد
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';
const App = () => {
  // حالات الحالة (States)
  const [selectedIdx, setSelectedIdx] = useState(0);
const [checkedItems, setCheckedItems] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
const [inputText, setInputText] = useState("");
  const [savedReplies, setSavedReplies] = useState([]); // قائمة حفظ الردود
  const [isProcessing, setIsProcessing] = useState(false);
// حالة معالجة الصور

  const chatEndRef = useRef(null);

  const lists = [
    { title: "تعديل السلوك", icon: "fa-child", items: ["التعزيز الإيجابي", "تجاهل السلوكيات المزعجة", "العواقب المنطقية", "وضع حدود واضحة", "لوحة النجوم والمكافآت", "النمذجة والقدوة", "قضاء وقت خاص", "الاستماع الفعال", "بدائل كلمة لا", "توفير بيئة آمنة"] },
    { title: "غرس القناعات", icon: "fa-heart", items: ["قيمة الصدقة", "الإيمان بالقدرات", "احترام الاختلاف", "العمل الجماعي", "قيمة الامتنان", "المثابرة", "حب التعلم", "المسؤولية البيئية", "الأمانة", "الرحمة بالضعفاء"] },
    { title: "الذكاء العاطفي", icon: "fa-brain", items: ["تسمية المشاعر", "مهارة التعاطف", "تنفس الهدوء", "الاعتراف بالمشاعر", "حل النزاعات سلمياً", 
"بناء الثقة بالنفس", "التعامل مع الخوف", "فهم لغة الجسد", "تحمل الإحباط", "تنمية التفاؤل"] },
    { title: "تطوير المعرفة", icon: "fa-book-open", items: ["القراءة اليومية", "ألعاب الألغاز", "تجارب علمية منزلية", "تعلم لغة ثانية", "الرحلات التعليمية", "الحساب الذهني", "النقاشات المفتوحة", "الثقافات العالمية", "تكنولوجيا هادفة", "تشجيع الهوايات"] },
    { title: "الصحة والنشاط", icon: "fa-apple-whole", items: ["نظام غذائي متوازن", "ساعات نوم كافية", "شرب الماء", "ممارسة الرياضة", "النظافة الشخصية", "الفحوصات الدورية", "تقليل السكريات", "وقت في الطبيعة", "المهارات الحركية", "سلامة الجسد"] },
    { title: "مهارات اجتماعية", icon: "fa-users", items: ["إلقاء التحية", "مشاركة الألعاب", "آداب المائدة", "تكوين صداقات", "الاعتذار 
الصادق", "الاستماع للغير", "طلب الإذن", "التعاون المنزلي", "مهارات القيادة", "التعبير عن الرأي"] },
    { title: "الاستقلال", icon: "fa-star", items: ["ارتداء الملابس", "ترتيب السرير", "تحضير وجبة", "اتخاذ قرارات", "إدارة المصروف", "الالتزام بالجدول", "حل المشكلات", "عناية بالنباتات", "تحمل النتيجة", "إسعافات أولية"] },
    { title: "رعاية الأم", icon: "fa-spa", items: ["تخصيص وقت للراحة", "ممارسة هواية", "طلب المساعدة", "التواصل مع أمهات", "تخطي شعور الذنب", "نوم كافٍ", "قراءة تربوية", "التأمل واليوجا", "تحديد الأولويات", "الاحتفال بالإنجاز"] },
    { title: "الأمان والحماية", icon: "fa-shield-halved", items: ["لمسات الأمان", "حفظ أرقام الطوارئ", "سلامة المنزل", "الأمان الرقمي", "التصرف عند الضياع", "قواعد 
مع الغرباء", "قواعد المرور", "التواصل المفتوح", "معرفة العنوان", "مواجهة التنمر"] },
    { title: "الإبداع والخيال", icon: "fa-palette", items: ["القصص الخيالية", "اللعب الحر", "الرسم والتلوين", "الأشغال اليدوية", "تمثيل الأدوار", "تأليف قصص", "البناء بالمكعبات", "جمع كنوز الطبيعة", "الاستماع للفنون", "الفوضى الإبداعية"] }
  ];
// دالة حفظ البيانات في قاعدة البيانات
  const saveDataToDB = async (selectedOnes) => {
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1,
          category: lists[selectedIdx].title,
          value: selectedOnes[0] || "إنجاز جديد",
        
   note: `تحليل قسم ${lists[selectedIdx].title}`
        }
      });
} catch (e) {
      console.error("خطأ في حفظ البيانات:", e);
    }
  };
/**
   * دالة مدمجة لفتح الكاميرا ورفع الصورة مباشرة (بناءً على طلبك)
   */
  const handleCameraAndUpload = async () => {
    try {
      const base64Data = await takePhoto();
if (!base64Data) return;

      setIsProcessing(true);
      const userMsgId = Date.now();

      setMessages(prev => [...prev, { 
        id: userMsgId, 
        text: "جاري رفع الصورة المعالجة...", 
        sender: 'user', 
        attachment: { type: 'image', data: base64Data },
        timestamp: new Date().toLocaleTimeString()
      }]);
const fileName = `img_${userMsgId}.png`;
      const mimeType = 'image/png';

      const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, mimeType);
const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنا أنثى مسلمة، مرفق رابط الصورة: ${finalAttachmentUrl}`
        }
      };
const response = await CapacitorHttp.post(options);
      
      if (response.status === 200) {
        const aiReply = response.data.reply ||
        response.data.message || "تم استلام الصورة ومعالجتها.";
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: aiReply, 
          sender: 'ai', 
          timestamp: new Date().toLocaleTimeString() 
        }]);
}

    } catch (error) {
      console.error("خطأ في الكاميرا أو الرفع:", error);
setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: `⚠️ فشل: ${error.message || "تأكدي من صلاحيات الكاميرا"}`, 
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      }]);
} finally {
      setIsProcessing(false);
    }
  };
// دالة الحصول على تحليل الذكاء الاصطناعي
  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true);
setIsChatOpen(true);

    const currentList = lists[selectedIdx];
    const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]);
    
    if (!customPrompt) saveDataToDB(selectedOnes);
const systemRole = "أنت الآن استشاري طب أطفال خبير وموجه تربوي. استخدم معرفتك الطبية من مكتبات طب الأطفال ومجموعات الأطباء المتخصصة لتقديم ردود دقيقة وموثوقة للأمهات.";
const promptMessage = customPrompt 
      ?
`${systemRole} \n السؤال: ${customPrompt}`
      : `${systemRole} \n لقد قامت الأم بإنجاز المهام التالية: (${selectedOnes.join(" - ")}) في مجال ${currentList.title}.
قدم لها تحليلاً طبياً وتربوياً لهذه الإنجازات.`;

    try {
      const { data } = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      });
const responseText = data.reply || data.message || "عذراً، لم أستطع تحليل البيانات حالياً.";
setMessages(prev => [...prev, {
        id: Date.now(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      }]);
} catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), text: "خطأ في الاتصال بالاستشاري.", sender: 'ai' }]);
} finally {
      setIsLoading(false);
    }
  };
// وظائف الردود المحفوظة
  const saveReply = (text) => {
    if (!savedReplies.includes(text)) {
      setSavedReplies([...savedReplies, text]);
alert("تم حفظ الرد في المفضلة");
    }
  };

  const deleteSavedReply = (index) => {
    const newList = savedReplies.filter((_, i) => i !== index);
setSavedReplies(newList);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
return (
    <div style={styles.container}>
      {/* البار العلوي */}
      <div style={styles.topBar}>
        <button style={styles.specialistBtn} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-user-md"></i> استشاري أطفال متخصص
        </button>
      </div>

      <header style={styles.header}>
        <h1>موسوعة رقة للتربية</h1>
        <p>دليلك الصحي والتربيوي المتكامل</p>
      </header>

   
   {/* التنقل بين الأقسام */}
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
      </div>

      {/* قائمة المهام */}
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
              <span style={checkedItems[`${selectedIdx}-${item}`] ?
styles.done : {}}>{item}</span>
            </label>
          ))}
        </div>
        <button style={styles.analyzeBtn} onClick={() => getAIAnalysis()}>
          <i className="fas fa-stethoscope"></i> استشارة الذكاء الاصطناعي الطبي
        </button>
      </div>

      {/* قسم الردود المحفوظة (جديد) */}
      {savedReplies.length > 0 && (
     
    <div style={styles.savedSection}>
          <h3><i className="fas fa-bookmark"></i> الردود المحفوظة</h3>
          {savedReplies.map((reply, index) => (
            <div key={index} style={styles.savedItem}>
              <p>{reply.substring(0, 50)}...</p>
              <button onClick={() => deleteSavedReply(index)} style={styles.deleteBtn}>
                <i className="fas fa-trash"></i>
    
           </button>
            </div>
          ))}
        </div>
      )}

      {/* نافذة المحادثة */}
      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
    
           <span>استشاري الأطفال والتربية</span>
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
            </div>
            
            <div style={styles.chatContent}>
              {messages.map(msg => (
                <div 
key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}>
                  <div style={styles.msgBubble}>
                    <p style={styles.msgText}>{msg.text}</p>
                    <div style={styles.msgFooter}>
                      <small style={styles.msgTime}>{msg.timestamp}</small>
         
              {msg.sender === 'ai' && (
                        <button onClick={() => saveReply(msg.text)} style={styles.saveIconBtn}>
                          <i className="fas fa-save"></i>
                        </button>
   
                    )}
                    </div>
                  </div>
                </div>
              ))}
             
  {(isLoading || isProcessing) && <div style={styles.loading}>جاري معالجة طلبك طبياً...</div>}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.chatInputArea}>
              <div style={styles.mediaBar}>
                {/* زر الكاميرا الجديد */}
               
  <button onClick={handleCameraAndUpload} style={styles.mediaIcon}>
                  <i className="fas fa-camera"></i> الكاميرا
                </button>
                <button onClick={() => handleMediaAction('gallery')} style={styles.mediaIcon}>
                  <i className="fas fa-image"></i> المعرض
                </button>
   
            </div>
              <div style={styles.inputRow}>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اسألي 
الاستشاري هنا..."
                  style={styles.input}
                />
                <button onClick={() => { if(inputText.trim()){ getAIAnalysis(inputText);
setInputText(""); } }} style={styles.sendBtn}>
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

// التنسيقات (Styles)
const styles = {
  container: { direction: 'rtl', padding: '15px', backgroundColor: '#fdf7f9', minHeight: '100vh', fontFamily: 'sans-serif' },
  topBar: { display: 'flex', justifyContent: 'center', marginBottom: '15px' },
  specialistBtn: { padding: '10px 20px', borderRadius: '20px', border: 'none', background: '#2e8b57', color: 'white', fontWeight: 'bold' },
  header: { textAlign: 'center', color: '#6a5acd', marginBottom: '20px' },
  navScroll: { display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' },
  navBtn: { flex: '0 0 auto', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' },
  activeNav: { background: 
'#ff85a2', color: 'white' },
  card: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' },
  done: { textDecoration: 'line-through', color: '#ccc' },
  analyzeBtn: { width: '100%', marginTop: '20px', padding: '12px', borderRadius: '25px', border: 'none', background: '#ff85a2', color: 'white', fontWeight: 'bold' },
  chatOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' },
  chatBox: { width: '100%', height: '85vh', background: 'white', borderRadius: '20px 20px 0 0', 
display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '15px', background: '#2e8b57', color: 'white', display: 'flex', justifyContent: 'space-between' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '20px' },
  chatContent: { flex: 1, overflowY: 'auto', padding: '15px' },
  aiMsgRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' },
  userMsgRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
  msgBubble: { maxWidth: '80%', padding: '12px', borderRadius: '15px', background: '#f0f0f0', position: 'relative' },
  msgFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' },
  saveIconBtn: { background: 'none', border: 'none', color: '#2e8b57', cursor: 'pointer' },
  
msgText: { margin: 0 },
  msgTime: { fontSize: '10px', color: '#999' },
  chatInputArea: { padding: '15px', borderTop: '1px solid #eee' },
  mediaBar: { display: 'flex', gap: '20px', marginBottom: '10px', justifyContent: 'center' },
  mediaIcon: { background: '#f0f0f0', padding: '5px 15px', borderRadius: '15px', border: 'none', color: '#2e8b57', fontSize: '14px' },
  inputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' },
  sendBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#2e8b57', color: 'white' },
  loading: { textAlign: 'center', fontSize: '12px', color: '#2e8b57', padding: 
'10px' },
  savedSection: { marginTop: '20px', padding: '15px', background: '#fff', borderRadius: '20px' },
  savedItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' },
  deleteBtn: { background: 'none', border: 'none', color: '#ff4d4d' }
};
export default App;
