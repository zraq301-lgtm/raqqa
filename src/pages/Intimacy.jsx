import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, MessageCircle, Camera, Mic, Trash2, Save, 
  Send, Star, ShieldCheck, Flame, 
  Moon, Flower2, Sparkles, Brain, PlusCircle, X, Paperclip, Image as ImageIcon
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';
import { takePhoto, uploadToVercel } from '../services/MediaService';

const MarriageApp = () => {
  const [activeList, setActiveList] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [savedResponses, setSavedResponses] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (showChat) scrollToBottom();
  }, [messages, loading, showChat]);

  // --- دالة الحفظ والإشعار المعدلة (48 ساعة + FCM) ---
  const saveAndNotify = async (categoryTitle, currentAnalysis) => {
    const savedToken = localStorage.getItem('fcm_token');
    
    // إعداد تاريخ الجدولة ليكون بعد 48 ساعة بالضبط
    const scheduledDate = new Date();
    scheduledDate.setHours(scheduledDate.getHours() + 48); 

    try {
      // 1. حفظ البيانات في نيون
      const saveToNeonOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          fcmToken: savedToken || undefined,
          user_id: 1,
          category: 'marriage_consultancy',
          title: `تحليل رقة: ${categoryTitle} ✨`,
          body: currentAnalysis.substring(0, 100) + "...",
          scheduled_for: scheduledDate.toISOString(), // هنا التاريخ المستقبلي 48 ساعة
          note: `استشارة متخصصة لـ ${categoryTitle}`
        }
      };
      await CapacitorHttp.post(saveToNeonOptions);

      // 2. إرسال إشعار FCM الفوري
      if (savedToken) {
        const fcmOptions = {
          url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
          headers: { 'Content-Type': 'application/json' },
          data: {
            token: savedToken,
            title: 'رد جديد من مستشارة رقة 💖',
            body: `مستشارتكِ جاهزة بخصوص ${categoryTitle}. اضغطي للقراءة.`,
            data: { type: 'marriage_report' }
          }
        };
        await CapacitorHttp.post(fcmOptions);
      }
      
      console.log("تم الحفظ بجدولة 48 ساعة وإرسال الإشعار بنجاح ✅");
    } catch (err) {
      console.error("خطأ في عملية المزامنة:", err);
    }
  };

  const categories = [
    { id: "bonding", title: "الود والاتصال العاطفي", icon: <Heart size={24} />, items: ["لغة الحوار 🗣️", "تبادل النظرات 👀", "كلمات التقدير 💌", "الهدايا 🎁", "الدعم 🤝", "الضحك 😂", "وقت خاص ☕", "اللمس 🤚", "الأمان 🛡️", "التسامح 🏳️"] },
    { id: "foreplay", title: "لغة الجسد والتمهيد", icon: <Flower2 size={24} />, items: ["القبلات 💋", "الأحضان 🫂", "الملاطفة 🌸", "لغة العيون ✨", "همس 👂", "تدليك 💆‍♂️", "نظافة 🧼", "تأنق 👗"] },
    { id: "physical", title: "الصحة والتبادل الجنسي", icon: <Flame size={24} />, items: ["الرغبة 🌡️", "المبادرة ⚡", "مناطق الإثارة 📍", "التفاعل 🔥", "التعبير 💬", "الإشباع ✅", "المدة ⏳"] },
    { id: "climax", title: "النشوة وما بعدها", icon: <Star size={24} />, items: ["النشوة 🌟", "تزامن 💞", "الكلمات 🗣️", "بقاء 🧘‍♂️", "رضا ✨"] },
    { id: "creativity", title: "الابتكار والنشاط", icon: <Sparkles size={24} />, items: ["أماكن 🏡", "أوضاع 🔄", "روتين 🔨", "روائح 🕯️", "مفاجآت 🎈"] },
    { id: "ethics", title: "الضوابط الشرعية", icon: <ShieldCheck size={24} />, items: ["تجنب الحيض 🚫", "تجنب الدبر 🛑", "خصوصية 🤐", "لا إكراه ❌", "ستر 🧺"] },
    { id: "health", title: "الصحة الفسيولوجية", icon: <PlusCircle size={24} />, items: ["قدرة 💪", "ألم 💊", "هرمونات 🧬", "رياضة 🏋️‍♂️", "تغذية 🥑"] },
    { id: "barriers", title: "العوائق والمشكلات", icon: <Brain size={24} />, items: ["ضغوط 🌪️", "أبناء 🧒", "تعب 🔋", "ملل 💤", "الجسد 🪞"] },
    { id: "awareness", title: "الثقافة والوعي", icon: <MessageCircle size={24} />, items: ["الرجل 🧠", "المرأة 🌸", "كتب 📚", "متعة 🎯"] },
    { id: "spiritual", title: "الاطمئنان الروحي", icon: <Moon size={24} />, items: ["دعاء 🤲", "غسل 🚿", "شكر 🛐", "نية 💎"] }
  ];

  const handleProcess = async (userInputs, pageTitle, imageUrl = null) => {
    const summary = Object.entries(userInputs)
      .filter(([key, value]) => value && value.length > 0)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(" - ") : value}`)
      .join(", ");

    // تعريف الشخصية: استشاري علاقات زوجية متخصص وصريح
    const MARRIAGE_EXPERT_PROMPT = `
      أنتِ "رقة"، مستشارة علاقات زوجية خبيرة ومتخصصة جداً. 
      مهمتكِ: تقديم نصائح دقيقة، علمية، وصريحة حول العلاقات الحميمة والأوضاع الجنسية لتعزيز السعادة الزوجية.
      القيود: لا تجيبي على أي سؤال خارج نطاق العلاقات الزوجية. 
      الأسلوب: استخدمي لغة دافئة وأنثوية، وكوني مبدعة في اقتراح أوضاع حميمة وحلول لكسر الروتين، مع الاستناد إلى ثقافة المتخصصين في هذا المجال.
    `;

    try {
      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `${MARRIAGE_EXPERT_PROMPT} ${systemPrompt}، القسم: ${pageTitle}، التفاصيل: (${summary}). ${imageUrl ? "الصورة المرفقة: " + imageUrl : ""} قدمي استشارة صريحة ومفصلة.`
        }
      };

      const aiResponse = await CapacitorHttp.post(aiOptions);
      const responseText = aiResponse.data.reply || aiResponse.data.message || "أنا هنا معكِ يا رفيقتي، اسألي ما تشائين في خصوصيتنا.";

      // استدعاء دالة الحفظ والاشعار بعد استلام رد الذكاء الاصطناعي
      await saveAndNotify(pageTitle, responseText);

      return responseText;
    } catch (err) {
      console.error("فشل الاتصال:", err);
      return "حدث خطأ، تأكدي من الاتصال بالإنترنت.";
    }
  };

  const handleAnalysis = async (cat) => {
    const selected = selectedItems[cat.id] || [];
    if (selected.length === 0) return;
    setShowChat(true);
    setLoading(true);
    const result = await handleProcess({ [cat.title]: selected }, cat.title);
    setMessages(prev => [
      ...prev, 
      { role: 'user', text: `تحليل قائمة: ${cat.title}` },
      { role: 'ai', text: result }
    ]);
    setLoading(false);
    setActiveList(null);
  };

  const handleManualChat = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: text }]);
    setLoading(true);
    setUserInput("");
    const result = await handleProcess({ "سؤال": text }, "دردشة خاصة");
    setMessages(prev => [...prev, { role: 'ai', text: result }]);
    setLoading(false);
  };

  const handleImageUpload = async () => {
    try {
      setUploading(true);
      const base64 = await takePhoto();
      const fileName = `raqqa_${Date.now()}.jpg`;
      const uploadedUrl = await uploadToVercel(base64, fileName, 'image/jpeg');
      
      setMessages(prev => [...prev, { role: 'user', text: "📸 تم إرسال صورة للتحليل..." }]);
      const result = await handleProcess({ "مرفق": "صورة" }, "تحليل بصري", uploadedUrl);
      setMessages(prev => [...prev, { role: 'ai', text: result }]);
    } catch (error) {
      alert("تعذر رفع الصورة: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const saveToArchive = (msg) => {
    setSavedResponses(prev => [...prev, { id: Date.now(), text: msg }]);
  };

  const deleteSaved = (id) => {
    setSavedResponses(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div style={{ backgroundColor: '#fffaf0', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#800020', color: '#d4af37', padding: '15px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 500 }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem' }}>مستشارة رقة للسعادة الزوجية</h1>
      </header>

      <button onClick={() => setShowChat(true)} style={{ position: 'fixed', bottom: '25px', left: '25px', background: '#d4af37', border: 'none', borderRadius: '50%', width: '60px', height: '60px', zIndex: 100, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
        <Sparkles color="#800020" size={30} />
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '15px' }}>
        {categories.map(cat => (
          <div key={cat.id} onClick={() => setActiveList(cat)} style={{ background: '#fff', borderRadius: '15px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', border: '1px solid #f0e0e0' }}>
            <div style={{ color: '#800020', marginBottom: '10px' }}>{cat.icon}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#800020' }}>{cat.title}</div>
          </div>
        ))}
      </div>

      {savedResponses.length > 0 && (
        <div style={{ padding: '15px', borderTop: '2px solid #800020', marginTop: '20px' }}>
          <h3 style={{ color: '#800020', fontSize: '1rem' }}>🔖 الردود المحفوظة:</h3>
          {savedResponses.map(res => (
            <div key={res.id} style={{ background: '#fff', padding: '10px', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', border: '1px solid #eee' }}>
              <span style={{ flex: 1 }}>{res.text.substring(0, 50)}...</span>
              <Trash2 size={18} color="#ff4d4d" onClick={() => deleteSaved(res.id)} style={{ cursor: 'pointer', marginLeft: '10px' }} />
            </div>
          ))}
        </div>
      )}

      {activeList && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '450px', borderRadius: '25px', maxHeight: '85vh', overflowY: 'auto', padding: '25px', position: 'relative' }}>
            <X onClick={() => setActiveList(null)} style={{ position: 'absolute', top: 20, left: 20, cursor: 'pointer', color: '#800020' }} />
            <h2 style={{ color: '#800020', fontSize: '1.1rem', marginBottom: '20px' }}>{activeList.title}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {activeList.items.map(item => (
                <button 
                  key={item}
                  onClick={() => {
                    const current = selectedItems[activeList.id] || [];
                    setSelectedItems({ ...selectedItems, [activeList.id]: current.includes(item) ? current.filter(i => i !== item) : [...current, item] });
                  }}
                  style={{ padding: '10px', border: '1px solid #eee', borderRadius: '10px', fontSize: '0.8rem', backgroundColor: (selectedItems[activeList.id] || []).includes(item) ? '#800020' : '#f9f9f9', color: (selectedItems[activeList.id] || []).includes(item) ? '#fff' : '#333' }}
                >
                  {item}
                </button>
              ))}
            </div>
            <button onClick={() => handleAnalysis(activeList)} style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#800020', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>تحليل وحفظ في رقة</button>
          </div>
        </div>
      )}

      {showChat && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#800020', color: '#d4af37', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>✨ مستشارة رقة الذكية</span>
            <X onClick={() => setShowChat(false)} style={{ cursor: 'pointer' }} />
          </div>

          <div style={{ background: '#f0e0e0', padding: '10px' }}>
            <input 
              value={systemPrompt} 
              onChange={(e) => setSystemPrompt(e.target.value)} 
              placeholder="برومبت توجيه الذكاء (اختياري)..." 
              style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #ccc', fontSize: '0.8rem' }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#fff9f9' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? '#800020' : '#fff', color: m.role === 'user' ? '#fff' : '#333', padding: '12px 18px', borderRadius: '20px', marginBottom: '15px', maxWidth: '85%', marginLeft: m.role === 'user' ? 'auto' : '0', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', border: m.role === 'ai' ? '1px solid #f0e0e0' : 'none', position: 'relative' }}>
                {m.text}
                {m.role === 'ai' && (
                  <Save size={14} onClick={() => saveToArchive(m.text)} style={{ position: 'absolute', bottom: '-20px', left: '5px', cursor: 'pointer', color: '#800020' }} />
                )}
              </div>
            ))}
            {loading && <div style={{ color: '#800020', fontSize: '0.8rem', textAlign: 'center' }}>رقة تراجع مكتبتها... 🖋️</div>}
            {uploading && <div style={{ color: '#d4af37', fontSize: '0.8rem', textAlign: 'center' }}>جاري رفع الصورة... 📤</div>}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '10px 15px 30px', background: '#fff', display: 'flex', gap: '8px', borderTop: '1px solid #eee', alignItems: 'center' }}>
            <button onClick={handleImageUpload} style={{ background: '#f0f0f0', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={20} color="#800020" />
            </button>
            <input value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="اكتبي سؤالك هنا..." style={{ flex: 1, padding: '14px 20px', borderRadius: '30px', border: '1px solid #ddd', outline: 'none' }} onKeyPress={(e) => e.key === 'Enter' && handleManualChat(userInput)} />
            <button onClick={() => handleManualChat(userInput)} style={{ background: '#d4af37', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={22} color="#800020" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarriageApp;
