import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { 
  FaChild, FaHeart, FaBrain, FaBookOpen, FaAppleAlt, 
  FaUsers, FaStar, FaSpa, FaShieldAlt, FaPalette,
  FaRobot, FaMicrophone, FaCamera, FaImage, FaTrash, FaPaperPlane 
} from 'react-icons/fa';

// --- ألوان وتنسيقات زجاجية ---
const glassStyle = {
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(15px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '25px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
};

const App = () => {
  const [selectedList, setSelectedList] = useState(0);
  const [checkedState, setCheckedState] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const data = [
    { id: 0, title: "السلوك", icon: <FaChild />, items: ["التعزيز الإيجابي", "تجاهل المزعج", "عواقب منطقية", "حدود واضحة", "لوحة النجوم", "النمذجة", "وقت خاص", "استماع فعال", "بدائل لـ لا", "بيئة آمنة"] },
    { id: 1, title: "القناعات", icon: <FaHeart />, items: ["الصدق", "الثقة بالقدرات", "احترام الآخر", "المشاركة", "الامتنان", "المثابرة", "حب التعلم", "المسؤولية", "الأمانة", "الرحمة"] },
    { id: 2, title: "الذكاء", icon: <FaBrain />, items: ["تسمية المشاعر", "التعاطف", "تنفس الهدوء", "الاعتراف بالمشاعر", "حل النزاعات", "الثقة بالذات", "تجاوز الخوف", "لغة الجسد", "تحمل الإحباط", "التفاؤل"] },
    { id: 3, title: "المعرفة", icon: <FaBookOpen />, items: ["قراءة يومية", "ألعاب ذكاء", "تجارب علمية", "لغة ثانية", "زيارة متاحف", "حساب ذهني", "نقاش مفتوح", "ثقافات عالمية", "تكنولوجيا", "هوايات"] },
    { id: 4, title: "الصحة", icon: <FaAppleAlt />, items: ["غذاء متوازن", "نوم منتظم", "شرب الماء", "رياضة", "نظافة", "فحص دوري", "منع السكريات", "هواء طلق", "حركة كبرى", "سلامة جسدية"] },
    { id: 5, title: "الاجتماع", icon: <FaUsers />, items: ["آداب التحية", "مشاركة", "آداب مائدة", "صداقات", "اعتذار", "استماع", "استئذان", "تعاون", "قيادة", "رأي حر"] },
    { id: 6, title: "الاستقلال", icon: <FaStar />, items: ["لبس ملابس", "ترتيب سرير", "تجهيز وجبة", "قرار بسيط", "إدارة مصروف", "جدول يومي", "حل مشاكل", "عناية نبات", "تحمل نتيجة", "إسعافات"] },
    { id: 7, title: "الأم", icon: <FaSpa />, items: ["وقت هدوء", "هواية", "طلب دعم", "تخطي الذنب", "نوم عميق", "قراءة", "تأمل", "أولويات", "احتفال", "تواصل"] },
    { id: 8, title: "الأمان", icon: <FaShieldAlt />, items: ["لمسات الأمان", "طوارئ", "أمان منزلي", "أمان رقمي", "قواعد طريق", "غرباء", "عنوان منزل", "صدق تام", "مواجهة تنمر", "قواعد مسبح"] },
    { id: 9, title: "الإبداع", icon: <FaPalette />, items: ["خيال", "لعب حر", "رسم", "إعادة تدوير", "تمثيل", "تأليف", "مكعبات", "طبيعة", "فنون", "ابتكار"] }
  ];

  // --- وظيفة حفظ البيانات في DB ونظام التنبيهات ---
  const saveToDatabase = async (category, value) => {
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          user_id: 1, // معرف افتراضي
          category: category,
          value: value,
          note: `تمت متابعة بند: ${value}`
        }
      };
      await CapacitorHttp.post(options);
    } catch (err) {
      console.error("خطأ في حفظ البيانات:", err);
    }
  };

  const handleCheck = (listId, itemIndex, itemName) => {
    const key = `${listId}-${itemIndex}`;
    const newState = !checkedState[key];
    setCheckedState(prev => ({ ...prev, [key]: newState }));
    
    if (newState) {
      saveToDatabase(data[listId].title, itemName);
    }
  };

  // --- نظام الذكاء الاصطناعي (طبيبة التربية) ---
  const askAI = async (customPrompt = null) => {
    const promptText = customPrompt || `بصفتك طبيبة تربية متخصصة، قمت اليوم بمتابعة بند "${data[selectedList].items.filter((_,i) => checkedState[`${selectedList}-${i}`]).join(', ')}" في فئة ${data[selectedList].title}. قدمي لي نصيحة تربوية مطولة وعميقة.`;
    
    setIsLoading(true);
    setIsChatOpen(true);
    
    try {
      const options = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptText }
      };

      const response = await CapacitorHttp.post(options);
      const aiReply = response.data.reply || "عذراً رفيقتي، حدث خطأ في معالجة النصيحة.";
      
      const newMsg = { id: Date.now(), text: aiReply, sender: 'ai' };
      setMessages(prev => [...prev, newMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), text: "فشل الاتصال بطبيبة التربية، تأكدي من الإنترنت.", sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="app-container" style={{ direction: 'rtl', padding: '20px', minHeight: '100vh', background: 'url(https://source.unsplash.com/1600x900/?soft,pastel) no-repeat center center fixed', backgroundSize: 'cover' }}>
      
      {/* زر متخصص التربية العلوي */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={() => askAI()}
          style={{ ...glassStyle, padding: '12px 25px', color: '#6a5acd', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
          <FaRobot /> متخصص التربية (تحليل ذكي)
        </button>
      </div>

      <div style={{ ...glassStyle, padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* شريط الأيقونات العرضي */}
        <div className="nav-scroll" style={{ display: 'flex', overflowX: 'auto', gap: '15px', paddingBottom: '15px' }}>
          {data.map((cat) => (
            <div 
              key={cat.id} 
              onClick={() => setSelectedList(cat.id)}
              style={{ 
                flex: '0 0 auto', width: '70px', height: '70px', borderRadius: '20px', 
                background: selectedList === cat.id ? '#ff85a2' : 'rgba(255,255,255,0.4)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s'
              }}>
              <span style={{ fontSize: '1.5rem', color: selectedList === cat.id ? 'white' : '#6a5acd' }}>{cat.icon}</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 'bold', marginTop: '4px' }}>{cat.title}</span>
            </div>
          ))}
        </div>

        {/* الكارت الكبير */}
        <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '25px', padding: '25px', marginTop: '20px' }}>
          <h2 style={{ color: '#6a5acd', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {data[selectedList].icon} {data[selectedList].title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            {data[selectedList].items.map((item, index) => (
              <label key={index} style={{ background: 'white', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={!!checkedState[`${selectedList}-${index}`]} 
                  onChange={() => handleCheck(selectedList, index, item)}
                  style={{ marginLeft: '12px', accentColor: '#ff85a2', width: '20px', height: '20px' }}
                />
                <span style={{ textDecoration: checkedState[`${selectedList}-${index}`] ? 'line-through' : 'none' }}>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* صفحة الشات المنبثقة */}
      {isChatOpen && (
        <div style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', top: '20px', zIndex: 1000, ...glassStyle, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '15px', background: '#6a5acd', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><FaRobot /> طبيبة التربية المتخصصة</span>
            <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
                <div style={{ background: msg.sender === 'ai' ? 'white' : '#ff85a2', color: msg.sender === 'ai' ? '#333' : 'white', padding: '15px', borderRadius: '15px', position: 'relative', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                  {msg.text}
                  <button onClick={() => deleteMessage(msg.id)} style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.7rem' }}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
            {isLoading && <div style={{ color: '#6a5acd' }}>جاري التحليل التربوي... ✨</div>}
          </div>

          {/* أزرار التحكم بالشات */}
          <div style={{ padding: '15px', background: 'rgba(255,255,255,0.8)', borderTop: '1px solid #ddd' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button title="فتح الكاميرا" style={{ background: '#eee', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}><FaCamera /></button>
              <button title="فتح الميكروفون" style={{ background: '#eee', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}><FaMicrophone /></button>
              <button title="رفع صورة" style={{ background: '#eee', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}><FaImage /></button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اسألي طبيبة التربية عن أي سلوك..."
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
              />
              <button 
                onClick={() => { if(inputText) { setMessages([...messages, {id: Date.now(), text: inputText, sender: 'user'}]); askAI(inputText); setInputText(""); } }}
                style={{ background: '#6a5acd', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}>
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
