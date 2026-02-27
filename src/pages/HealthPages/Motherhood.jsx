import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الدوال من مسار الخدمات المحدد
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';

const App = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [savedReplies, setSavedReplies] = useState([]); 
  const [showSavedList, setShowSavedList] = useState(false);

  const chatEndRef = useRef(null);

  const lists = [
    { title: "تعديل السلوك", icon: "fa-child", items: ["التعزيز الإيجابي", "تجاهل السلوكيات المزعجة", "العواقب المنطقية", "وضع حدود واضحة", "لوحة النجوم والمكافآت", "النمذجة والقدوة", "قضاء وقت خاص", "الاستماع الفعال", "بدائل كلمة لا", "توفير بيئة آمنة"] },
    { title: "غرس القناعات", icon: "fa-heart", items: ["قيمة الصدق", "الإيمان بالقدرات", "احترام الاختلاف", "العمل الجماعي", "قيمة الامتنان", "المثابرة", "حب التعلم", "المسؤولية البيئية", "الأمانة", "الرحمة بالضعفاء"] },
    { title: "الذكاء العاطفي", icon: "fa-brain", items: ["تسمية المشاعر", "مهارة التعاطف", "تنفس الهدوء", "الاعتراف بالمشاعر", "حل النزاعات سلمياً", "بناء الثقة بالنفس", "التعامل مع الخوف", "فهم لغة الجسد", "تحمل الإحباط", "تنمية التفاؤل"] },
    { title: "تطوير المعرفة", icon: "fa-book-open", items: ["القراءة اليومية", "ألعاب الألغاز", "تجارب علمية منزلية", "تعلم لغة ثانية", "الرحلات التعليمية", "الحساب الذهني", "النقاشات المفتوحة", "الثقافات العالمية", "تكنولوجيا هادفة", "تشجيع الهوايات"] },
    { title: "الصحة والنشاط", icon: "fa-apple-whole", items: ["نظام غذائي متوازن", "ساعات نوم كافية", "شرب الماء", "ممارسة الرياضة", "النظافة الشخصية", "الفحوصات الدورية", "تقليل السكريات", "وقت في الطبيعة", "المهارات الحركية", "سلامة الجسد"] },
    { title: "مهارات اجتماعية", icon: "fa-users", items: ["إلقاء التحية", "مشاركة الألعاب", "آداب المائدة", "تكوين صداقات", "الاعتذار الصادق", "الاستماع للغير", "طلب الإذن", "التعاون المنزلي", "مهارات القيادة", "التعبير عن الرأي"] },
    { title: "الاستقلال", icon: "fa-star", items: ["ارتداء الملابس", "ترتيب السرير", "تحضير وجبة", "اتخاذ قرارات", "إدارة المصروف", "الالتزام بالجدول", "حل المشكلات", "عناية بالنباتات", "تحمل النتيجة", "إسعافات أولية"] },
    { title: "رعاية الأم", icon: "fa-spa", items: ["تخصيص وقت للراحة", "ممارسة هواية", "طلب المساعدة", "التواصل مع أمهات", "تخطي شعور الذنب", "نوم كافٍ", "قراءة تربوية", "التأمل واليوجا", "تحديد الأولويات", "الاحتفال بالإنجاز"] }
  ];

  const handleMediaAction = async (type) => {
    try {
      const base64Data = type === 'camera' ? await takePhoto() : await fetchImage();
      if (!base64Data) return;

      const timestamp = Date.now();
      const fileName = `img_${timestamp}.png`;
      const mimeType = 'image/png';

      const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, mimeType);
      
      console.log("تم الرفع بنجاح، الرابط:", finalAttachmentUrl);
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `تم إرسال صورة للمعاينة الطبية: ${finalAttachmentUrl}`,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString()
      }]);

      getAIAnalysis(`يرجى معاينة هذه الصورة من منظور طب الأطفال: ${finalAttachmentUrl}`);
      return finalAttachmentUrl;
    } catch (error) {
      console.error("فشل في معالجة أو رفع الصورة:", error);
      alert("حدث خطأ أثناء الوصول للكاميرا أو رفع الصورة.");
    }
  };

  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true);
    setIsChatOpen(true);

    const currentList = lists[selectedIdx];
    const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]);

    const systemRole = "أنت الآن استشاري طب أطفال خبير وموجه تربوي معتمد. استخدم مكتبات التخصص الطبية ومجموعات الأطباء لتقديم نصيحة دقيقة بناءً على المعطيات.";
    
    const promptMessage = customPrompt 
      ? `${systemRole} \n المستخدم يسأل: ${customPrompt}`
      : `${systemRole} \n لقد قامت الأم بتنفيذ المهام التالية في قسم ${currentList.title}: (${selectedOnes.join(" - ")}). حلل الحالة تربوياً وطبياً.`;

    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      });

      const responseText = response.data.reply || response.data.message || "عذراً، لم أتمكن من الحصول على رد.";
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), text: "خطأ في الاتصال بالسيرفر.", sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const saveToFavorite = (msg) => {
    if (!savedReplies.find(m => m.id === msg.id)) {
      setSavedReplies([...savedReplies, msg]);
      alert("تم حفظ الرد في المفضلة");
    }
  };

  const removeSaved = (id) => {
    setSavedReplies(savedReplies.filter(m => m.id !== id));
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.specialistBtn} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-user-md"></i> استشاري أطفال وذكاء اصطناعي
        </button>
      </div>

      <header style={styles.header}>
        <h1>موسوعة رقة للأطفال</h1>
        <p>مساعدك الذكي لصحة وتربية أطفالك</p>
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
          <i className="fas fa-microchip"></i> تحليل البيانات تربوياً
        </button>
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <i className="fas fa-stethoscope"></i>
                <span>استشاري الأطفال</span>
              </div>
              <div style={{display: 'flex', gap: '15px'}}>
                <button onClick={() => setShowSavedList(!showSavedList)} style={styles.iconBtn}>
                  <i className="fas fa-bookmark"></i>
                </button>
                <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
              </div>
            </div>

            <div style={styles.chatContent}>
              {showSavedList ? (
                <div style={styles.savedSection}>
                  <h4 style={{textAlign: 'center'}}>الردود المحفوظة</h4>
                  {savedReplies.length === 0 && <p style={{textAlign:'center', fontSize: '0.8rem'}}>لا توجد ردود محفوظة</p>}
                  {savedReplies.map(msg => (
                    <div key={msg.id} style={styles.savedItem}>
                      <p style={styles.msgText}>{msg.text}</p>
                      <button onClick={() => removeSaved(msg.id)} style={styles.delBtn}>حذف من المفضلة</button>
                    </div>
                  ))}
                  <button onClick={() => setShowSavedList(false)} style={styles.analyzeBtn}>العودة للدردشة</button>
                </div>
              ) : (
                <>
                  {messages.map(msg => (
                    <div key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}>
                      <div style={styles.msgBubble}>
                        <p style={styles.msgText}>{msg.text}</p>
                        <div style={styles.msgActions}>
                          <small>{msg.timestamp}</small>
                          <div style={{display:'flex', gap: '8px'}}>
                            {msg.sender === 'ai' && (
                              <button onClick={() => saveToFavorite(msg)} style={styles.actionBtn} title="حفظ">
                                <i className="fas fa-save"></i>
                              </button>
                            )}
                            <button onClick={() => deleteMessage(msg.id)} style={styles.delBtnIcon} title="حذف">
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && <div style={styles.loading}>جاري البحث في المراجع الطبية...</div>}
                </>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.chatInputArea}>
              <div style={styles.mediaBar}>
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('camera')}>
                   <i className="fas fa-camera"></i>
                </button>
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('gallery')}>
                   <i className="fas fa-image"></i>
                </button>
              </div>
              <div style={styles.inputRow}>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اسألي الاستشاري..."
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
  container: { direction: 'rtl', padding: '15px', backgroundColor: '#fdf7f9', minHeight: '100vh', fontFamily: 'Arial' },
  topBar: { display: 'flex', justifyContent: 'center', marginBottom: '15px' },
  specialistBtn: { padding: '10px 20px', borderRadius: '25px', border: 'none', background: '#2e8b57', color: 'white', fontWeight: 'bold' },
  header: { textAlign: 'center', color: '#6a5acd', marginBottom: '20px' },
  navScroll: { display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' },
  navBtn: { flex: '0 0 auto', padding: '10px', borderRadius: '12px', background: 'white', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' },
  activeNav: { background: '#ff85a2', color: 'white' },
  card: { background: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' },
  done: { textDecoration: 'line-through', color: '#ccc' },
  analyzeBtn: { width: '100%', marginTop: '15px', padding: '12px', borderRadius: '25px', border: 'none', background: '#ff85a2', color: 'white', fontWeight: 'bold' },
  chatOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' },
  chatBox: { width: '100%', height: '85vh', background: 'white', borderRadius: '20px 20px 0 0', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '15px', background: '#2e8b57', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { background: 'none', border: 'none', color: 'white', cursor: 'pointer' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '24px' },
  chatContent: { flex: 1, overflowY: 'auto', padding: '15px', background: '#f8f9fa' },
  aiMsgRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' },
  userMsgRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' },
  msgBubble: { maxWidth: '85%', padding: '12px', borderRadius: '15px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  msgText: { margin: 0, fontSize: '0.9rem', lineHeight: '1.5' },
  msgActions: { display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '5px' },
  actionBtn: { background: 'none', border: 'none', color: '#2e8b57' },
  delBtnIcon: { background: 'none', border: 'none', color: '#ff4d4d' },
  savedSection: { padding: '10px' },
  savedItem: { background: 'white', padding: '10px', borderRadius: '10px', marginBottom: '10px', borderRight: '4px solid #ff85a2' },
  delBtn: { background: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', marginTop: '5px', fontSize: '11px' },
  chatInputArea: { padding: '15px', borderTop: '1px solid #eee', background: 'white' },
  mediaBar: { display: 'flex', gap: '20px', marginBottom: '10px', justifyContent: 'center' },
  mediaIcon: { background: 'none', border: 'none', color: '#2e8b57', fontSize: '20px' },
  inputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' },
  sendBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#2e8b57', color: 'white' },
  loading: { textAlign: 'center', fontSize: '12px', color: '#2e8b57', margin: '10px' }
};

export default App;
