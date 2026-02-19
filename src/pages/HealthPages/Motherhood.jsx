import React, { useState } from 'react';
import { CapacitorHttp } from '@capacitor/core';

// ملاحظة: تأكدي من وجود رابط FontAwesome في ملف index.html
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

const App = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [showChat, setShowChat] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // القوائم العشر الكاملة (100 مدخل)
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

  const toggleCheck = (idx, item) => {
    const key = `${idx}-${item}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // دالة الحفظ والتحليل المرتبطة بـ API الخاص بكِ
  const handleAnalyzeAndSave = async () => {
    setLoading(true);
    setShowChat(true);
    setAiResponse("رقة تقوم بتحليل خطواتكِ الرقيقة الآن... ✨");

    const currentList = lists[selectedIdx];
    // جمع العناصر المختارة فقط لإرسالها للتحليل
    const selectedOnes = currentList.items.filter(item => checkedItems[`${selectedIdx}-${item}`]);
    
    // بناء الطلب للذكاء الاصطناعي (raqqa-ai)
    const promptMessage = `بصفتك مساعدة رقة، لقد أنجزت اليوم في قسم ${currentList.title} ما يلي: ${selectedOnes.join("، ")}. حللي هذا التقدم بناءً على مكتبتكِ.`;

    try {
      // 1. الحفظ في قاعدة البيانات عبر save-notifications
      // هذا المسار يقوم بالحفظ في Neon وإرسال نسخة لـ Pipedream
      const saveResponse = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1,
          category: currentList.title,
          value: selectedOnes.length > 0 ? selectedOnes[0] : "بدء المتابعة",
          note: `تم إنجاز ${selectedOnes.length} بنود في ${currentList.title}`
        }
      });

      // 2. استدعاء التحليل الذكي من raqqa-ai
      // هذا المسار يبحث في Mixedbread Store ID: 66de0209...
      const aiRes = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptMessage }
      });

      // عرض نصيحة الـ AI المستمدة من سياق ملفاتك
      setAiResponse(aiRes.data.reply || "تم حفظ إنجازكِ يا رفيقتي! استمري في رحلتكِ الرائعة.");
    } catch (error) {
      console.error("Connection Error:", error);
      setAiResponse("حفظتُ لكِ إنجازكِ في السجل، لكن رقة مشغولة قليلاً عن الرد الآن.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>موسوعة التربية الواعية</h1>
        <p style={styles.subtitle}>دليلكِ الشامل لبناء جيل مبدع، متزن، وسعيد</p>
      </header>

      {/* شريط الأيقونات العرضي */}
      <div style={styles.navScroll}>
        {lists.map((list, i) => (
          <button 
            key={i} 
            style={{...styles.navBtn, ...(selectedIdx === i ? styles.activeNav : {})}}
            onClick={() => setSelectedIdx(i)}>
            <i className={`fas ${list.icon}`} style={{marginBottom: '5px'}}></i>
            <span style={{fontSize: '0.7rem'}}>{list.title}</span>
          </button>
        ))}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>
          <i className={`fas ${lists[selectedIdx].icon}`}></i> {lists[selectedIdx].title}
        </h2>
        <div style={styles.itemsGrid}>
          {lists[selectedIdx].items.map((item, i) => (
            <label key={i} style={styles.itemRow}>
              <input 
                type="checkbox" 
                checked={!!checkedItems[`${selectedIdx}-${item}`]}
                onChange={() => toggleCheck(selectedIdx, item)}
                style={styles.checkbox}
              />
              <span style={checkedItems[`${selectedIdx}-${item}`] ? styles.completed : {}}>{item}</span>
            </label>
          ))}
        </div>

        {/* زر التحليل والحفظ */}
        <div style={styles.actionArea}>
          <button style={styles.analyzeBtn} onClick={handleAnalyzeAndSave}>
            <i className="fas fa-sparkles"></i> التحليل والحفظ الذكي
          </button>
        </div>
      </div>

      {/* نافذة التحليل المنبثقة (رقة AI) */}
      {showChat && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <span><i className="fas fa-robot"></i> تحليل رقة الذكي</span>
              <button onClick={() => setShowChat(false)} style={styles.closeBtn}>&times;</button>
            </div>
            <div style={styles.modalBody}>
              {loading ? (
                <div style={styles.loadingArea}>
                  <i className="fas fa-spinner fa-spin"></i> جاري استشارة مكتبتكِ...
                </div>
              ) : (
                <div style={styles.aiText}>{aiResponse}</div>
              )}
              {!loading && (
                <button onClick={() => setShowChat(false)} style={styles.doneBtn}>فهمتُ ذلكِ ✨</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// التنسيقات (Styles)
const styles = {
  appContainer: {
    direction: 'rtl',
    fontFamily: 'Segoe UI, Tahoma, sans-serif',
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#fdfdfd'
  },
  header: {
    textAlign: 'center',
    padding: '30px 20px',
    background: 'linear-gradient(135deg, #ff85a2, #6a5acd)',
    color: 'white',
    borderRadius: '20px',
    marginBottom: '25px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  title: { margin: 0, fontSize: '1.8rem' },
  subtitle: { margin: '10px 0 0', opacity: 0.9 },
  navScroll: {
    display: 'flex',
    overflowX: 'auto',
    gap: '12px',
    paddingBottom: '15px',
    marginBottom: '20px'
  },
  navBtn: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px',
    minWidth: '80px',
    border: '1px solid #eee',
    borderRadius: '15px',
    backgroundColor: 'white',
    color: '#6a5acd',
    cursor: 'pointer',
    transition: '0.3s'
  },
  activeNav: {
    backgroundColor: '#ff85a2',
    color: 'white',
    borderColor: '#ff85a2'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
    borderTop: '6px solid #ff85a2'
  },
  cardTitle: { color: '#6a5acd', marginBottom: '20px', borderBottom: '1px solid #fce4ec', paddingBottom: '10px' },
  itemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '12px'
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#fff9fa',
    borderRadius: '12px',
    cursor: 'pointer'
  },
  checkbox: { marginLeft: '12px', accentColor: '#ff85a2', width: '18px', height: '18px' },
  completed: { textDecoration: 'line-through', color: '#bbb' },
  actionArea: { textAlign: 'center', marginTop: '30px' },
  analyzeBtn: {
    backgroundColor: '#6a5acd',
    color: 'white',
    border: 'none',
    padding: '15px 35px',
    borderRadius: '18px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(106, 90, 205, 0.3)'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)'
  },
  modal: {
    backgroundColor: 'white',
    width: '90%',
    maxWidth: '500px',
    borderRadius: '25px',
    overflow: 'hidden'
  },
  modalHeader: {
    backgroundColor: '#6a5acd',
    color: 'white',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' },
  modalBody: { padding: '25px', textAlign: 'center' },
  aiText: { lineHeight: '1.6', color: '#444', marginBottom: '20px', whiteSpace: 'pre-wrap' },
  loadingArea: { color: '#6a5acd', fontSize: '1.1rem' },
  doneBtn: {
    backgroundColor: '#ff85a2',
    color: 'white',
    border: 'none',
    padding: '10px 25px',
    borderRadius: '12px',
    cursor: 'pointer'
  }
};

export default App;
