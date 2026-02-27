[cite_start]import React, { useState, useEffect, useRef } from 'react'; [cite: 1]
[cite_start]import { CapacitorHttp } from '@capacitor/core'; [cite: 1]
// استدعاء الخدمات من المسار الذي حددته
import { takePhoto, uploadToVercel } from '../../services/MediaService'; 

const App = () => {
  [cite_start]const [selectedIdx, setSelectedIdx] = useState(0); [cite: 2]
  [cite_start]const [checkedItems, setCheckedItems] = useState({}); [cite: 3]
  [cite_start]const [isChatOpen, setIsChatOpen] = useState(false); [cite: 3]
  [cite_start]const [messages, setMessages] = useState([]); [cite: 3]
  [cite_start]const [isLoading, setIsLoading] = useState(false); [cite: 3]
  const [isProcessing, setIsProcessing] = useState(false); 
  [cite_start]const [inputText, setInputText] = useState(""); [cite: 4]

  [cite_start]const chatEndRef = useRef(null); [cite: 4]

  const lists = [
    [cite_start]{ title: "تعديل السلوك", icon: "fa-child", items: ["التعزيز الإيجابي", "تجاهل السلوكيات المزعجة", "العواقب المنطقية", "وضع حدود واضحة", "لوحة النجوم والمكافآت", "النمذجة والقدوة", "قضاء وقت خاص", "الاستماع الفعال", "بدائل كلمة لا", "توفير بيئة آمنة"] }, [cite: 4]
    [cite_start]{ title: "غرس القناعات", icon: "fa-heart", items: ["قيمة الصدق", "الإيمان بالقدرات", "احترام الاختلاف", "العمل الجماعي", "قيمة الامتنان", "المثابرة", "حب التعلم", "المسؤولية البيئية", "الأمانة", "الرحمة بالضعفاء"] }, [cite: 4]
    [cite_start]{ title: "الذكاء العاطفي", icon: "fa-brain", items: ["تسمية المشاعر", "مهارة التعاطف", "تنفس الهدوء", "الاعتراف بالمشاعر", "حل النزاعات سلمياً", "بناء الثقة بالنفس", "التعامل مع الخوف", "فهم لغة الجسد", "تحمل الإحباط", "تنمية التفاؤل"] }, [cite: 4, 5]
    [cite_start]{ title: "تطوير المعرفة", icon: "fa-book-open", items: ["القراءة اليومية", "ألعاب الألغاز", "تجارب علمية منزلية", "تعلم لغة ثانية", "الرحلات التعليمية", "الحساب الذهني", "النقاشات المفتوحة", "الثقافات العالمية", "تكنولوجيا هادفة", "تشجيع الهوايات"] }, [cite: 5]
    [cite_start]{ title: "الصحة والنشاط", icon: "fa-apple-whole", items: ["نظام غذائي متوازن", "ساعات نوم كافية", "شرب الماء", "ممارسة الرياضة", "النظافة الشخصية", "الفحوصات الدورية", "تقليل السكريات", "وقت في الطبيعة", "المهارات الحركية", "سلامة الجسد"] }, [cite: 5]
    [cite_start]{ title: "مهارات اجتماعية", icon: "fa-users", items: ["إلقاء التحية", "مشاركة الألعاب", "آداب المائدة", "تكوين صداقات", "الاعتذار الصادق", "الاستماع للغير", "طلب الإذن", "التعاون المنزلي", "مهارات القيادة", "التعبير عن الرأي"] }, [cite: 5, 6]
    [cite_start]{ title: "الاستقلال", icon: "fa-star", items: ["ارتداء الملابس", "ترتيب السرير", "تحضير وجبة", "اتخاذ قرارات", "إدارة المصروف", "الالتزام بالجدول", "حل المشكلات", "عناية بالنباتات", "تحمل النتيجة", "إسعافات أولية"] }, [cite: 6]
    [cite_start]{ title: "رعاية الأم", icon: "fa-spa", items: ["تخصيص وقت للراحة", "ممارسة هواية", "طلب المساعدة", "التواصل مع أمهات", "تخطي شعور الذنب", "نوم كافٍ", "قراءة تربوية", "التأمل واليوجا", "تحديد الأولويات", "الاحتفال بالإنجاز"] }, [cite: 6]
    [cite_start]{ title: "الأمان والحماية", icon: "fa-shield-halved", items: ["لمسات الأمان", "حفظ أرقام الطوارئ", "سلامة المنزل", "الأمان الرقمي", "التصرف عند الضياع", "قواعد مع الغرباء", "قواعد المرور", "التواصل المفتوح", "معرفة العنوان", "مواجهة التنمر"] }, [cite: 6, 7]
    [cite_start]{ title: "الإبداع والخيال", icon: "fa-palette", items: ["القصص الخيالية", "اللعب الحر", "الرسم والتلوين", "الأشغال اليدوية", "تمثيل الأدوار", "تأليف قصص", "البناء بالمكعبات", "جمع كنوز الطبيعة", "الاستماع للفنون", "الفوضى الإبداعية"] } [cite: 7]
  ];

  const saveDataToDB = async (selectedOnes) => {
    try {
      [cite_start]await CapacitorHttp.post({ [cite: 8]
        [cite_start]url: 'https://raqqa-v6cd.vercel.app/api/save-notifications', [cite: 8]
        [cite_start]headers: { 'Content-Type': 'application/json' }, [cite: 8]
        data: {
          [cite_start]user_id: 1, [cite: 8]
          [cite_start]category: lists[selectedIdx].title, [cite: 8]
          value: selectedOnes[0] || [cite_start]"إنجاز تربوي", [cite: 8]
          [cite_start]note: `تم تحليل بيانات قسم ${lists[selectedIdx].title}` [cite: 8]
        }
      });
    } catch (e) {
      [cite_start]console.error("DB Save Error:", e); [cite: 10]
    }
  };

  const takeAndUploadPhoto = async () => {
    try {
      const base64Data = await takePhoto(); 
      setIsProcessing(true);
      const userMsgId = Date.now();
      
      setMessages(prev => [...prev, { 
        id: userMsgId, 
        text: "أرسلتُ صورة لكِ", 
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
          prompt: `أنا أنثى مسلمة، بصفتك استشارية تربوية خبيرة، إليكِ رسالتي: أرسلتُ صورة لكِ. مرفق رابط الوسائط: ${finalAttachmentUrl}`
        }
      };

      const response = await CapacitorHttp.post(options);
      if (response.status === 200) {
        const aiReply = response.data.reply || response.data.message || "عذراً، لم أستطع فهم ذلك.";
        setMessages(prev => [...prev, { id: Date.now(), text: aiReply, sender: 'ai', timestamp: new Date().toLocaleTimeString() }]);
      }
    } catch (err) {
      console.error("فشل العملية:", err);
      setMessages(prev => [...prev, { id: Date.now(), text: `⚠️ عذراً، حدث خطأ: ${err.message}`, sender: 'ai' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true);
    setIsChatOpen(true);
    [cite_start]const currentList = lists[selectedIdx]; [cite: 11]
    [cite_start]const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]); [cite: 12]
    
    [cite_start]if (!customPrompt) saveDataToDB(selectedOnes); [cite: 12]

    const promptMessage = customPrompt || 
      `أنا أم أطلب استشارة من متخصص تربوي خبير. لقد تابعت النقاط التالية: (${selectedOnes.join(" - ")}) في قسم ${currentList.title}. [cite_start]يرجى تحليل هذه المعطيات وتقديم توجيهات استشارية عملية.`; [cite: 13]

    try {
      [cite_start]const response = await CapacitorHttp.post({ [cite: 14, 15]
        [cite_start]url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai', [cite: 14]
        [cite_start]headers: { 'Content-Type': 'application/json' }, [cite: 14]
        [cite_start]data: { prompt: promptMessage } [cite: 14]
      });
      const responseText = response.data.reply || response.data.message || [cite_start]"لم أستطع الحصول على رد حالياً."; [cite: 15]
      [cite_start]setMessages(prev => [...prev, { [cite: 16]
        id: Date.now(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err) {
      [cite_start]setMessages(prev => [...prev, { id: Date.now(), text: "حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.", sender: 'ai' }]); [cite: 17]
    } finally {
      [cite_start]setIsLoading(false); [cite: 18]
    }
  };

  const deleteMessage = (id) => {
    [cite_start]setMessages(prev => prev.filter(m => m.id !== id)); [cite: 19]
  };

  useEffect(() => {
    [cite_start]chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); [cite: 21]
  }, [messages]);

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
              {messages.length === 0 && <p style={styles.emptyMsg}>أهلاً بكِ.. كيف يمكنني مساعدتكِ تربوياً اليوم؟</p>}
              {messages.map(msg => (
                <div key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}>
                  <div style={styles.msgBubble}>
                    {msg.attachment && <img src={msg.attachment.data} alt="uploaded" style={{width: '100%', borderRadius: '10px', marginBottom: '5px'}} />}
                    <p style={styles.msgText}>{msg.text}</p>
                    <div style={styles.msgFooter}>
                      <small>{msg.timestamp}</small>
                      <button onClick={() => deleteMessage(msg.id)} style={styles.delBtn}>حذف</button>
                    </div>
                  </div>
                </div>
              ))}
              {(isLoading || isProcessing) && <div style={styles.loading}>جاري المعالجة... ✨</div>}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.chatInputArea}>
              <div style={styles.mediaBar}>
                <button style={styles.mediaIcon} onClick={takeAndUploadPhoto}><i className="fas fa-camera"></i></button>
                <button style={styles.mediaIcon} onClick={takeAndUploadPhoto}><i className="fas fa-image"></i></button>
                <button style={styles.mediaIcon} onClick={() => alert('الميكروفون سيفعل قريباً')}><i className="fas fa-microphone"></i></button>
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

[cite_start]export default App; [cite: 42]
