import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Heart, Activity, ClipboardList, Pill, ShoppingBag, Calendar, 
  Send, Trash2, Camera, Mic, ChevronRight, MessageSquare, 
  Sparkles, X, Bookmark, Stethoscope, Plus, Bell, Clock, Image as ImageIcon
} from 'lucide-react';
import { CapacitorHttp } from '@capacitor/core';

import { takePhoto, fetchImage, uploadToVercel } from '../../services/MediaService';
import babyIcon from '../../assets/baby.png'; 

const PregnancyApp = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('preg_ai_v3')) || []);
  const [promptInput, setPromptInput] = useState('');
  const [pregnancyMonth, setPregnancyMonth] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  // مراقبة التمرير لتقليص الساعة
  const { scrollY } = useScroll();
  const clockScale = useTransform(scrollY, [0, 150], [1, 0.55]);
  const clockY = useTransform(scrollY, [0, 150], [0, -40]);
  const opacityInfo = useTransform(scrollY, [0, 80], [1, 0]);

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
        .app-container { background-color: #FFF5F7; min-height: 100vh; padding: 20px; font-family: 'Segoe UI', sans-serif; overflow-x: hidden; }
        .header { display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center; position: sticky; top: 0; z-index: 50; background: #FFF5F7; padding: 5px 0; }
        .ai-btn { background: linear-gradient(135deg, #7C3AED, #A78BFA); color: white; padding: 10px 15px; border-radius: 20px; border: none; cursor: pointer; font-weight: bold; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2); }
        
        /* ساعة الحمل التفاعلية */
        .clock-wrapper { position: sticky; top: 60px; z-index: 40; height: 320px; display: flex; justify-content: center; pointer-events: none; }
        .clock-section { display: flex; flex-direction: column; align-items: center; position: relative; pointer-events: auto; }
        .pregnancy-clock {
          width: 280px; height: 280px; border-radius: 50%; background: #ffffff;
          border: 10px solid #FBCFE8; box-shadow: 0 15px 30px rgba(219, 39, 119, 0.1);
          position: relative; display: flex; justify-content: center; align-items: center;
        }
        .clock-face { position: absolute; width: 100%; height: 100%; border-radius: 50%; }
        .month-label { position: absolute; font-weight: 800; color: #DB2777; font-size: 14px; width: 30px; text-align: center; }
        .baby-pointer { position: absolute; width: 65px; height: 65px; z-index: 10; transform-origin: center 140px; top: 0; }
        .baby-img { width: 100%; height: 100%; border-radius: 50%; border: 3px solid #ffffff; background: #FDF2F8; box-shadow: 0 8px 16px rgba(0,0,0,0.15); object-fit: cover; }
        .center-info { text-align: center; background: rgba(255,255,255,0.9); padding: 15px; border-radius: 50%; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
        
        .delivery-card {
          margin-top: 10px; background: white; color: #7C3AED; padding: 8px 20px;
          border-radius: 20px; font-size: 12px; font-weight: bold; border: 1.5px solid #FBCFE8;
        }

        .content-body { position: relative; z-index: 10; margin-top: -20px; }
        .quick-chat-bar { background: white; padding: 12px; border-radius: 20px; display: flex; gap: 10px; margin-bottom: 20px; border: 1px solid #FBCFE8; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        .quick-input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; }
        .category-item { background: white; border-radius: 22px; margin-bottom: 12px; border: 1px solid #FCE7F3; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.02); }
        .category-header { width: 100%; display: flex; justify-content: space-between; padding: 16px 18px; border: none; background: none; align-items: center; cursor: pointer; }
        .inputs-container { padding: 0 15px 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .custom-input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #F1F5F9; font-size: 13px; background: #F8FAFC; }
        .analyze-full-btn { grid-column: span 2; background: linear-gradient(to right, #7C3AED, #A78BFA); color: white; border: none; padding: 14px; border-radius: 15px; font-weight: bold; cursor: pointer; }
        .chat-overlay { position: fixed; inset: 0; background: white; z-index: 1000; display: flex; flex-direction: column; }
        .chat-header { background: #7C3AED; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .chat-body { flex: 1; overflow-y: auto; padding: 20px; background: #FDF2F8; }
        .msg-card { background: white; padding: 15px; border-radius: 20px; margin-bottom: 15px; }
      `}</style>

      <header className="header">
        <button className="ai-btn" onClick={() => setShowChat(true)}>
          <MessageSquare size={16} style={{marginLeft: 6}}/> طبيب AI
        </button>
        <div style={{textAlign:'right', color:'#5B21B6'}}>
          <h2 style={{fontSize:'18px', margin:0}}>متابعة الأميرة <Heart size={18} style={{display:'inline', color:'#DB2777'}} fill="#DB2777"/></h2>
        </div>
      </header>

      {/* الساعة المتقلصة ذكياً عند السكرول */}
      <div className="clock-wrapper">
        <motion.div className="clock-section" style={{ scale: clockScale, y: clockY }}>
          <div className="pregnancy-clock">
            <div className="clock-face">
              {[1,2,3,4,5,6,7,8,9].map((m) => {
                const angle = (m * 40) - 200; 
                return (
                  <div key={m} className="month-label" style={{
                    left: '50%', top: '50%',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-120px) rotate(${-angle}deg)`
                  }}>{m}</div>
                );
              })}
            </div>

            <motion.div 
              className="baby-pointer"
              animate={{ rotate: pregnancyMonth ? (parseInt(pregnancyMonth) * 40 - 200) : -160 }}
              transition={{ type: 'spring', stiffness: 45, damping: 15 }}
            >
              <img src={babyIcon} className="baby-img" alt="Baby" />
            </motion.div>

            <div className="center-info">
              <motion.div style={{ opacity: opacityInfo, fontSize: '11px', color: '#DB2777', fontWeight: 'bold' }}>الشهر</motion.div>
              <div style={{fontSize: '38px', fontWeight: '900', color: '#7C3AED', lineHeight: 1}}>{pregnancyMonth || '-'}</div>
            </div>
          </div>

          <AnimatePresence>
            {deliveryDate && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="delivery-card">
                الولادة: <span style={{color: '#DB2777'}}>{deliveryDate}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="content-body">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          whileInView={{ y: 0, opacity: 1 }}
          className="quick-chat-bar"
        >
          <Sparkles size={18} color="#7C3AED" />
          <input className="quick-input" placeholder="اسألي طبيبكِ الذكي..." value={promptInput} onChange={(e) => setPromptInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendCustomPrompt()} />
          <button onClick={sendCustomPrompt} style={{background:'none', border:'none', color:'#7C3AED'}}><Send size={18}/></button>
        </motion.div>

        <div className="category-list">
          {categories.map((cat, index) => (
            <motion.div 
              key={cat.id} 
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="category-item"
            >
              <div className="category-header" onClick={() => setActiveTab(activeTab === index ? null : index)}>
                <motion.div animate={{ rotate: activeTab === index ? 180 : 0 }} style={{color: '#7C3AED'}}>▼</motion.div>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  {cat.id === 'weeks' && (
                    <select 
                      style={{padding:'4px', borderRadius:'8px', border:'1px solid #FBCFE8', fontSize:'11px', fontWeight:'bold'}}
                      value={pregnancyMonth} 
                      onChange={(e) => { e.stopPropagation(); setPregnancyMonth(e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">الشهر</option>
                      {[1,2,3,4,5,6,7,8,9].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  )}
                  <span style={{fontWeight:'bold', color:'#5B21B6', fontSize:'15px'}}>{cat.title}</span>
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
                      <button className="analyze-full-btn" onClick={() => runAiAnalysis(index)}>
                        {loading ? 'جاري التحليل...' : `تحليل ${cat.title} وحفظ البيانات`}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* نافذة الدردشة (نفس الكود السابق لضمان الوظائف) */}
      <AnimatePresence>
        {showChat && (
          <motion.div className="chat-overlay" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
            <div className="chat-header">
              <button onClick={() => setShowChat(false)} style={{background:'none', border:'none', color:'white'}}><ChevronRight size={28}/></button>
              <div style={{fontWeight:'bold'}}>طبيب راقي AI</div>
              <button onClick={() => setChatHistory([])} style={{background:'none', border:'none', color:'white'}}><Trash2 size={20}/></button>
            </div>
            <div className="chat-body">
              {chatHistory.map(msg => (
                <div key={msg.id} className="msg-card">
                  <div style={{fontSize:'10px', color:'#7C3AED', fontWeight:'bold'}}>{msg.query}</div>
                  <p style={{fontSize:'14px', marginTop:5}}>{msg.reply}</p>
                </div>
              ))}
            </div>
            <div className="prompt-bar">
              <button className="ai-btn" onClick={() => handleMediaAction('camera')}><Camera size={20}/></button>
              <input className="custom-input" style={{flex: 1}} value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="اسألي طبيبك..." />
              <button className="ai-btn" onClick={sendCustomPrompt}><Send size={20}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PregnancyApp;
