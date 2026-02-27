import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
// استيراد خدمات الميديا من المسار المحدد
import { takePhoto, uploadToVercel } from './services/MediaService'; [cite: 1]

// ملاحظة: تأكدي من إضافة رابط FontAwesome في index.html للأيقونات
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

const App = () => {
  const [selectedIdx, setSelectedIdx] = useState(0); [cite: 2]
  const [checkedItems, setCheckedItems] = useState({}); [cite: 3]
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // لحالة رفع الصور
  const [inputText, setInputText] = useState(""); [cite: 4]

  const chatEndRef = useRef(null);

  const lists = [
    { title: "تعديل السلوك", icon: "fa-child", items: ["التعزيز الإيجابي", "تجاهل السلوكيات المزعجة", "العواقب المنطقية", "وضع حدود واضحة", "لوحة النجوم والمكافآت", "النمذجة والقدوة", "قضاء وقت خاص", "الاستماع الفعال", "بدائل كلمة لا", "توفير بيئة آمنة"] },
    { title: "غرس القناعات", icon: "fa-heart", items: ["قيمة الصدقة", "الإيمان بالقدرات", "احترام الاختلاف", "العمل الجماعي", "قيمة الامتنان", "المثابرة", "حب التعلم", "المسؤولية البيئية", "الأمانة", "الرحمة بالضعفاء"] },
    { title: "الذكاء العاطفي", icon: "fa-brain", items: ["تسمية المشاعر", "مهارة التعاطف", "تنفس الهدوء", "الاعتراف بالمشاعر", "حل النزاعات سلمياً", "بناء الثقة بالنفس", "التعامل مع الخوف", "فهم لغة الجسد", "تحمل الإحباط", "تنمية التفاؤل"] }, [cite: 5]
    { title: "تطوير المعرفة", icon: "fa-book-open", items: ["القراءة اليومية", "ألعاب الألغاز", "تجارب علمية منزلية", "تعلم لغة ثانية", "الرحلات التعليمية", "الحساب الذهني", "النقاشات المفتوحة", "الثقافات العالمية", "تكنولوجيا هادفة", "تشجيع الهوايات"] },
    { title: "الصحة والنشاط", icon: "fa-apple-whole", items: ["نظام غذائي متوازن", "ساعات نوم كافية", "شرب الماء", "ممارسة الرياضة", "النظافة الشخصية", "الفحوصات الدورية", "تقليل السكريات", "وقت في الطبيعة", "المهارات الحركية", "سلامة الجسد"] },
    { title: "مهارات اجتماعية", icon: "fa-users", items: ["إلقاء التحية", "مشاركة الألعاب", "آداب المائدة", "تكوين صداقات", "الاعتذار الصادق", "الاستماع للغير", "طلب الإذن", "التعاون المنزلي", "مهارات القيادة", "التعبير عن الرأي"] }, [cite: 6]
    { title: "الاستقلال", icon: "fa-star", items: ["ارتداء الملابس", "ترتيب السرير", "تحضير وجبة", "اتخاذ قرارات", "إدارة المصروف", "الالتزام بالجدول", "حل المشكلات", "عناية بالنباتات", "تحمل النتيجة", "إسعافات أولية"] },
    { title: "رعاية الأم", icon: "fa-spa", items: ["تخصيص وقت للراحة", "ممارسة هواية", "طلب المساعدة", "التواصل مع أمهات", "تخطي شعور الذنب", "نوم كافٍ", "قراءة تربوية", "التأمل واليوجا", "تحديد الأولويات", "الاحتفال بالإنجاز"] },
    { title: "الأمان والحماية", icon: "fa-shield-halved", items: ["لمسات الأمان", "حفظ أرقام الطوارئ", "سلامة المنزل", "الأمان الرقمي", "التصرف عند الضياع", "قواعد مع الغرباء", "قواعد المرور", "التواصل المفتوح", "معرفة العنوان", "مواجهة التنمر"] }, [cite: 7]
    { title: "الإبدع والخيال", icon: "fa-palette", items: ["القصص الخيالية", "اللعب الحر", "الرسم والتلوين", "الأشغال اليدوية", "تمثيل الأدوار", "تأليف قصص", "البناء بالمكعبات", "جمع كنوز الطبيعة", "الاستماع للفنون", "الفوضى الإبداعية"] }
  ];

  const saveDataToDB = async (selectedOnes) => { [cite: 8]
    try {
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1,
          category: lists[selectedIdx].title,
          value: selectedOnes[0] || "إنجاز تربوي",
          note: `تم تحليل بيانات قسم ${lists[selectedIdx].title}` [cite: 9]
        }
      });
    } catch (e) { [cite: 10]
      console.error("DB Save Error:", e);
    }
  };

  const getAIAnalysis = async (customPrompt = null) => { [cite: 11]
    setIsLoading(true);
    setIsChatOpen(true);

    const currentList = lists[selectedIdx];
    const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]); [cite: 12]
    
    if (!customPrompt) saveDataToDB(selectedOnes);

    // توجيه الذكاء الاصطناعي ليعمل كمتخصص تربوي خبير
    const promptMessage = customPrompt || 
      `بصفتك استشارية تربوية خبيرة ومتخصصة في علم نفس الطفل، أنا أم أطلب استشارتك. 
      لقد قمت بمتابعة وتطبيق النقاط التالية: (${selectedOnes.join(" - ")}) في قسم ${currentList.title}. 
      يرجى تحليل هذه الخطوات وتقديم نصائح عملية وعلمية تدعم رحلتي التربوية.`; [cite: 13]

    try { [cite: 14]
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      };
      const response = await CapacitorHttp.post(options); [cite: 15]
      const responseText = response.data.reply || response.data.message || "أهلاً بكِ.. لم أستطع الحصول على رد حالياً.";
      
      setMessages(prev => [...prev, { [cite: 16]
        id: Date.now(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err) { [cite: 17]
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "حدث خطأ في الاتصال بالمتخصص، يرجى المحاولة لاحقاً.", 
        sender: 'ai' 
      }]);
    } finally { [cite: 18]
      setIsLoading(false);
    }
  };

  const takeAndUploadPhoto = async () => {
    try {
      // 1. تشغيل الكاميرا والتقاط الصورة بصيغة Base64
      const base64Data = await takePhoto(); 
      
      // 2. إعداد بيانات الرسالة وحالة المعالجة
      setIsProcessing(true);
      const userMsgId = Date.now();
      
      // إضافة رسالة للمستخدم في الواجهة مع الصورة المعاينة
      setMessages(prev => [...prev, { 
        id: userMsgId, 
        text: "أرسلتُ صورة لكِ", 
        sender: 'user', 
        attachment: { type: 'image', data: base64Data },
        timestamp: new Date().toLocaleTimeString()
      }]);

      // 3. مرحلة رفع الصورة إلى Vercel Blob
      const fileName = `img_${userMsgId}.png`;
      const mimeType = 'image/png';
      const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, mimeType);

      // 4. إرسال الرابط إلى محرك الذكاء الاصطناعي مع الشخصية المطلوبة
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنا أنثى مسلمة وأم، إليكِ رسالتي: أرسلتُ صورة لكِ لتحليلها تربوياً. مرفق رابط الوسائط: ${finalAttachmentUrl}. بصفتك استشارية تربوية، ماذا ترين؟`
        }
      };

      const response = await CapacitorHttp.post(options);

      // 5. التعامل مع رد الذكاء الاصطناعي
      if (response.status === 200) {
        const aiReply = response.data.reply || response.data.message || "عذراً، لم أستطع فهم ذلك.";
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: aiReply, 
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString() 
        }]);
      } else {
        throw new Error(`خطأ من الخادم (Status: ${response.status})`);
      }

    } catch (err) {
      console.error("فشل العملية:", err);
      const detailedError = err.message || "حدث خطأ غير متوقع";
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: `⚠️ عذراً، حدث خطأ: ${detailedError}`, 
        sender: 'ai' 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteMessage = (id) => { [cite: 19]
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  useEffect(() => { [cite: 21]
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.container}> [cite: 22]
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
        {lists.map((list, i) => ( [cite: 23]
          <button 
            key={i} 
            style={{...styles.navBtn, ...(selectedIdx === i ? styles.activeNav : {})}}
            onClick={() => setSelectedIdx(i)}>
            <i className={`fas ${list.icon}`}></i>
            <span>{list.title}</span>
          </button> [cite: 24]
        ))}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>{lists[selectedIdx].title}</h2>
        <div style={styles.grid}>
          {lists[selectedIdx].items.map((item, i) => (
            <label key={i} style={styles.itemRow}>
              <input 
                type="checkbox" 
                [cite_start]checked={!!checkedItems[`${selectedIdx}-${item}`]} [cite: 25]
                onChange={() => setCheckedItems({...checkedItems, [`${selectedIdx}-${item}`]: !checkedItems[`${selectedIdx}-${item}`]})}
              />
              <span style={checkedItems[`${selectedIdx}-${item}`] ? styles.done : {}}>{item}</span> [cite: 26]
            </label>
          ))}
        </div>
        <button style={styles.analyzeBtn} onClick={() => getAIAnalysis()}>
          <i className="fas fa-brain"></i> التحليل والحفظ التربوي
        </button>
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}> [cite: 27]
            <div style={styles.chatHeader}>
              <span><i className="fas fa-comment-medical"></i> الاستشارية التربوية</span>
              <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
            </div>

            <div style={styles.chatContent}>
              {messages.length === 0 && <p style={styles.emptyMsg}>أهلاً بكِ في رقة.. أنا هنا لأسمعكِ وأوجهكِ تربوياً، كيف حال طفلكِ اليوم؟</p>} [cite: 28]
              {messages.map(msg => (
                <div key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}>
                  <div style={styles.msgBubble}>
                    {msg.attachment?.type === 'image' && (
                       <img src={msg.attachment.data} alt="uploaded" style={{width: '100%', borderRadius: '10px', marginBottom: '5px'}} />
                    )}
                    <p style={styles.msgText}>{msg.text}</p>
                    <div style={styles.msgFooter}> [cite: 29]
                      <small>{msg.timestamp}</small>
                      <button onClick={() => deleteMessage(msg.id)} style={styles.delBtn}>
                        <i className="fas fa-trash-alt"></i> حذف
                      </button>
                    </div> [cite: 30]
                  </div>
                </div>
              ))}
              {(isLoading || isProcessing) && <div style={styles.loading}>جاري التحليل التربوي... ✨</div>}
              <div ref={chatEndRef} /> [cite: 31]
            </div>

            <div style={styles.chatInputArea}>
              <div style={styles.mediaBar}>
                <button style={styles.mediaIcon} onClick={takeAndUploadPhoto}><i className="fas fa-camera"></i></button> [cite: 32]
                <button style={styles.mediaIcon} onClick={takeAndUploadPhoto}><i className="fas fa-image"></i></button>
                <button style={styles.mediaIcon} onClick={() => alert('تحليل الصوت سيفعل قريباً')}><i className="fas fa-microphone"></i></button>
              </div>
              <div style={styles.inputRow}>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اكتبي سؤالكِ التربوي هنا..." [cite: 33]
                  style={styles.input}
                />
                <button 
                  onClick={() => { 
                    if(inputText.trim()) {  [cite: 34]
                      setMessages(prev => [...prev, {id: Date.now(), text: inputText, sender:'user', timestamp: new Date().toLocaleTimeString()}]);
                      getAIAnalysis(inputText); [cite: 35]
                      setInputText(""); 
                    } 
                  }}
                  style={styles.sendBtn}>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div> [cite: 36]
          </div>
        </div>
      )}
    </div>
  );
}; [cite: 37]

const styles = {
  container: { direction: 'rtl', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#fdf7f9', minHeight: '100vh' },
  topBar: { display: 'flex', justifyContent: 'center', marginBottom: '15px' },
  specialistBtn: { padding: '10px 20px', borderRadius: '20px', border: 'none', background: '#6a5acd', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  header: { textAlign: 'center', marginBottom: '20px', color: '#6a5acd' },
  navScroll: { display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px' },
  navBtn: { flex: '0 0 auto', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' },
  activeNav: { background: '#ff85a2', color: 'white', borderColor: '#ff85a2' }, [cite: 38]
  card: { background: 'white', padding: '15px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'right', marginBottom: '15px' },
  itemRow: { padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f9f9f9' },
  done: { textDecoration: 'line-through', color: '#ccc' },
  analyzeBtn: { width: '100%', padding: '12px', borderRadius: '25px', border: 'none', background: '#ff85a2', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  chatOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }, [cite: 39]
  chatBox: { width: '100%', maxWidth: '500px', height: '90vh', background: 'white', borderRadius: '25px 25px 0 0', display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '15px', background: '#6a5acd', color: 'white', display: 'flex', justifyContent: 'space-between', borderRadius: '25px 25px 0 0' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.5rem' },
  chatContent: { flex: 1, overflowY: 'auto', padding: '15px', background: '#f8f9fa' },
  aiMsgRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' },
  userMsgRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' },
  msgBubble: { maxWidth: '80%', padding: '10px', borderRadius: '15px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }, [cite: 40]
  msgText: { margin: 0, fontSize: '0.9rem', lineHeight: '1.5' },
  msgFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.7rem', color: '#999' },
  delBtn: { border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer' },
  chatInputArea: { padding: '15px', borderTop: '1px solid #eee' },
  mediaBar: { display: 'flex', justifyContent: 'center', gap: '25px', marginBottom: '10px' },
  mediaIcon: { background: 'none', border: 'none', color: '#6a5acd', fontSize: '1.2rem', cursor: 'pointer' },
  inputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' },
  sendBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#6a5acd', color: 'white', cursor: 'pointer' }, [cite: 41]
  loading: { textAlign: 'center', padding: '10px', color: '#6a5acd' },
  emptyMsg: { textAlign: 'center', marginTop: '40px', color: '#ccc' }
};

export default App; [cite: 42]
