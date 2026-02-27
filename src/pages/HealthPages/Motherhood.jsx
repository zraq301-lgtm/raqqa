import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { Send, Image as ImageIcon, Camera, Loader2, Save, Trash2, Stethoscope, Bookmark } from 'lucide-react';
// استيراد الخدمات من المسار المحدد [cite: 2, 59]
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

const App = () => {
  // حالات الحالة (States) [cite: 3, 4, 5, 60, 61]
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, text: "أهلاً بكِ، كيف أساعدكِ؟", sender: 'ai' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [savedReplies, setSavedReplies] = useState([]); 
  const [isProcessing, setIsProcessing] = useState(false);
  
  const chatEndRef = useRef(null);

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
  ];

  // دالة حفظ البيانات [cite: 10, 11]
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
   * دالة مدمجة لفتح الكاميرا ورفع الصورة [cite: 13, 14, 15, 68]
   */
  const handleCameraAndUpload = async (type = 'camera') => {
    try {
      const base64Data = type === 'camera' ? await takePhoto() : await fetchImage(); [cite: 13, 80]
      if (!base64Data) return; [cite: 14]

      setIsProcessing(true); [cite: 14, 64]
      setIsChatOpen(true); [cite: 23]
      const userMsgId = Date.now();

      setMessages(prev => [...prev, { 
        id: userMsgId, 
        text: type === 'camera' ? "أرسلتُ صورة من الكاميرا" : "أرسلتُ صورة من المعرض", 
        sender: 'user', 
        attachment: { type: 'image', data: base64Data },
        timestamp: new Date().toLocaleTimeString()
      }]); [cite: 14, 65]

      const fileName = `img_${userMsgId}.png`; [cite: 15, 68]
      const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, 'image/png'); [cite: 15, 68]

      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنا أنثى مسلمة، مرفق رابط الصورة: ${finalAttachmentUrl}`
        }
      }; [cite: 16, 70, 71]

      const response = await CapacitorHttp.post(options); [cite: 17, 72]
      
      if (response.status === 200) {
        const aiReply = response.data.reply || response.data.message || "تم معالجة الصورة بنجاح."; [cite: 18, 73]
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: aiReply, 
          sender: 'ai', 
          timestamp: new Date().toLocaleTimeString() 
        }]); [cite: 18, 74]
      }
    } catch (error) {
      console.error("خطأ في المعالجة:", error);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: `⚠️ فشل: ${error.message || "تأكدي من الاتصال بالإنترنت"}`, 
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      }]); [cite: 20, 77]
    } finally {
      setIsProcessing(false); [cite: 21, 78]
    }
  };

  // دالة الحصول على تحليل الذكاء الاصطناعي [cite: 22, 23, 24, 25, 26, 27]
  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true); [cite: 22]
    setIsChatOpen(true); [cite: 23]

    const currentList = lists[selectedIdx];
    const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]);
    
    if (!customPrompt) saveDataToDB(selectedOnes); [cite: 23]

    const systemRole = "أنت الآن استشاري طب أطفال خبير وموجه تربوي. استخدم معرفتك الطبية من مكتبات طب الأطفال ومجموعات الأطباء المتخصصة لتقديم ردود دقيقة وموثوقة للأمهات."; [cite: 24]
    const promptMessage = customPrompt 
      ? `${systemRole} \n السؤال: ${customPrompt}` [cite: 26]
      : `${systemRole} \n لقد قامت الأم بإنجاز المهام التالية: (${selectedOnes.join(" - ")}) في مجال ${currentList.title}. قدم لها تحليلاً طبياً وتربوياً لهذه الإنجازات.`; [cite: 26, 27]

    try {
      const { data } = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      }); [cite: 27]
      const responseText = data.reply || data.message || "عذراً، لم أستطع تحليل البيانات حالياً."; [cite: 28]
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      }]); [cite: 29]
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), text: "خطأ في الاتصال بالاستشاري.", sender: 'ai' }]); [cite: 30]
    } finally {
      setIsLoading(false); [cite: 31]
    }
  };

  const saveReply = (text) => {
    if (!savedReplies.includes(text)) {
      setSavedReplies([...savedReplies, text]); [cite: 32]
      alert("تم حفظ الرد في المفضلة"); [cite: 33]
    }
  };

  const deleteSavedReply = (index) => {
    setSavedReplies(savedReplies.filter((_, i) => i !== index)); [cite: 34]
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); [cite: 34, 62]
  }, [messages]);

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.specialistBtn} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-user-md"></i> استشاري أطفال متخصص [cite: 35]
        </button>
      </div>

      <header style={styles.header}>
        <h1>موسوعة رقة للتربية</h1>
        <p>دليلك الصحي والتربيوي المتكامل</p> [cite: 35]
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
        ))} [cite: 36, 37]
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>{lists[selectedIdx].title}</h2> [cite: 37]
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
          ))} [cite: 38, 39]
        </div>
        <button style={styles.analyzeBtn} onClick={() => getAIAnalysis()}>
          <Stethoscope size={18} style={{marginLeft: '8px'}} /> استشارة الذكاء الاصطناعي الطبي [cite: 39]
        </button>
      </div>

      {savedReplies.length > 0 && (
        <div style={styles.savedSection}>
          <h3><Bookmark size={18} /> الردود المحفوظة</h3>
          {savedReplies.map((reply, index) => (
            <div key={index} style={styles.savedItem}>
              <p>{reply.substring(0, 50)}...</p>
              <button onClick={() => deleteSavedReply(index)} style={styles.deleteBtn}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )} [cite: 40, 41]

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
              <span>استشاري الأطفال والتربية</span> [cite: 42]
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
            </div>
            
            <div style={styles.chatContent}>
              {messages.map(msg => (
                <div key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}>
                  <div style={styles.msgBubble}>
                    <p style={styles.msgText}>{msg.text}</p> [cite: 43]
                    {msg.attachment && <div style={{fontSize: '10px', opacity: 0.7, fontStyle: 'italic'}}>(تم إرسال وسائط للمعالجة...)</div>} [cite: 88]
                    <div style={styles.msgFooter}>
                      <small style={styles.msgTime}>{msg.timestamp}</small>
                      {msg.sender === 'ai' && (
                        <button onClick={() => saveReply(msg.text)} style={styles.saveIconBtn}>
                          <Save size={14} />
                        </button>
                      )}
                    </div> [cite: 43, 44]
                  </div>
                </div>
              ))}
              {(isLoading || isProcessing) && (
                <div style={styles.loading}>
                  <Loader2 className="animate-spin" size={16} /> جاري معالجة طلبك طبياً...
                </div>
              )} [cite: 46]
              <div ref={chatEndRef} />
            </div>

            <div style={styles.chatInputArea}>
              <div style={styles.mediaBar}>
                <button onClick={() => handleCameraAndUpload('camera')} style={styles.mediaIcon}>
                  <Camera size={18} /> <span>كاميرا</span>
                </button>
                <button onClick={() => handleCameraAndUpload('gallery')} style={styles.mediaIcon}>
                  <ImageIcon size={18} /> <span>معرض</span>
                </button> [cite: 47, 88, 89]
              </div>
              <div style={styles.inputRow}>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اسألي الاستشاري هنا..."
                  style={styles.input}
                />
                <button 
                  onClick={() => { if(inputText.trim()){ getAIAnalysis(inputText); setInputText(""); } }} 
                  style={styles.sendBtn}
                  disabled={isLoading || isProcessing}
                >
                  {isLoading || isProcessing ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                </button> [cite: 49, 50, 94]
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// التنسيقات (Styles) [cite: 51, 52, 53, 54, 55]
const styles = {
  container: { direction: 'rtl', padding: '15px', backgroundColor: '#fdf7f9', minHeight: '100vh', fontFamily: 'sans-serif' },
  topBar: { display: 'flex', justifyContent: 'center', marginBottom: '15px' },
  specialistBtn: { padding: '10px 20px', borderRadius: '20px', border: 'none', background: '#2e8b57', color: 'white', fontWeight: 'bold' },
  header: { textAlign: 'center', color: '#6a5acd', marginBottom: '20px' },
  navScroll: { display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' },
  navBtn: { flex: '0 0 auto', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' },
  activeNav: { background: '#ff85a2', color: 'white' },
  card: { background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' },
  done: { textDecoration: 'line-through', color: '#ccc' },
  analyzeBtn: { width: '100%', marginTop: '20px', padding: '12px', borderRadius: '25px', border: 'none', background: '#ff85a2', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  chatOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' },
  chatBox: { width: '100%', height: '85vh', background: 'white', borderRadius: '20px 20px 0 0', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '15px', background: '#2e8b57', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '24px' },
  chatContent: { flex: 1, overflowY: 'auto', padding: '15px' },
  aiMsgRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' },
  userMsgRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
  msgBubble: { maxWidth: '80%', padding: '12px', borderRadius: '15px', background: '#f0f0f0' },
  msgFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' },
  saveIconBtn: { background: 'none', border: 'none', color: '#2e8b57', cursor: 'pointer' },
  msgText: { margin: 0, fontSize: '14px', lineHeight: '1.5' },
  msgTime: { fontSize: '10px', color: '#999' },
  chatInputArea: { padding: '15px', borderTop: '1px solid #eee', background: '#fff' },
  mediaBar: { display: 'flex', gap: '15px', marginBottom: '10px', justifyContent: 'center' },
  mediaIcon: { background: '#f8f9fa', padding: '8px 15px', borderRadius: '12px', border: '1px solid #eee', color: '#2e8b57', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' },
  inputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' },
  sendBtn: { width: '45px', height: '45px', borderRadius: '50%', border: 'none', background: '#2e8b57', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  loading: { textAlign: 'center', fontSize: '12px', color: '#2e8b57', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  savedSection: { marginTop: '20px', padding: '15px', background: '#fff', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  savedItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' },
  deleteBtn: { background: 'none', border: 'none', color: '#ff4d4d' }
};

export default App; [cite: 56, 95]
