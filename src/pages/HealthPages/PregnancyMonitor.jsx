import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Activity, ClipboardList, Pill, ShoppingBag, Calendar, 
  Send, Trash2, Camera, Mic, ChevronRight, MessageSquare, 
  Sparkles, X, Bookmark, Stethoscope, Plus, Bell, Clock, Image as ImageIcon
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

// تصحيح المسار للوصول إلى المجلد الصحيح
import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';
// استيراد صورة الطفل للمؤشر
import babyIcon from '../../assets/baby';

const PregnancyApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('preg_ai_v3')) || []);
  const [promptInput, setPromptInput] = useState('');
  const [pregnancyMonth, setPregnancyMonth] = useState('');
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

  // حساب تاريخ الولادة عند تغيير الشهر
  useEffect(() => {
    if (pregnancyMonth) {
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

  const saveAndNotify = async (categoryTitle, currentAnalysis) => {
    const savedToken = localStorage.getItem('fcm_token');
    const currentMonthNum = parseInt(pregnancyMonth) || 1;
    const dateObj = new Date();
    const monthsRemaining = 9 - currentMonthNum;
    dateObj.setMonth(dateObj.getMonth() + monthsRemaining);
    dateObj.setDate(dateObj.getDate() + 7);

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
          scheduled_for: dateObj.toISOString(),
          all_data: JSON.stringify(inputs),
          note: `تحليل آلي لـ ${categoryTitle}`
        }
      };
      await CapacitorHttp.post(saveToNeonOptions);

      if (savedToken) {
        await CapacitorHttp.post({
          url: 'https://raqqa-hjl8.vercel.app/api/send-fcm',
          headers: { 'Content-Type': 'application/json' },
          data: {
            token: savedToken,
            title: 'تقرير حمل جديد 🤰',
            body: `طبيب راقي قام بتحليل ${categoryTitle}، اضغطي للعرض.`,
            data: { type: 'medical_report' }
          }
        });
      }
    } catch (err) { console.error("خطأ في المزامنة:", err); }
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
    try {
      const response = await CapacitorHttp.post({
        url: 'https://raqqa-v6cd.vercel.app/api/raqqa-ai',
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: promptInput }
      });
      const reply = response.data.reply || response.data.message;
      setChatHistory(prev => [{ id: Date.now(), query: promptInput, reply, time: new Date().toLocaleTimeString('ar-SA') }, ...prev]);
      setPromptInput('');
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const runAiAnalysis = async (catIdx) => {
    const category = categories[catIdx];
    const dataString = inputs[category.id].map((v, i) => v ? `${category.fields[i]}: ${v}` : '').filter(v => v).join(' | ');
    if (!dataString) return;
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
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="app-container" dir="rtl">
      <style>{`
        .app-container { background-color: #FDF2F8; min-height: 100vh; padding: 20px; font-family: sans-serif; overflow-y: auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; align-items: center; }
        .ai-btn { background: #7C3AED; color: white; padding: 12px 18px; border-radius: 20px; border: none; cursor: pointer; font-weight: bold; }
        
        /* تصميم ساعة الحمل */
        .clock-section { display: flex; flex-direction: column; align-items: center; margin: 25px 0; position: relative; }
        .pregnancy-clock {
          width: 280px; height: 280px; border-radius: 50%; background: white;
          border: 10px solid #FBCFE8; box-shadow: 0 15px 35px rgba(219, 39, 119, 0.15);
          position: relative; display: flex; justify-content: center; align-items: center;
        }
        .clock-inner { width: 90%; height: 90%; border: 1px dashed #F472B6; border-radius: 50%; position: absolute; }
        .month-label {
          position: absolute; font-weight: bold; color: #BE185D; font-size: 14px;
        }
        .baby-hand {
          position: absolute; width: 65px; height: 65px; z-index: 10;
          transform-origin: center 140px; top: 0;
        }
        .baby-img {
          width: 100%; height: 100%; border-radius: 50%; border: 3px solid #7C3AED;
          background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .delivery-tag {
          margin-top: 15px; background: #7C3AED; color: white; padding: 8px 20px;
          border-radius: 20px; font-size: 13px; font-weight: bold; box-shadow: 0 4px 10px rgba(124, 58, 237, 0.3);
        }

        .quick-chat-bar { background: white; padding: 10px; border-radius: 15px; display: flex; gap: 10px; margin-bottom: 20px; border: 1px solid #FBCFE8; align-items: center; }
        .quick-input { flex: 1; border: none; outline: none; font-size: 14px; }
        .category-item { background: white; border-radius: 25px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.5); overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .category-header { width: 100%; display: flex; justify-content: space-between; padding: 18px 20px; border: none; background: none; align-items: center; }
        .inputs-container { padding: 0 15px 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .custom-input { width: 100%; padding: 10px; border-radius: 12px; border: 1px solid #F1F5F9; font-size: 12px; }
        .analyze-full-btn { grid-column: span 2; background: #7C3AED; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; }
        .chat-overlay { position: fixed; inset: 0; background: white; z-index: 1000; display: flex; flex-direction: column; }
        .chat-header { background: #7C3AED; color: white; padding: 20px; display: flex; justify-content: space-between; }
        .chat-body { flex: 1; overflow-y: auto; padding: 20px; background: #FDF2F8; }
        .msg-card { background: white; padding: 15px; border-radius: 20px; margin-bottom: 15px; }
        .prompt-bar { padding: 15px; background: white; display: flex; gap: 8px; }
      `}</style>

      <header className="header">
        <button className="ai-btn" onClick={() => setShowChat(true)}>
          <MessageSquare size={18} style={{marginLeft: 5}}/> طبيب AI
        </button>
        <div style={{textAlign:'right', color:'#5B21B6'}}>
          <h1 style={{fontSize:'22px', margin:0}}>متابعة الحمل <Plus size={24} style={{display:'inline', color:'#7C3AED'}}/></h1>
        </div>
      </header>

      {/* ساعة الحمل الأنيقة */}
      <div className="clock-section">
        <div className="pregnancy-clock">
          <div className="clock-inner"></div>
          
          {/* توزيع الأشهر على الحواف */}
          {[1,2,3,4,5,6,7,8,9].map((m) => {
            const angle = (m * 40) - 200; // زاوية التوزيع
            return (
              <div key={m} className="month-label" style={{
                transform: `rotate(${angle}deg) translateY(-120px) rotate(${-angle}deg)`
              }}>
                {m}
              </div>
            );
          })}

          {/* مؤشر الطفل المتحرك */}
          <motion.div 
            className="baby-hand"
            animate={{ rotate: pregnancyMonth ? (parseInt(pregnancyMonth) * 40 - 200) : -160 }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          >
            <img src={babyIcon} className="baby-img" alt="Baby Pointer" onError={(e) => {e.target.src="https://cdn-icons-png.flaticon.com/512/822/822118.png"}} />
          </motion.div>

          <div style={{textAlign:'center', zIndex: 5}}>
            <div style={{fontSize: '12px', color: '#F472B6'}}>الشهر الحالي</div>
            <div style={{fontSize: '38px', fontWeight: 'bold', color: '#7C3AED'}}>{pregnancyMonth || '-'}</div>
          </div>
        </div>

        {deliveryDate && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="delivery-tag">
            موعد الولادة المتوقع: {deliveryDate} 🎊
          </motion.div>
        )}
      </div>

      <div className="quick-chat-bar">
        <Sparkles size={20} color="#7C3AED" />
        <input className="quick-input" placeholder="اسألي طبيب راقي عن أي شيء..." value={promptInput} onChange={(e) => setPromptInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendCustomPrompt()} />
        <button onClick={sendCustomPrompt} style={{background:'none', border:'none', color:'#7C3AED'}}><Send size={20}/></button>
      </div>

      <div className="category-list">
        {categories.map((cat, index) => (
          <div key={cat.id} className="category-item">
            <div className="category-header">
              <button style={{background:'none', border:'none', color:'#7C3AED'}} onClick={() => setActiveTab(activeTab === index ? null : index)}>
                <div style={{transform: activeTab === index ? 'rotate(180deg)' : 'none', transition: '0.3s'}}>▼</div>
              </button>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                {cat.id === 'weeks' && (
                  <div className="month-picker">
                    <select style={{border:'none', background:'none', fontSize:'12px', fontWeight:'bold', color:'#7C3AED'}} value={pregnancyMonth} onChange={(e) => setPregnancyMonth(e.target.value)}>
                      <option value="">الشهر</option>
                      {[1,2,3,4,5,6,7,8,9].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                )}
                <span style={{fontWeight:'bold', color:'#5B21B6'}}>{cat.title}</span>
                <span style={{color:'#7C3AED'}}>{cat.icon}</span>
              </div>
            </div>

            <AnimatePresence>
              {activeTab === index && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <div className="inputs-container">
                    {cat.fields.map((field, idx) => (
                      <input key={idx} className="custom-input" placeholder={field} value={inputs[cat.id][idx]} onChange={(e) => handleUpdateInput(cat.id, idx, e.target.value)} />
                    ))}
                    <button className="analyze-full-btn" onClick={() => runAiAnalysis(index)}>
                      {loading ? 'جاري التحليل والمزامنة...' : 'تحليل الطبيب وحفظ البيانات'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Chat Overlay */}
      <AnimatePresence>
        {showChat && (
          <motion.div className="chat-overlay" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
            <div className="chat-header">
              <button onClick={() => setShowChat(false)} style={{background:'none', border:'none', color:'white'}}><ChevronRight size={28}/></button>
              <div style={{fontWeight:'bold'}}>طبيب راقي الذكي</div>
              <button onClick={() => setChatHistory([])} style={{background:'none', border:'none', color:'white'}}><Trash2 size={20}/></button>
            </div>
            <div className="chat-body">
              {chatHistory.map(msg => (
                <div key={msg.id} className="msg-card">
                  <div style={{fontSize:'10px', color:'#7C3AED', fontWeight:'bold'}}>الموضوع: {msg.query}</div>
                  <p style={{fontSize:'13px', color:'#475569', marginTop: '5px'}}>{msg.reply}</p>
                </div>
              ))}
            </div>
            <div className="prompt-bar">
              <button className="ai-btn" style={{padding:'10px'}} onClick={() => handleMediaAction('camera')}><Camera size={20}/></button>
              <input className="prompt-input" value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="اكتب سؤالك هنا..." />
              <button className="ai-btn" style={{padding:'10px'}} onClick={sendCustomPrompt}><Send size={20}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PregnancyApp;
