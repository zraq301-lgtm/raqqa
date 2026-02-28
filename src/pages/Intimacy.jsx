import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, MessageCircle, Camera, Mic, Trash2, Save, 
  Send, Star, ShieldCheck, Flame, 
  Moon, Flower2, Sparkles, Brain, PlusCircle, X, Image as ImageIcon
} from 'lucide-react';

// استيراد المحرك الأصلي لتجاوز CORS [cite: 2]
import { CapacitorHttp } from '@capacitor/core';

// استدعاء خدمات الميديا من المسار الصحيح المذكور 
import { takePhoto, fetchImage, uploadToVercel } from '../services/MediaService';

const MarriageApp = () => {
  const [activeList, setActiveList] = useState(null); [cite: 3]
  const [selectedItems, setSelectedItems] = useState({}); [cite: 3]
  const [showChat, setShowChat] = useState(false); [cite: 4]
  const [messages, setMessages] = useState([]); [cite: 4]
  const [userInput, setUserInput] = useState(""); [cite: 4]
  const [loading, setLoading] = useState(false); [cite: 4]
  const [savedResponses, setSavedResponses] = useState([]); // قائمة حفظ الردود
  const [attachedImage, setAttachedImage] = useState(null); // الصورة المرفقة للذكاء الاصطناعي
  
  const messagesEndRef = useRef(null); [cite: 5]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); [cite: 5]
  };

  useEffect(() => {
    if (showChat) scrollToBottom();
  }, [messages, loading, showChat]); [cite: 6]

  // تحميل الردود المحفوظة من ذاكرة الجهاز عند التشغيل
  useEffect(() => {
    const saved = localStorage.getItem('raqqa_saved_chat');
    if (saved) setSavedResponses(JSON.parse(saved));
  }, []);

  const categories = [ [cite: 7]
    { id: "bonding", title: "الود والاتصال العاطفي", icon: <Heart size={24} />, items: ["لغة الحوار 🗣️", "تبادل النظرات 👀", "كلمات التقدير 💌", "الهدايا 🎁", "الدعم 🤝", "الضحك 😂", "وقت خاص ☕", "اللمس 🤚", "الأمان 🛡️", "التسامح 🏳️"] },
    { id: "foreplay", title: "لغة الجسد والتمهيد", icon: <Flower2 size={24} />, items: ["القبلات 💋", "الأحضان 🫂", "الملاطفة 🌸", "لغة العيون ✨", "همس 👂", "تدليك 💆‍♂️", "نظافة 🧼", "تأنق 👗"] },
    { id: "physical", title: "الصحة والتبادل الجنسي", icon: <Flame size={24} />, items: ["الرغبة 🌡️", "المبادرة ⚡", "مناطق الإثارة 📍", "التفاعل 🔥", "التعبير 💬", "الإشباع ✅", "المدة ⏳"] },
    { id: "climax", title: "النشوة وما بعدها", icon: <Star size={24} />, items: ["النشوة 🌟", "تزامن 💞", "الكلمات 🗣️", "بقاء 🧘‍♂️", "رضا ✨"] },
    { id: "creativity", title: "الابتكار والنشاط", icon: <Sparkles size={24} />, items: ["أماكن 🏡", "أوضاع 🔄", "روتين 🔨", "روائح 🕯️", "مفاجآت 🎈"] },
    { id: "ethics", title: "الضوابط الشرعية", icon: <ShieldCheck size={24} />, items: ["تجنب الحيض 🚫", "تجنب الدبر 🛑", "خصوصية 🤐", "لا إكراه ❌", "ستر 🧺"] },
    { id: "health", title: "الصحة الفسيولوجية", icon: <PlusCircle size={24} />, items: ["قدرة 💪", "ألم 💊", "هرمونات 🧬", "رياضة 🏋️‍♂️", "تغذية 🥑"] }, [cite: 8, 9]
    { id: "barriers", title: "العوائق والمشكلات", icon: <Brain size={24} />, items: ["ضغوط 🌪️", "أبناء 🧒", "تعب 🔋", "ملل 💤", "الجسد 🪞"] },
    { id: "awareness", title: "الثقافة والوعي", icon: <MessageCircle size={24} />, items: ["الرجل 🧠", "المرأة 🌸", "كتب 📚", "متعة 🎯"] },
    { id: "spiritual", title: "الاطمئنان الروحي", icon: <Moon size={24} />, items: ["دعاء 🤲", "غسل 🚿", "شكر 🛐", "نية 💎"] }
  ];

  // دالة التعامل مع الكاميرا ومعالجة الصورة للرفع 
  const handleMediaAction = async (actionType) => {
    try {
      setLoading(true);
      const base64 = actionType === 'camera' ? await takePhoto() : await fetchImage(); [cite: 41]
      if (base64) {
        const fileName = `raqqa_img_${Date.now()}.jpg`;
        const uploadedUrl = await uploadToVercel(base64, fileName, 'image/jpeg'); [cite: 41]
        setAttachedImage(uploadedUrl);
      }
    } catch (err) {
      console.error("خطأ في الوسائط:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (userInputs, pageTitle, imageUrl = null) => { [cite: 10]
    const summary = Object.entries(userInputs) [cite: 10]
      .filter(([key, value]) => value && value.length > 0)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(" - ") : value}`)
      .join(", ");

    try { [cite: 11]
      const aiOptions = {
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنا أنثى مسلمة، في قسم ${pageTitle}، تفاصيلي هي: (${summary}). ${imageUrl ? `رابط الصورة المرفقة: ${imageUrl}` : ''} ردي عليّ بأسلوب رقة الدافئ.` [cite: 11, 12]
        }
      };

      const aiResponse = await CapacitorHttp.post(aiOptions); [cite: 13]
      const responseText = aiResponse.data.reply || aiResponse.data.message || "شكراً لمشاركتكِ يا رفيقتي."; [cite: 14, 15]

      // حفظ في نيون [cite: 15]
      await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/save-health',
        headers: { 'Content-Type': 'application/json' },
        data: { user_id: 1, category: pageTitle, value: "تحليل", note: summary } [cite: 15, 16]
      });

      return responseText; [cite: 16]
    } catch (err) { [cite: 17]
      return "حدث خطأ في الاتصال، تأكدي من الإنترنت يا رفيقتي."; [cite: 18]
    }
  };

  const saveToLibrary = (msgText) => {
    const updated = [...savedResponses, { id: Date.now(), text: msgText }];
    setSavedResponses(updated);
    localStorage.setItem('raqqa_saved_chat', JSON.stringify(updated));
  };

  const removeFromLibrary = (id) => {
    const updated = savedResponses.filter(r => r.id !== id);
    setSavedResponses(updated);
    localStorage.setItem('raqqa_saved_chat', JSON.stringify(updated));
  };

  const handleManualChat = async (text) => { [cite: 22]
    if (!text.trim() && !attachedImage) return; [cite: 22]
    const tempImage = attachedImage;
    setMessages(prev => [...prev, { role: 'user', text: text, image: tempImage }]); [cite: 23]
    setLoading(true);
    setUserInput("");
    setAttachedImage(null);

    const result = await handleProcess({ "سؤال": text }, "دردشة عامة", tempImage); [cite: 24]
    setMessages(prev => [...prev, { role: 'ai', text: result }]); [cite: 24]
    setLoading(false); [cite: 24]
  };

  const handleAnalysis = async (cat) => { [cite: 19]
    const selected = selectedItems[cat.id] || []; [cite: 19]
    if (selected.length === 0) return; [cite: 20]
    setShowChat(true); [cite: 20]
    setLoading(true); [cite: 20]
    const result = await handleProcess({ [cat.title]: selected }, cat.title); [cite: 20]
    setMessages(prev => [ [cite: 21]
      ...prev, 
      { role: 'user', text: `تحليل قائمة: ${cat.title}` },
      { role: 'ai', text: result }
    ]);
    setLoading(false); [cite: 22]
    setActiveList(null); [cite: 22]
  };

  return (
    <div style={{ backgroundColor: '#fffaf0', minHeight: '100vh', direction: 'rtl', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#800020', color: '#d4af37', padding: '15px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 500 }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem' }}>مستشارة رقة للسعادة الزوجية</h1> [cite: 25]
      </header>

      {/* قائمة الردود المحفوظة */}
      {savedResponses.length > 0 && (
        <div style={{ padding: '10px', background: '#fdf2f2', borderBottom: '1px solid #eee' }}>
          <p style={{ fontSize: '0.8rem', color: '#800020', fontWeight: 'bold', marginBottom: '5px' }}>🌸 الردود المحفوظة:</p>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
            {savedResponses.map(res => (
              <div key={res.id} style={{ minWidth: '150px', background: '#fff', padding: '8px', borderRadius: '10px', border: '1px solid #d4af37', position: 'relative' }}>
                <Trash2 size={12} onClick={() => removeFromLibrary(res.id)} style={{ position: 'absolute', top: 5, left: 5, color: 'red', cursor: 'pointer' }} />
                <p style={{ fontSize: '0.7rem', margin: 0, color: '#333' }}>{res.text.substring(0, 30)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => setShowChat(true)} style={{ position: 'fixed', bottom: '25px', left: '25px', background: '#d4af37', border: 'none', borderRadius: '50%', width: '60px', height: '60px', zIndex: 100, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
        <Sparkles color="#800020" size={30} /> [cite: 25, 26]
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '15px' }}>
        {categories.map(cat => (
          <div key={cat.id} onClick={() => setActiveList(cat)} style={{ background: '#fff', borderRadius: '15px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', border: '1px solid #f0e0e0' }}> [cite: 26]
            <div style={{ color: '#800020', marginBottom: '10px' }}>{cat.icon}</div> [cite: 26]
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#800020' }}>{cat.title}</div> [cite: 27]
          </div>
        ))}
      </div>

      {activeList && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}> [cite: 27]
          <div style={{ background: '#fff', width: '100%', maxWidth: '450px', borderRadius: '25px', maxHeight: '85vh', overflowY: 'auto', padding: '25px', position: 'relative' }}> [cite: 27]
            <X onClick={() => setActiveList(null)} style={{ position: 'absolute', top: 20, left: 20, cursor: 'pointer', color: '#800020' }} /> [cite: 28]
            <h2 style={{ color: '#800020', fontSize: '1.1rem', marginBottom: '20px' }}>{activeList.title}</h2> [cite: 28]
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}> [cite: 28]
              {activeList.items.map(item => (
                <button key={item} onClick={() => { [cite: 29]
                  const current = selectedItems[activeList.id] || []; [cite: 29, 30]
                  setSelectedItems({ ...selectedItems, [activeList.id]: current.includes(item) ? current.filter(i => i !== item) : [...current, item] }); [cite: 30]
                }} style={{ padding: '10px', border: '1px solid #eee', borderRadius: '10px', fontSize: '0.8rem', backgroundColor: (selectedItems[activeList.id] || []).includes(item) ? '#800020' : '#f9f9f9', color: (selectedItems[activeList.id] || []).includes(item) ? '#fff' : '#333' }}> [cite: 31, 32]
                  {item}
                </button>
              ))}
            </div>
            <button onClick={() => handleAnalysis(activeList)} style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#800020', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>تحليل وحفظ في رقة</button> [cite: 33]
          </div>
        </div>
      )}

      {showChat && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' }}> [cite: 33]
          <div style={{ background: '#800020', color: '#d4af37', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> [cite: 33, 34]
            <span style={{ fontWeight: 'bold' }}>✨ مستشارة رقة الذكية</span> [cite: 34]
            <X onClick={() => setShowChat(false)} style={{ cursor: 'pointer' }} /> [cite: 34]
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#fff9f9' }}> [cite: 34]
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? '#800020' : '#fff', color: m.role === 'user' ? '#fff' : '#333', padding: '12px 18px', borderRadius: '20px', marginBottom: '15px', maxWidth: '85%', marginLeft: m.role === 'user' ? 'auto' : '0', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', border: m.role === 'ai' ? '1px solid #f0e0e0' : 'none', position: 'relative' }}> [cite: 35, 36, 37, 38]
                {m.image && <img src={m.image} alt="uploaded" style={{ width: '100%', borderRadius: '10px', marginBottom: '10px' }} />}
                {m.text}
                {m.role === 'ai' && (
                  <Save size={16} onClick={() => saveToLibrary(m.text)} style={{ position: 'absolute', bottom: -20, left: 10, color: '#d4af37', cursor: 'pointer' }} />
                )}
              </div>
            ))}
            {loading && <div style={{ color: '#800020', fontSize: '0.8rem', textAlign: 'center' }}>رقة تراجع مكتبتها... 🖋️</div>} [cite: 38]
            <div ref={messagesEndRef} /> [cite: 38]
          </div>

          <div style={{ padding: '10px 15px 30px', background: '#fff', borderTop: '1px solid #eee' }}> [cite: 39]
            {attachedImage && (
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                <img src={attachedImage} alt="preview" style={{ width: '60px', height: '60px', borderRadius: '10px' }} />
                <X size={14} onClick={() => setAttachedImage(null)} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <Camera size={24} color="#800020" onClick={() => handleMediaAction('camera')} style={{ cursor: 'pointer' }} /> 
                <ImageIcon size={24} color="#800020" onClick={() => handleMediaAction('gallery')} style={{ cursor: 'pointer' }} /> 
              </div>
              <input value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="اكتبي سؤالك أو برمبت هنا..." style={{ flex: 1, padding: '14px 20px', borderRadius: '30px', border: '1px solid #ddd', outline: 'none' }} onKeyPress={(e) => e.key === 'Enter' && handleManualChat(userInput)} /> [cite: 39]
              <button onClick={() => handleManualChat(userInput)} style={{ background: '#d4af37', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> [cite: 39, 40]
                <Send size={22} color="#800020" /> [cite: 39]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarriageApp; [cite: 41]
