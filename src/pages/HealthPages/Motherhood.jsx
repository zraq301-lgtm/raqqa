import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
[cite_start]// استيراد الخدمات من المسار المحدد [cite: 2]
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

const App = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  [cite_start]// قائمة لحفظ الردود [cite: 5]
  const [savedReplies, setSavedReplies] = useState([]);

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
   * [cite_start]دالة متكاملة لفتح الوسائط ورفع الصور مباشرة [cite: 12]
   */
  const handleMediaAction = async (type) => {
    try {
      [cite_start]// 1. تفعيل الكاميرا أو المعرض وجلب البيانات بصيغة Base64 [cite: 12, 13]
      const base64Data = type === 'camera' ? await takePhoto() : await fetchImage();
      if (!base64Data) return;

      [cite_start]// 2. إعداد بيانات الرفع (توليد اسم فريد ونوع الملف) [cite: 13]
      const timestamp = Date.now();
      const fileName = `img_${timestamp}.png`;
      const mimeType = 'image/png';

      [cite_start]// 3. رفع الصورة مباشرة إلى Vercel Blob [cite: 14]
      const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, mimeType);
      
      [cite_start]// إرسال رسالة للمستخدم برابط الرفع [cite: 14]
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `تم رفع صورة للمعاينة: ${finalAttachmentUrl}`,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString()
      }]);

      [cite_start]// 4. إرسال الصورة للذكاء الاصطناعي للتحليل [cite: 15]
      getAIAnalysis(`يرجى معاينة هذه الصورة طبياً: ${finalAttachmentUrl}`);

      return finalAttachmentUrl;

    } catch (error) {
      [cite_start]console.error("فشل في معالجة أو رفع الصورة:", error); [cite: 16]
      [cite_start]alert("حدث خطأ أثناء الوصول للكاميرا أو رفع الصورة."); [cite: 17]
    }
  };

  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true);
    setIsChatOpen(true);

    const currentList = lists[selectedIdx];
    const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]);
    
    if (!customPrompt) saveDataToDB(selectedOnes);

    const systemRole = "أنت الآن استشاري طب أطفال خبير وموجه تربوي. استخدم معرفتك الطبية من مكتبات طب الأطفال ومجموعات الأطباء المتخصصة لتقديم ردود دقيقة وموثوقة للأمهات.";
    const promptMessage = customPrompt 
      ? [cite_start]`${systemRole} \n السؤال: ${customPrompt}` [cite: 21]
      : `${systemRole} \n لقد قامت الأم بإنجاز المهام التالية: (${selectedOnes.join(" - ")}) في مجال ${currentList.title}. [cite_start]قدم لها تحليلاً طبياً وتربوياً لهذه الإنجازات.`; [cite: 21, 22]

    try {
      const { data } = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      });
      const responseText = data.reply || data.message || [cite_start]"عذراً، لم أستطع تحليل البيانات حالياً."; [cite: 23]
      
      const newMsg = {
        id: Date.now(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, newMsg]);
    } catch (err) {
      [cite_start]setMessages(prev => [...prev, { id: Date.now(), text: "خطأ في الاتصال بالاستشاري.", sender: 'ai' }]); [cite: 25]
    } finally {
      [cite_start]setIsLoading(false); [cite: 26]
    }
  };

  // وظائف حفظ وحذف الردود
  const saveReply = (msg) => {
    if (!savedReplies.find(r => r.id === msg.id)) {
      setSavedReplies([...savedReplies, msg]);
    }
  };

  const deleteReply = (id) => {
    setSavedReplies(savedReplies.filter(r => r.id !== id));
  };

  useEffect(() => {
    [cite_start]chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); [cite: 27]
  }, [messages]);

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.specialistBtn} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-user-md"></i> استشاري أطفال متخصص
        </button>
      </div>

      <header style={styles.header}>
        <h1>موسوعة رقة للتربية</h1>
        <p>دليلك الصحي والتربيوي المتكامل</p>
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
        ))}
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
          ))}
        </div>
        <button style={styles.analyzeBtn} onClick={() => getAIAnalysis()}>
          <i className="fas fa-stethoscope"></i> استشارة الذكاء الاصطناعي الطبي
        </button>
      </div>

      {/* عرض الردود المحفوظة */}
      {savedReplies.length > 0 && (
        <div style={styles.savedSection}>
          <h3 style={{fontSize: '16px', color: '#2e8b57'}}><i className="fas fa-bookmark"></i> الاستشارات المحفوظة</h3>
          {savedReplies.map(reply => (
            <div key={reply.id} style={styles.savedItem}>
              <p style={{fontSize: '13px', margin: '0 0 5px 0'}}>{reply.text.substring(0, 50)}...</p>
              <button onClick={() => deleteReply(reply.id)} style={styles.deleteBtn}>حذف</button>
            </div>
          ))}
        </div>
      )}

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
              <span>استشاري الأطفال والتربية</span>
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.chatContent}>
              {messages.map(msg => (
                <div key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}>
                  <div style={styles.msgBubble}>
                    <p style={styles.msgText}>{msg.text}</p>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px'}}>
                        <small style={styles.msgTime}>{msg.timestamp}</small>
                        {msg.sender === 'ai' && (
                            <button onClick={() => saveReply(msg)} style={styles.saveIconBtn}>
                                <i className="fas fa-save"></i>
                            </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && <div style={styles.loading}>جاري مراجعة المراجع الطبية...</div>}
              <div ref={chatEndRef} />
            </div>
            <div style={styles.chatInputArea}>
              [cite_start]{/* أزرار الوسائط داخل كارت الشات [cite: 36, 42] */}
              <div style={styles.mediaBar}>
                <button onClick={() => handleMediaAction('camera')} style={styles.mediaIcon}>
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
                  placeholder="اسألي الاستشاري هنا..."
                  style={styles.input}
                />
                <button onClick={() => { if(inputText.trim()){ getAIAnalysis(inputText); setInputText(""); } }} style={styles.sendBtn}>
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
  analyzeBtn: { width: '100%', marginTop: '20px', padding: '12px', borderRadius: '25px', border: 'none', background: '#ff85a2', color: 'white', fontWeight: 'bold' },
  chatOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' },
  chatBox: { width: '100%', height: '85vh', background: 'white', borderRadius: '20px 20px 0 0', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '15px', background: '#2e8b57', color: 'white', display: 'flex', justifyContent: 'space-between' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '20px' },
  chatContent: { flex: 1, overflowY: 'auto', padding: '15px' },
  aiMsgRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' },
  userMsgRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
  msgBubble: { maxWidth: '80%', padding: '12px', borderRadius: '15px', background: '#f0f0f0' },
  msgText: { margin: 0 },
  msgTime: { fontSize: '10px', color: '#999' },
  saveIconBtn: { background: 'none', border: 'none', color: '#2e8b57', cursor: 'pointer' },
  chatInputArea: { padding: '15px', borderTop: '1px solid #eee' },
  mediaBar: { display: 'flex', gap: '20px', marginBottom: '10px', justifyContent: 'center' },
  mediaIcon: { background: '#f0f0f0', border: 'none', color: '#2e8b57', fontSize: '14px', padding: '5px 15px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '5px' },
  inputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' },
  sendBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#2e8b57', color: 'white' },
  loading: { textAlign: 'center', fontSize: '12px', color: '#2e8b57' },
  savedSection: { marginTop: '20px', padding: '15px', background: 'white', borderRadius: '20px' },
  savedItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' },
  deleteBtn: { background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', padding: '2px 8px', fontSize: '11px' }
};

export default App;
