import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Activity, ClipboardList, Pill, ShoppingBag, Calendar, 
  Send, Trash2, Camera, Mic, ChevronRight, MessageSquare, 
  Sparkles, X, Bookmark, Stethoscope, Plus, Bell, Clock, Image as ImageIcon
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الخدمات (تأكد من صحة المسارات في مشروعك)
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';
import babyIcon from '../../assets/baby.png'; 

const PregnancyApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('preg_ai_v3')) || []);
  const [promptInput, setPromptInput] = useState('');
  
  // تعديل: تحميل شهر الحمل من التخزين المحلي عند البداية
  const [pregnancyMonth, setPregnancyMonth] = useState(localStorage.getItem('saved_preg_month') || '');
  const [deliveryDate, setDeliveryDate] = useState(''); 

  const categories = [
    { id: 'weeks', title: 'تطور الأسابيع', icon: <Calendar />, fields: ['الأسبوع الحالي', 'أعراض الأسبوع', 'ملاحظات الطبيب', 'المراجعة القادمة', 'تاريخ الولادة', 'تغيرات الوزن', 'حجم الجنين', 'نصيحة الأسبوع', 'تطور الأعضاء', 'مهام الأسبوع'] },
    { id: 'fetal', title: 'نمو الجنين', icon: <Activity />, fields: ['حركة الجنين', 'نبض القلب', 'الوزن التقديري', 'وضعية الجنين', 'السائل الأمينوسي', 'طول الفخذ', 'محيط الرأس', 'محيط البطن', 'التنفس الجنيني', 'حالة المشيمة'] },
    { id: 'mother', title: 'صحة الأم', icon: <Stethoscope />, fields: ['ضغط الدم', 'مستوى السكر', 'الوزن الحالي', 'الأعراض الشائعة', 'الحالة النفسية', 'درجة الحرارة', 'مستوى التورم', 'جودة النوم', 'النشاط البدني', 'معدل شرب الماء'] },
    { id: 'exams', title: 'الفحوصات', icon: <ClipboardList />, fields: ['تحليل الدم', 'فحص السكر', 'السونار', 'تحليل البول', 'فحوصات وراثية', 'فحص الغدة', 'نسبة الحديد', 'ضغط العين', 'تخطيط القلب', 'فحص عنق الرحم'] },
    { id: 'meds', title: 'سجل المكملات', icon: <Pill />, fields: ['حمض الفوليك', 'الحديد', 'الكالسيوم', 'فيتامين د', 'أوميغا 3', 'مغنيسيوم', 'فيتامين سي', 'بي 12', 'مكملات الغذاء', 'أدوية أخرى'] },
    { id: 'birth', title: 'الاستعداد للولادة', icon: <ShoppingBag />, fields: ['حقيبة المستشفى', 'خطة الولادة', 'تمارين التنفس', 'تجهيزات المولود', 'المستشفى', 'ملابس الأم', 'أوراق الثبوتية', 'مرافق الولادة', 'كرسي السيارة', 'ترتيبات المنزل'] },
  ];

  const [inputs, setInputs] = useState(() => {
    const state = {};
    categories.forEach(cat => state[cat.id] = Array(cat.fields.length).fill(''));
    return state;
  });

  // حساب تاريخ الولادة المتوقع وحفظ الشهر
  useEffect(() => {
    if (pregnancyMonth) {
      // حفظ الشهر في التخزين المحلي ليبقى عند الخروج والعودة
      localStorage.setItem('saved_preg_month', pregnancyMonth);

      const currentMonthNum = parseInt(pregnancyMonth);
      if (currentMonthNum >= 1 && currentMonthNum <= 9) {
        const monthsRemaining = 9 - currentMonthNum;
        const projectedDate = new Date();
        projectedDate.setMonth(projectedDate.getMonth() + monthsRemaining);
        projectedDate.setDate(projectedDate.getDate() + 7);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        setDeliveryDate(projectedDate.toLocaleDateString('ar-SA', options));
      }
    }
  }, [pregnancyMonth]);

  const handleUpdateInput = (catId, idx, val) => {
    setInputs(prev => ({ ...prev, [catId]: prev[catId].map((v, i) => i === idx ? val : v) }));
  };

  // دالة الحفظ والمزامنة - تم تعديلها لترسل البيانات لـ Neon فقط وحذف أي دالة أخرى
  const saveAndNotify = async (categoryTitle, currentAnalysis) => {
    const savedToken = localStorage.getItem('fcm_token');
    
    try {
      const saveToNeonOptions = {
        url: 'https://raqqa-hjl8.vercel.app/api/save-notifications',
        headers: { 'Content-Type': 'application/json' },
        data: {
          fcmToken: savedToken || undefined,
          user_id: 1,
          category: 'pregnancy_followup',
          title: `تحديث طبي: ${categoryTitle} 🩺`,
          body: currentAnalysis.substring(0, 100) + "...",
          all_data: JSON.stringify(inputs),
          // إرسال تاريخ الحمل الحالي وتاريخ الولادة المتوقع كما طلبتم
          pregnancy_month: pregnancyMonth,
          expected_delivery_date: deliveryDate,
          note: `تحليل آلي لـ ${categoryTitle}`
        }
      };
      
      await CapacitorHttp.post(saveToNeonOptions);

    } catch (err) {
      console.error("خطأ المزامنة مع نيون:", err);
    }
  };

  const handleMediaAction = async (sourceType) => {
    try {
      const base64Data = sourceType === 'camera' ? await takePhoto() : await fetchImage();
      if (!base64Data) return;
      setIsProcessing(true);
      setShowChat(true);
      const userMsgId = Date.now();
      const fileName = `preg_img_${userMsgId}.png`;
      const finalAttachmentUrl = await uploadToVercel(base64Data, fileName, 'image/png');
      
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `بصفتك خبير، حلل هذه الصورة الطبية المتعلقة بالحمل: ${finalAttachmentUrl}` }
      });

      if (response.status === 200) {
        const aiReply = response.data.reply || "تم التحليل بنجاح.";
        setChatHistory(prev => [{ id: Date.now(), query: "تحليل صورة", reply: aiReply, time: new Date().toLocaleTimeString('ar-SA') }, ...prev]);
        await saveAndNotify("تحليل وسائط", aiReply);
      }
    } catch (error) { console.error(error); } finally { setIsProcessing(false); }
  };

  const sendCustomPrompt = async () => {
    if (!promptInput.trim()) return;
    setLoading(true);
    setShowChat(true);
    const userQuery = promptInput;
    setPromptInput('');
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: userQuery }
      });
      const reply = response.data.reply || response.data.message;
      setChatHistory(prev => [{ id: Date.now(), query: userQuery, reply, time: new Date().toLocaleTimeString('ar-SA') }, ...prev]);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const runAiAnalysis = async (catIdx) => {
    const category = categories[catIdx];
    const dataString = inputs[category.id].map((v, i) => v ? `${category.fields[i]}: ${v}` : '').filter(v => v).join(' | ');
    
    if (!dataString) {
      alert("الرجاء إدخال بعض البيانات أولاً للتحليل");
      return;
    }

    setLoading(true);
    setShowChat(true);
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `حللي بيانات ${category.title} للحامل: ${dataString}` }
      });
      const reply = response.data.reply || response.data.message;
      setChatHistory(prev => [{ id: Date.now(), query: category.title, reply, time: new Date().toLocaleTimeString('ar-SA') }, ...prev]);
      await saveAndNotify(category.title, reply);
    } catch (err) { console.error("فشل التحليل:", err); }
    setLoading(false);
  };

  return (
    <div className="app-container" dir="rtl">
      <style>{`
        .app-container { background-color: #FDF2F8; min-height: 100vh; padding: 20px; font-family: 'Segoe UI', Tahoma, sans-serif; overflow-y: auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 25px; align-items: center; }
        .ai-btn { background: #E9D5FF; color: #7C3AED; padding: 12px 20px; border-radius: 20px; border: none; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(124, 58, 237, 0.1); }
        
        .pregnancy-clock-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; }
        .clock-outer {
          width: 260px; height: 260px; border-radius: 50%; background: white;
          border: 12px solid #FBCFE8; box-shadow: 0 10px 25px rgba(219, 39, 119, 0.15);
          position: relative; display: flex; justify-content: center; align-items: center;
        }
        .month-mark {
          position: absolute; font-weight: 900; color: #DB2777; font-size: 16px; width: 30px; text-align: center;
        }
        .clock-hand-container { position: absolute; width: 100%; height: 100%; top: 0; left: 0; }
        .baby-pointer-img {
          position: absolute; width: 65px; height: 65px; border-radius: 50%;
          border: 4px solid white; background: #FDF2F8; box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          top: -15px; left: calc(50% - 32.5px); object-fit: cover;
        }
        .center-display { text-align: center; z-index: 5; }
        
        .quick-chat-bar { background: white; padding: 12px; border-radius: 20px; display: flex; gap: 10px; margin-bottom: 25px; border: 1.5px solid #FBCFE8; align-items: center; }
        .quick-input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; }
        .category-item { background: white; border-radius: 25px; margin-bottom: 15px; border: 1px solid #FCE7F3; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
        .category-header { width: 100%; display: flex; justify-content: space-between; padding: 18px 20px; border: none; background: none; align-items: center; cursor: pointer; }
        .inputs-container { padding: 0 15px 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .custom-input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #F1F5F9; font-size: 13px; background: #F8FAFC; }
        .analyze-full-btn { grid-column: span 2; background: #7C3AED; color: white; border: none; padding: 14px; border-radius: 15px; font-weight: bold; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; }
        
        .chat-overlay { position: fixed; inset: 0; background: white; z-index: 1000; display: flex; flex-direction: column; }
        .chat-header { background: #7C3AED; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .chat-body { flex: 1; overflow-y: auto; padding: 20px; background: #FDF2F8; }
        .msg-card { background: white; padding: 15px; border-radius: 20px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
      `}</style>

      <header className="header">
        <button className="ai-btn" onClick={() => setShowChat(true)}>
          <MessageSquare size={18}/> طبيب راقي
        </button>
        <div style={{textAlign:'right', color:'#5B21B6'}}>
          <h2 style={{fontSize:'20px', margin:0}}>متابعة الحمل <Heart size={20} style={{display:'inline', color:'#DB2777'}} fill="#DB2777"/></h2>
        </div>
      </header>

      <div className="pregnancy-clock-section">
        <div className="clock-outer">
          {[1,2,3,4,5,6,7,8,9].map((m) => {
            const angle = (m * 40) - 200; 
            return (
              <div key={m} className="month-mark" style={{
                left: '50%', top: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-110px) rotate(${-angle}deg)`
              }}>{m}</div>
            );
          })}

          <motion.div 
            className="clock-hand-container"
            animate={{ rotate: pregnancyMonth ? (parseInt(pregnancyMonth) * 40 - 200) : -160 }}
            transition={{ type: 'spring', stiffness: 40, damping: 12 }}
          >
            <img src={babyIcon} className="baby-pointer-img" alt="Baby" />
            <div style={{width: 4, height: 100, background: '#DB2777', margin: '0 auto', marginTop: 30, borderRadius: 2}}></div>
          </motion.div>

          <div className="center-display">
            <div style={{fontSize: '12px', color: '#DB2777', fontWeight: 'bold'}}>الشهر</div>
            <div style={{fontSize: '48px', fontWeight: '900', color: '#7C3AED', lineHeight: 1}}>{pregnancyMonth || '-'}</div>
          </div>
        </div>
        
        {deliveryDate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{marginTop: 20, color: '#7C3AED', fontWeight: 'bold', fontSize: '14px', background: 'white', padding: '8px 20px', borderRadius: 20, border: '1px solid #FBCFE8'}}>
            موعد الولادة المتوقع: <span style={{color: '#DB2777'}}>{deliveryDate}</span>
          </motion.div>
        )}
      </div>

      <div className="quick-chat-bar">
        <Sparkles size={20} color="#7C3AED" />
        <input className="quick-input" placeholder="اسألي عن أي عرض أو استشارة..." value={promptInput} onChange={(e) => setPromptInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendCustomPrompt()} />
        <button onClick={sendCustomPrompt} style={{background:'none', border:'none', color:'#7C3AED'}}><Send size={20}/></button>
      </div>

      <div className="category-list">
        {categories.map((cat, index) => (
          <motion.div layout key={cat.id} className="category-item">
            <div className="category-header" onClick={() => setActiveTab(activeTab === index ? null : index)}>
              <div style={{transform: activeTab === index ? 'rotate(180deg)' : 'none', transition: '0.3s', color: '#7C3AED'}}>▼</div>
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                {cat.id === 'weeks' && (
                  <select 
                    style={{padding:'4px 8px', borderRadius:'10px', border:'1px solid #7C3AED', color:'#7C3AED', fontWeight:'bold', fontSize:'12px'}}
                    value={pregnancyMonth} 
                    onChange={(e) => { e.stopPropagation(); setPregnancyMonth(e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">اختر الشهر</option>
                    {[1,2,3,4,5,6,7,8,9].map(m => <option key={m} value={m}>شهر {m}</option>)}
                  </select>
                )}
                <span style={{fontWeight:'bold', color:'#5B21B6'}}>{cat.title}</span>
                <span style={{color:'#DB2777'}}>{cat.icon}</span>
              </div>
            </div>

            <AnimatePresence>
              {activeTab === index && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <div className="inputs-container">
                    {cat.fields.map((field, idx) => (
                      <input key={idx} className="custom-input" placeholder={field} value={inputs[cat.id][idx]} onChange={(e) => handleUpdateInput(cat.id, idx, e.target.value)} />
                    ))}
                    <button 
                      className="analyze-full-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        runAiAnalysis(index);
                      }}
                    >
                      <Sparkles size={18}/>
                      {loading ? 'جاري التحليل والمزامنة...' : 'تحليل الطبيب وحفظ البيانات'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showChat && (
          <motion.div className="chat-overlay" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
            <div className="chat-header">
              <button onClick={() => setShowChat(false)} style={{background:'none', border:'none', color:'white'}}><ChevronRight size={28}/></button>
              <div style={{fontWeight:'bold'}}>طبيب راقي - المستشار الذكي</div>
              <button onClick={() => setChatHistory([])} style={{background:'none', border:'none', color:'white'}}><Trash2 size={20}/></button>
            </div>
            <div className="chat-body">
              {chatHistory.map(msg => (
                <div key={msg.id} className="msg-card">
                  <div style={{fontSize:'11px', color:'#7C3AED', fontWeight:'bold', marginBottom: 5}}>متابعة: {msg.query}</div>
                  <p style={{fontSize:'14px', color:'#334155', lineHeight: 1.6}}>{msg.reply}</p>
                </div>
              ))}
              {loading && <div style={{textAlign:'center', padding: 10, color: '#7C3AED'}}>جاري معالجة طلبك...</div>}
            </div>
            <div className="prompt-bar" style={{padding:'10px', display:'flex', gap:'5px', background:'white'}}>
              <button className="ai-btn" style={{padding:'10px'}} onClick={() => handleMediaAction('camera')}><Camera size={22}/></button>
              <input className="custom-input" style={{flex: 1}} value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="اسألي عن الأعراض أو التحاليل..." />
              <button className="ai-btn" style={{padding:'10px'}} onClick={sendCustomPrompt}><Send size={22}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PregnancyApp;
