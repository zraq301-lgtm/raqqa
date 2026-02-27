import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
// استيراد خدمة الميديا من المسار المحدد
import { takePhoto, pickImage } from '../services/MediaService'; 

const App = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [savedReplies, setSavedReplies] = useState([]); 
  const [showSavedList, setShowSavedList] = useState(false); // للتحكم في عرض القائمة المحفوظة

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
          value: selectedOnes[0] || "إنجاز تربوي",
          note: `تم تحليل بيانات قسم ${lists[selectedIdx].title}`
        }
      });
    } catch (e) {
      console.error("DB Save Error:", e);
    }
  };

  const getAIAnalysis = async (customPrompt = null) => {
    setIsLoading(true);
    setIsChatOpen(true);

    const currentList = lists[selectedIdx];
    const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]);
    
    if (!customPrompt) saveDataToDB(selectedOnes);

    // تحديث التخصص ليكون استشاري أطفال مع البحث في منصات الأطباء
    const systemExpertise = "بصفتك أخصائي استشاري أطفال خبير، ابحث في موثوق منصات الأطباء العالمية والعربية وقدم لي نصيحة تربوية وطبية دقيقة.";
    const promptMessage = customPrompt 
      ? `${systemExpertise} سؤالي هو: ${customPrompt}`
      : `${systemExpertise} لقد تابعت المهام التالية للطفل: (${selectedOnes.join(" - ")}) في قسم ${currentList.title}. حلل الحالة وقدم توجيهات تربوية.`;

    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      };
      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || response.data.message || "لم أستطع الحصول على رد حالياً.";
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.", 
        sender: 'ai' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaAction = async (type) => {
    try {
        let imageUrl = "";
        if (type === 'camera') {
            imageUrl = await takePhoto(); // استخدام دالة المسار المذكور
        } else {
            imageUrl = await pickImage(); // استخدام دالة المسار المذكور
        }

        if (imageUrl) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: `تم رفع صورة للمعاينة: ${imageUrl}`,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString()
            }]);
        }
    } catch (error) {
        console.error("خطأ في الميديا:", error);
        alert("فشل الوصول للملفات.");
    }
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const saveReply = (msg) => {
    if (!savedReplies.find(r => r.id === msg.id)) {
        setSavedReplies(prev => [...prev, msg]);
        alert("تم حفظ الرد في المفضلة!");
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button style={styles.specialistBtn} onClick={() => setIsChatOpen(true)}>
          <i className="fas fa-user-md"></i> استشاري الأطفال والتربية
        </button>
      </div>

      <header style={styles.header}>
        <h1>موسوعة رقة للتربية</h1>
        <p>دليل الأم الواعية للتربية الحديثة</p>
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
          <i className="fas fa- brain"></i> تحليل السلوك تربوياً
        </button>
      </div>

      {isChatOpen && (
        <div style={styles.chatOverlay}>
          <div style={styles.chatBox}>
            <div style={styles.chatHeader}>
              <span><i className="fas fa-stethoscope"></i> استشاري الأطفال</span>
              <div style={{display: 'flex', gap: '15px'}}>
                 <button onClick={() => setShowSavedList(!showSavedList)} style={styles.saveBtnNav}>
                    <i className="fas fa-bookmark"></i>
                 </button>
                 <button onClick={() => setIsChatOpen(false)} style={styles.closeBtn}>&times;</button>
              </div>
            </div>

            <div style={styles.chatContent}>
              {showSavedList ? (
                  <div style={styles.savedSection}>
                      <h4>الردود المحفوظة</h4>
                      {savedReplies.length === 0 && <p>لا توجد ردود محفوظة بعد.</p>}
                      {savedReplies.map(r => (
                          <div key={r.id} style={styles.savedItem}>
                              <p>{r.text}</p>
                              <button onClick={() => setSavedReplies(prev => prev.filter(m => m.id !== r.id))} style={styles.delBtn}>حذف</button>
                          </div>
                      ))}
                      <button onClick={() => setShowSavedList(false)} style={styles.analyzeBtn}>العودة للدردشة</button>
                  </div>
              ) : (
                <>
                  {messages.length === 0 && <p style={styles.emptyMsg}>أهلاً بكِ.. أنا استشاري أطفال متخصص، كيف يمكنني مساعدتكِ تربوياً اليوم؟</p>}
                  {messages.map(msg => (
                    <div key={msg.id} style={msg.sender === 'ai' ? styles.aiMsgRow : styles.userMsgRow}>
                      <div style={styles.msgBubble}>
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
                  ))}
                </>
              )}
              {isLoading && <div style={styles.loading}>جاري البحث في منصات الأطباء... ✨</div>}
              <div ref={chatEndRef} />
            </div>

            <div style={styles.chatInputArea}>
              <div style={styles.mediaBar}>
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('camera')}><i className="fas fa-camera"></i></button>
                <button style={styles.mediaIcon} onClick={() => handleMediaAction('gallery')}><i className="fas fa-image"></i></button>
                <button style={styles.mediaIcon}><i className="fas fa-microphone"></i></button>
              </div>
              <div style={styles.inputRow}>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اسألي عن سلوك أو صحة طفلك..."
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

// ... (تُبقى الـ styles كما هي في الكود الأصلي مع إضافة التنسيقات البسيطة التالية)
const stylesExtra = {
    savedSection: { padding: '10px' },
    savedItem: { background: '#fff', padding: '10px', borderRadius: '10px', marginBottom: '10px', borderRight: '4px solid #2e8b57' },
    saveBtnNav: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }
};

// دمج الـ styles
Object.assign(styles, stylesExtra);

export default App;
